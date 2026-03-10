using CemeteryIQ.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace CemeteryIQ.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendMaintenanceReminderAsync(string toEmail, string toName, string plotId, string deceasedName, int daysLeft)
    {
        var enabled = _config.GetValue<bool>("Smtp:Enabled");
        var subject = $"[CemeteryIQ] Nhắc nhở: Phí duy tu mộ phần {plotId} sắp hết hạn";
        var body = $"""
            Kính gửi {toName},

            Chúng tôi xin trân trọng thông báo:

            Phí duy tu cho mộ phần của <strong>{deceasedName}</strong> (Mã mộ: {plotId}) sẽ hết hạn trong <strong>{daysLeft} ngày</strong>.

            Để tiếp tục dịch vụ, quý gia đình vui lòng liên hệ hoặc đăng nhập hệ thống để gia hạn.

            Trân trọng,
            Ban Quản lý An Nghỉ Viên
            Hotline: 1900-xxxx
            """;

        if (!enabled)
        {
            _logger.LogInformation("[EMAIL-MOCK] To: {Email} | Subject: {Subject} | Body: Maintenance expiring in {Days} days for plot {PlotId}",
                toEmail, subject, daysLeft, plotId);
            return;
        }

        try
        {
            var host = _config["Smtp:Host"] ?? "smtp.gmail.com";
            var port = _config.GetValue<int>("Smtp:Port", 587);
            var user = _config["Smtp:User"] ?? "";
            var password = _config["Smtp:Password"] ?? "";
            var from = _config["Smtp:From"] ?? "noreply@cemeteryiq.vn";

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(user, password)
            };

            var message = new MailMessage(from, toEmail, subject, body)
            {
                IsBodyHtml = false
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("[EMAIL-SENT] To: {Email} | PlotId: {PlotId} | DaysLeft: {Days}", toEmail, plotId, daysLeft);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EMAIL-ERROR] Failed to send email to {Email}", toEmail);
        }
    }
}
