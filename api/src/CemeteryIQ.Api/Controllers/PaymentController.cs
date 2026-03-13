using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;

    public PaymentController(IConfiguration config, AppDbContext db, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _db = db;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Tạo URL thanh toán VNPay. Hash tính theo đúng VNPay Java demo:
    /// hashData = rawKey=URLEncode(value), sorted, joined &, HMAC-SHA512.
    /// </summary>
    [HttpPost("vnpay/create")]
    public ActionResult<VNPayCreateResponse> CreateVNPay([FromBody] VNPayCreateRequest request)
    {
        var tmnCode    = _config["VNPay:TmnCode"]    ?? throw new InvalidOperationException("VNPay:TmnCode missing");
        var hashSecret = _config["VNPay:HashSecret"] ?? throw new InvalidOperationException("VNPay:HashSecret missing");
        var paymentUrl = _config["VNPay:PaymentUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var returnUrl  = _config["VNPay:ReturnUrl"]  ?? "http://localhost:3000/payment/result";
        var ipnUrl     = _config["VNPay:IpnUrl"];

        var rawIp  = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var ipAddr = Request.Headers["X-Forwarded-For"].FirstOrDefault()
                     ?? (rawIp == "::1" ? "127.0.0.1" : rawIp);

        var now        = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "SE Asia Standard Time");
        var txnRef     = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        var createDate = now.ToString("yyyyMMddHHmmss");
        var expireDate = now.AddMinutes(15).ToString("yyyyMMddHHmmss");

        // Dùng Ordinal sort, khớp với Java Collections.sort (ASCII order)
        var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Amount"]     = ((long)(request.Amount * 100)).ToString(),
            ["vnp_Command"]    = "pay",
            ["vnp_CreateDate"] = createDate,
            ["vnp_CurrCode"]   = "VND",
            ["vnp_ExpireDate"] = expireDate,
            ["vnp_IpAddr"]     = ipAddr,
            ["vnp_Locale"]     = "vn",
            ["vnp_OrderInfo"]  = request.OrderInfo,
            ["vnp_OrderType"]  = "other",
            ["vnp_ReturnUrl"]  = returnUrl,
            ["vnp_TmnCode"]    = tmnCode,
            ["vnp_TxnRef"]     = txnRef,
            ["vnp_Version"]    = "2.1.0",
        };

        if (!string.IsNullOrWhiteSpace(ipnUrl))
            vnpParams["vnp_IpnUrl"] = ipnUrl;

        // ── Build query string = hash data (khớp VNPay C# lib: VnPayLibrary) ──
        // Hash data = URL-encoded query string: encode(key)=encode(value)
        // Bỏ qua giá trị rỗng (như VnPayLibrary)
        var sb = new StringBuilder();
        foreach (var (k, v) in vnpParams)
        {
            if (string.IsNullOrEmpty(v)) continue;
            if (sb.Length > 0) sb.Append('&');
            sb.Append(WebUtility.UrlEncode(k));
            sb.Append('=');
            sb.Append(WebUtility.UrlEncode(v));
        }
        var queryString = sb.ToString();  // dùng cho cả hash lẫn URL
        var secureHash  = HmacSha512(hashSecret, queryString);

        // --- DEBUG ---
        Console.WriteLine($"[VNPay] secret_len={hashSecret.Length}  tmnCode={tmnCode}");
        Console.WriteLine($"[VNPay] hashData  ={queryString}");
        Console.WriteLine($"[VNPay] secureHash={secureHash}");
        // -------------

        var payUrl = $"{paymentUrl}?{queryString}&vnp_SecureHash={secureHash}";

        return Ok(new VNPayCreateResponse(payUrl, txnRef));
    }

    /// <summary>
    /// Xác thực chữ ký VNPay sau khi redirect về.
    /// Frontend gửi params (đã URL-decoded bởi useSearchParams) → re-encode trước khi hash.
    /// </summary>
    [HttpPost("vnpay/verify")]
    public async Task<ActionResult<VNPayVerifyResponse>> VerifyVNPay([FromBody] VNPayVerifyRequest request)
    {
        var hashSecret = _config["VNPay:HashSecret"] ?? throw new InvalidOperationException("VNPay:HashSecret missing");

        var sorted = new SortedDictionary<string, string>(
            request.Params
                   .Where(p => p.Key != "vnp_SecureHash" && p.Key != "vnp_SecureHashType")
                   .ToDictionary(p => p.Key, p => p.Value),
            StringComparer.Ordinal);

        // Hash data: rawKey=URLEncode(value), khớp VNPay Java demo
        var sb = new StringBuilder();
        foreach (var (k, v) in sorted)
        {
            if (string.IsNullOrEmpty(v)) continue;
            if (sb.Length > 0) sb.Append('&');
            sb.Append(k);
            sb.Append('=');
            sb.Append(WebUtility.UrlEncode(v));
        }

        var hashData     = sb.ToString();
        var computedHash = HmacSha512(hashSecret, hashData);

        if (!string.Equals(computedHash, request.SecureHash, StringComparison.OrdinalIgnoreCase))
            return Ok(new VNPayVerifyResponse(false, "Chữ ký không hợp lệ"));

        var responseCode = request.Params.GetValueOrDefault("vnp_ResponseCode", "");
        var isSuccess    = responseCode == "00";

        if (isSuccess && !string.IsNullOrEmpty(request.PlotId))
        {
            var plot = await _db.Plots.FindAsync(request.PlotId);
            if (plot is not null && plot.Status != PlotStatus.Occupied)
            {
                plot.Status = PlotStatus.Occupied;
                await _db.SaveChangesAsync();
            }
        }

        return Ok(new VNPayVerifyResponse(
            isSuccess,
            isSuccess ? "Thanh toán xác thực thành công" : "Thanh toán thất bại"));
    }

    /// <summary>
    /// VNPay IPN — server-to-server (cần public URL, không dùng cho localhost).
    /// </summary>
    [HttpGet("vnpay/ipn")]
    public async Task<IActionResult> VNPayIPN([FromQuery] Dictionary<string, string> queryParams)
    {
        var hashSecret = _config["VNPay:HashSecret"] ?? "";

        if (!queryParams.TryGetValue("vnp_SecureHash", out var secureHash))
            return Ok(new { RspCode = "97", Message = "Missing secure hash" });

        var sorted = new SortedDictionary<string, string>(
            queryParams.Where(p => p.Key != "vnp_SecureHash" && p.Key != "vnp_SecureHashType")
                       .ToDictionary(p => p.Key, p => p.Value),
            StringComparer.Ordinal);

        // IPN: VNPay gọi server, query params đã URL-decoded bởi ASP.NET → re-encode
        var sb = new StringBuilder();
        foreach (var (k, v) in sorted)
        {
            if (string.IsNullOrEmpty(v)) continue;
            if (sb.Length > 0) sb.Append('&');
            sb.Append(k);
            sb.Append('=');
            sb.Append(WebUtility.UrlEncode(v));
        }

        var computedHash = HmacSha512(hashSecret, sb.ToString());

        if (!string.Equals(computedHash, secureHash, StringComparison.OrdinalIgnoreCase))
            return Ok(new { RspCode = "97", Message = "Invalid Signature" });

        var responseCode = queryParams.GetValueOrDefault("vnp_ResponseCode", "");
        var orderInfo    = queryParams.GetValueOrDefault("vnp_OrderInfo", "");
        var plotId       = ExtractPlotIdFromOrderInfo(orderInfo);

        if (responseCode == "00" && !string.IsNullOrEmpty(plotId))
        {
            var plot = await _db.Plots.FindAsync(plotId);
            if (plot is not null && plot.Status != PlotStatus.Occupied)
            {
                plot.Status = PlotStatus.Occupied;
                await _db.SaveChangesAsync();
            }
        }

        return Ok(new { RspCode = "00", Message = "Confirm Success" });
    }

    // ── MoMo ──

    /// <summary>
    /// Tạo URL thanh toán MoMo. Signature: HMAC-SHA256.
    /// Raw: accessKey=&amp;amount=&amp;extraData=&amp;ipnUrl=&amp;orderId=&amp;orderInfo=&amp;partnerCode=&amp;redirectUrl=&amp;requestId=&amp;requestType=
    /// </summary>
    [HttpPost("momo/create")]
    public async Task<ActionResult<MoMoCreateResponse>> CreateMoMo([FromBody] MoMoCreateRequest request)
    {
        var partnerCode = _config["MoMo:PartnerCode"] ?? "MOMO";
        var accessKey   = _config["MoMo:AccessKey"]   ?? throw new InvalidOperationException("MoMo:AccessKey missing");
        var secretKey   = _config["MoMo:SecretKey"]   ?? throw new InvalidOperationException("MoMo:SecretKey missing");
        var endpoint    = _config["MoMo:Endpoint"]    ?? "https://test-payment.momo.vn/v2/gateway/api/create";
        var redirectUrl = _config["MoMo:RedirectUrl"] ?? "http://localhost:3000/payment/momo-result";
        var ipnUrl      = _config["MoMo:IpnUrl"]      ?? "";
        var requestType = "payWithMethod";

        var orderId   = partnerCode + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var requestId = orderId;
        var extraData = "";
        var orderGroupId = "";

        // Signature: HMAC-SHA256, sorted alphabetically by key
        var rawSignature = $"accessKey={accessKey}&amount={request.Amount}&extraData={extraData}" +
                           $"&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={request.OrderInfo}" +
                           $"&partnerCode={partnerCode}&redirectUrl={redirectUrl}" +
                           $"&requestId={requestId}&requestType={requestType}";

        var signature = HmacSha256(secretKey, rawSignature);

        Console.WriteLine($"[MoMo] rawSignature={rawSignature}");
        Console.WriteLine($"[MoMo] signature={signature}");

        var body = new
        {
            partnerCode,
            partnerName  = "An Nghi Vien",
            storeId      = "ANV001",
            requestId,
            amount       = request.Amount,
            orderId,
            orderInfo    = request.OrderInfo,
            redirectUrl,
            ipnUrl,
            lang         = "vi",
            requestType,
            autoCapture  = true,
            extraData,
            orderGroupId,
            signature
        };

        var client   = _httpClientFactory.CreateClient();
        var content  = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(endpoint, content);
        var json     = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"[MoMo] response={json}");

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var resultCode = root.TryGetProperty("resultCode", out var rc) ? rc.GetInt32() : -1;
        if (resultCode != 0)
        {
            var errMsg = root.TryGetProperty("message", out var m) ? m.GetString() : "MoMo error";
            return BadRequest(new { message = errMsg, resultCode });
        }

        var payUrl = root.GetProperty("payUrl").GetString()!;
        return Ok(new MoMoCreateResponse(payUrl, orderId));
    }

    /// <summary>
    /// Xác thực chữ ký MoMo sau khi redirect về.
    /// Raw: accessKey=&amp;amount=&amp;extraData=&amp;message=&amp;orderId=&amp;orderInfo=&amp;orderType=&amp;partnerCode=&amp;payType=&amp;requestId=&amp;responseTime=&amp;resultCode=&amp;transId=
    /// </summary>
    [HttpPost("momo/verify")]
    public async Task<ActionResult<MoMoVerifyResponse>> VerifyMoMo([FromBody] MoMoVerifyRequest request)
    {
        var accessKey = _config["MoMo:AccessKey"] ?? throw new InvalidOperationException("MoMo:AccessKey missing");
        var secretKey = _config["MoMo:SecretKey"] ?? throw new InvalidOperationException("MoMo:SecretKey missing");

        var p = request.Params;
        string G(string key) => p.GetValueOrDefault(key, "");

        var rawSignature = $"accessKey={accessKey}&amount={G("amount")}&extraData={G("extraData")}" +
                           $"&message={G("message")}&orderId={G("orderId")}&orderInfo={G("orderInfo")}" +
                           $"&orderType={G("orderType")}&partnerCode={G("partnerCode")}" +
                           $"&payType={G("payType")}&requestId={G("requestId")}" +
                           $"&responseTime={G("responseTime")}&resultCode={G("resultCode")}" +
                           $"&transId={G("transId")}";

        var computed = HmacSha256(secretKey, rawSignature);
        var received = G("signature");

        Console.WriteLine($"[MoMo verify] computed={computed}");
        Console.WriteLine($"[MoMo verify] received={received}");

        if (!string.Equals(computed, received, StringComparison.OrdinalIgnoreCase))
            return Ok(new MoMoVerifyResponse(false, "Chữ ký không hợp lệ"));

        var resultCode = int.TryParse(G("resultCode"), out var rc) ? rc : -1;
        var isSuccess  = resultCode == 0;

        if (isSuccess && !string.IsNullOrEmpty(request.PlotId))
        {
            var plot = await _db.Plots.FindAsync(request.PlotId);
            if (plot is not null && plot.Status != PlotStatus.Occupied)
            {
                plot.Status = PlotStatus.Occupied;
                await _db.SaveChangesAsync();
            }
        }

        return Ok(new MoMoVerifyResponse(
            isSuccess,
            isSuccess ? "Thanh toán xác thực thành công" : "Thanh toán thất bại"));
    }

    /// <summary>
    /// MoMo IPN — server-to-server callback.
    /// </summary>
    [HttpPost("momo/ipn")]
    public async Task<IActionResult> MoMoIPN([FromBody] JsonElement body)
    {
        var accessKey = _config["MoMo:AccessKey"] ?? "";
        var secretKey = _config["MoMo:SecretKey"] ?? "";

        string G(string key) => body.TryGetProperty(key, out var v) ? v.GetRawText().Trim('"') : "";

        var rawSignature = $"accessKey={accessKey}&amount={G("amount")}&extraData={G("extraData")}" +
                           $"&message={G("message")}&orderId={G("orderId")}&orderInfo={G("orderInfo")}" +
                           $"&orderType={G("orderType")}&partnerCode={G("partnerCode")}" +
                           $"&payType={G("payType")}&requestId={G("requestId")}" +
                           $"&responseTime={G("responseTime")}&resultCode={G("resultCode")}" +
                           $"&transId={G("transId")}";

        var computed = HmacSha256(secretKey, rawSignature);
        var received = G("signature");

        if (!string.Equals(computed, received, StringComparison.OrdinalIgnoreCase))
            return Ok(new { resultCode = 97, message = "Invalid signature" });

        var resultCode = int.TryParse(G("resultCode"), out var rc) ? rc : -1;
        if (resultCode == 0)
        {
            var orderInfo = G("orderInfo");
            var plotId    = ExtractPlotIdFromOrderInfo(orderInfo);
            if (!string.IsNullOrEmpty(plotId))
            {
                var plot = await _db.Plots.FindAsync(plotId);
                if (plot is not null && plot.Status != PlotStatus.Occupied)
                {
                    plot.Status = PlotStatus.Occupied;
                    await _db.SaveChangesAsync();
                }
            }
        }

        return Ok(new { resultCode = 0, message = "Confirmed" });
    }

    // ── Helpers ──

    private static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();
    }

    private static string HmacSha256(string key, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();
    }

    private static string? ExtractPlotIdFromOrderInfo(string orderInfo)
    {
        if (string.IsNullOrWhiteSpace(orderInfo)) return null;
        var lastSpace = orderInfo.LastIndexOf(' ');
        return lastSpace >= 0 ? orderInfo[(lastSpace + 1)..] : orderInfo;
    }
}
