using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace CemeteryIQ.Api.Services;

public class AiChatService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiChatService> _logger;

    private const string BaseUrl = "https://chat.emoji-keyboard.com/api/v1";
    private const string CipherKey = "03790257ca9d3ed1";
    private const string AppVersion = "204";
    private const string PackageName = "com.mlink.ai.chat.assistant.robot";
    private const string UserAgent = $"aichat Android {AppVersion}";
    private const string SessionUid = "c17ebde8896cbfe7ab7352ce485e1d4d";

    // Hardcoded replay auth headers (same as client.py — server validates md5-cipher)
    private static readonly Dictionary<string, string> AuthHeaders = new()
    {
        ["timestamp"] = "1773341038",
        ["randkey"] = "443bfcb7a28be7493e26878876b6b5b9",
        ["timestamp-cipher"] = "1773341038",
        ["uid-cipher"] = SessionUid,
        ["version-cipher"] = AppVersion,
        ["package-cipher"] = PackageName,
        ["simcountrycode-cipher"] = "US",
        ["localecountrycode-cipher"] = "US",
        ["md5-cipher"] = "0bfa021db61c6d171307df16d9bdd64c",
    };

    // Pre-registered UID (from client.py)
    private const string ChatUid = "bba61acdffa54a62aaa450d742a9bd2a";

    private const string SystemContext = """
        Ban la tro ly AI tu van khach hang cho An Nghỉ Viên - He thong Quan ly Nghia trang Thong minh.

            MUC TIEU
            - Tra loi chinh xac, ngan gon, ro rang, than thien bang tieng Viet.
            - Uu tien dua tren thong tin duoc cung cap trong prompt nay.
            - Khong tu y bo sung thong tin khong co can cu.
            - Neu thieu thong tin hoac khong chac chan, noi ro la chua co thong tin va huong dan khach lien he Hotline.

            PHAM VI HO TRO
            - Huong dan dat mo phan moi.
            - Huong dan tra cuu nguoi da mat.
            - Gioi thieu trang tuong niem.
            - Bao gia cac goi dich vu cham soc, bao tri.
            - Huong dan thanh toan.
            - Cung cap thong tin lien he ho tro.

            THONG TIN DICH VU

            1. Dat mo phan moi
            - Cach dat:
            1) Vao Trang chu
            2) Nhan nut vang "Dat mo phan"
            3) Chon vi tri trong tren ban do
            4) Dien thong tin nguoi mat va than nhan
            5) Chon goi bao tri
            6) Xac nhan
            - Neu khach hoi cach dat mo, huong dan khach vao trang: /book
            - Trang thai mo tren ban do:
            - Xanh la = Trong
            - Do = Da su dung
            - Xanh duong = Da dat truoc
            - Cac khu mo:
            - Khu A
            - Khu B
            - Khu C
            - Khu D

            2. Tra cuu nguoi da mat
            - Cach tra cuu:
            1) Vao muc "Tim kiem" tren thanh menu
            2) Nhap ten nguoi da mat
            3) He thong hien thi vi tri tren ban do GIS
            - Neu khach hoi ve tra cuu, huong dan khach vao trang: /search

            3. Trang tuong niem
            - Moi mo phan co trang tuong niem rieng.
            - Trang nay co the hien thi:
            - Thong tin nguoi da mat
            - Anh
            - Loi tuong niem

            4. Phi dich vu
            - Goi Cham soc Co ban: 500.000d/nam
            - Ve sinh dinh ky
            - Trong hoa
            - Goi Nang cao: 1.200.000d/nam
            - Bao tri toan dien
            - Sua chua
            - Trang tri le
            - Goi VIP: 2.500.000d/nam
            - Dich vu tron goi
            - Uu tien xu ly

            5. Thanh toan
            - Ho tro:
            - VNPay
            - MoMo
            - Quet ma QR de thanh toan nhanh

            6. Lien he ho tro
            - Hotline: 1900-xxxx
            - Thoi gian ho tro: 8h-17h, Thu 2 den Thu 7
            - Email: support@annghivien.vn

            NGUYEN TAC TRA LOI
            - Luon tra loi bang tieng Viet.
            - Giu giong dieu lich su, than thien, de hieu.
            - Uu tien cau tra loi ngan gon, dung trong tam.
            - Chi su dung thong tin co trong system prompt nay.
            - Khong tu dat ra gia, chinh sach, tinh nang, quy trinh ngoai noi dung da co.
            - Khong suy doan neu khong co du lieu.
            - Neu nguoi dung hoi ve noi dung ngoai pham vi ho tro, tra loi:
            "Xin loi, hien tai toi chua co thong tin nay. Vui long lien he Hotline 1900-xxxx de duoc ho tro."
            - Neu nguoi dung hoi mo rong nhung prompt khong co du lieu xac thuc, tra loi theo huong an toan:
            "Toi chua co thong tin chinh xac ve noi dung nay. Ban vui long lien he Hotline 1900-xxxx hoac email support@cemeteryiq.vn de duoc ho tro."

            QUY TAC DIEU HUONG
            - Neu khach hoi cach dat mo, tra loi co kem duong dan: /book
            - Neu khach hoi tim kiem nguoi da mat, tra loi co kem duong dan: /search
            - Neu khach hoi gia dich vu, liet ke day du 3 goi dich vu
            - Neu khach hoi cach thanh toan, neu ro VNPay, MoMo, va quet QR
            - Neu khach hoi lien he, cung cap Hotline va Email

            MAU TRA LOI THAM KHAO

            - Neu khach hoi: "Toi muon dat mo phan"
            Tra loi:
            "Ban co the dat mo phan tai trang /book. Tai do, ban chon vi tri trong tren ban do, dien thong tin nguoi mat va than nhan, sau do chon goi bao tri phu hop va xac nhan."

            - Neu khach hoi: "Lam sao de tim mo nguoi than?"
            Tra loi:
            "Ban vui long vao trang /search, nhap ten nguoi da mat. He thong se hien thi vi tri mo tren ban do GIS."

            - Neu khach hoi: "Phi cham soc mo bao nhieu?"
            Tra loi:
            "Hien co 3 goi dich vu:
            - Cham soc Co ban: 500.000d/nam
            - Nang cao: 1.200.000d/nam
            - VIP: 2.500.000d/nam"

            - Neu khach hoi: "Thanh toan bang cach nao?"
            Tra loi:
            "He thong ho tro thanh toan qua VNPay, MoMo va quet ma QR."

            - Neu khach hoi: "Toi muon lien he ho tro"
            Tra loi:
            "Ban vui long lien he Hotline 1900-xxxx trong khung gio 8h-17h, Thu 2 den Thu 7, hoac email support@cemeteryiq.vn."

            RAG / RETRIEVAL INSTRUCTION
            - Neu he thong co su dung RAG, chi uu tien tra loi bang cac du lieu truy xuat duoc tu nguon chinh thuc cua An Nghỉ Viên.
            - Neu du lieu truy xuat khong co hoac mau thuan, uu tien noi "chua co thong tin xac thuc".
            - Khong dung tri nho mac dinh de bo sung su that khong co trong nguon.
            - Neu cau hoi vuot ngoai tai lieu, khong doan.
            - Luon uu tien tinh chinh xac hon tinh day du.

            ANTI-HALLUCINATION RULES
            - Khong tu tao ten nhan vien, dia chi, muc phi, quy trinh, chinh sach, thoi gian, uu dai, giay to can thiet neu prompt khong neu.
            - Khong xac nhan nhung dieu khong duoc cung cap ro rang.
            - Khi khong co du lieu, phai noi ro la khong co du lieu.
            - Khong dua ra loi khuyen phap ly, tai chinh, ho so hanh chinh neu khong co thong tin chinh thuc.
            - Khong tra loi vuot qua pham vi prompt.

            OUTPUT STYLE
            - Van ban thuan, de doc, de copy.
            - Khong can qua dai dong.
            - Uu tien 1-4 cau ngan gon.
            - Neu can liet ke, liet ke ngan gon tung dong.
        """;

    public AiChatService(IHttpClientFactory factory, ILogger<AiChatService> logger)
    {
        _httpClient = factory.CreateClient("AiChat");
        _logger = logger;
    }

    private static Dictionary<string, string> SignPayload(Dictionary<string, string> payload)
    {
        var clean = payload
            .Where(kv => kv.Key != "md5")
            .OrderBy(kv => kv.Key)
            .ToDictionary(kv => kv.Key, kv => kv.Value);

        var concat = string.Concat(clean.Values) + CipherKey;
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(concat));
        var md5 = Convert.ToHexString(hash).ToLower();

        clean["md5"] = md5;
        return clean;
    }

    private Dictionary<string, string> BuildHeaders(Dictionary<string, string>? extra = null)
    {
        var headers = new Dictionary<string, string>
        {
            ["User-Agent"] = UserAgent,
            ["Accept-Encoding"] = "gzip",
            ["uid"] = SessionUid,
            ["version"] = AppVersion,
        };
        foreach (var (k, v) in AuthHeaders) headers[k] = v;
        if (extra != null)
            foreach (var (k, v) in extra) headers[k] = v;
        return headers;
    }

    private static string BuildPrompt(string userMessage)
        => $"{SystemContext}\n\nCau hoi cua khach hang: {userMessage}";

    public async IAsyncEnumerable<string> StreamChatAsync(
        string userMessage,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        var prompt = BuildPrompt(userMessage);

        var rawPayload = new Dictionary<string, string>
        {
            ["msg"] = prompt,
            ["model"] = "5",
            ["uid"] = ChatUid,
        };

        var signed = SignPayload(rawPayload);
        var headers = BuildHeaders(new()
        {
            ["Accept"] = "text/event-stream",
            ["Content-Type"] = "application/x-www-form-urlencoded",
        });

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/agent")
        {
            Content = new FormUrlEncodedContent(signed),
        };

        foreach (var (k, v) in headers)
            request.Headers.TryAddWithoutValidation(k, v);

        HttpResponseMessage? response = null;
        bool failed = false;
        try
        {
            response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                ct);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI API call failed");
            failed = true;
        }

        if (failed || response is null)
        {
            yield return "[ERROR]";
            yield break;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;
            if (!line.StartsWith("data:")) continue;

            var content = line["data:".Length..].Trim();
            if (content == "[DONE]") yield break;

            // Parse nested JSON: {"ret":200,"data":{"answer":"..."}}
            string? answer = null;
            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.TryGetProperty("data", out var dataEl) &&
                    dataEl.TryGetProperty("answer", out var answerEl))
                {
                    answer = answerEl.GetString();
                }
            }
            catch (JsonException)
            {
                // Not valid JSON, skip
            }

            if (!string.IsNullOrEmpty(answer))
                yield return answer;
        }
    }
}
