using CemeteryIQ.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;

namespace CemeteryIQ.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public EmailService(IConfiguration config, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendMaintenanceReminderAsync(string toEmail, string toName, string plotId, string deceasedName, int daysLeft)
    {
        var enabled = _config.GetValue<bool>("Brevo:Enabled");
        var subject = $"[An Nghỉ Viên] Nhắc nhở: Phí duy tu mộ phần {plotId} sắp hết hạn";
        var htmlBody = $"""
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: #1A3C34; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0; font-family: 'Playfair Display', serif;">An Nghỉ Viên</h2>
                    <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.8;">Hệ thống Quản lý Nghĩa trang</p>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                    <p>Kính gửi <strong>{toName}</strong>,</p>
                    <p>Chúng tôi xin trân trọng thông báo:</p>
                    <div style="background: #FFF8E1; border-left: 4px solid #B8860B; padding: 16px; margin: 16px 0; border-radius: 4px;">
                        <p style="margin: 0;">Phí duy tu cho mộ phần của <strong>{deceasedName}</strong> (Mã mộ: <strong>{plotId}</strong>)
                        sẽ hết hạn trong <strong style="color: #E04444;">{daysLeft} ngày</strong>.</p>
                    </div>
                    <p>Để tiếp tục dịch vụ chăm sóc mộ phần, quý gia đình vui lòng liên hệ hoặc đăng nhập hệ thống để gia hạn.</p>
                    <p style="text-align: center; margin: 24px 0;">
                        <a href="{_config["App:PublicBaseUrl"] ?? "https://annghivien.vanhxyz.dev"}/login"
                           style="background: #B8860B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                            Đăng nhập & Gia hạn
                        </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="font-size: 13px; color: #6b7280;">
                        Trân trọng,<br/>
                        <strong>Ban Quản lý An Nghỉ Viên</strong><br/>
                        Hotline: 1900-xxxx
                    </p>
                </div>
            </div>
            """;

        if (!enabled)
        {
            _logger.LogInformation("[EMAIL-MOCK] To: {Email} | Subject: {Subject} | DaysLeft: {Days} | PlotId: {PlotId}",
                toEmail, subject, daysLeft, plotId);
            return;
        }

        // Skip non-ASCII emails (seed data has Vietnamese names as emails)
        if (toEmail.Any(c => c > 127))
        {
            _logger.LogWarning("[EMAIL-SKIP] Non-ASCII email address: {Email}", toEmail);
            return;
        }

        try
        {
            var apiKey = _config["Brevo:ApiKey"] ?? "";
            var senderEmail = _config["Brevo:SenderEmail"] ?? "noreply@cemeteryiq.vn";
            var senderName = _config["Brevo:SenderName"] ?? "An Nghỉ Viên";

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("api-key", apiKey);

            var payload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = toEmail, name = toName } },
                subject,
                htmlContent = htmlBody
            };

            var response = await client.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[EMAIL-SENT] To: {Email} | PlotId: {PlotId} | DaysLeft: {Days}", toEmail, plotId, daysLeft);
            }
            else
            {
                _logger.LogError("[EMAIL-FAIL] To: {Email} | Status: {Status} | Response: {Body}", toEmail, response.StatusCode, responseBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EMAIL-ERROR] Failed to send email to {Email}", toEmail);
        }
    }
}
