using Microsoft.AspNetCore.Mvc;
using CemeteryIQ.Api.Services;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
public class ChatController : ControllerBase
{
    private readonly AiChatService _aiChat;

    public ChatController(AiChatService aiChat) => _aiChat = aiChat;

    [HttpPost("api/chat")]
    public async Task StreamChat([FromBody] ChatRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Message))
        {
            Response.StatusCode = 400;
            return;
        }

        Response.ContentType = "text/event-stream; charset=utf-8";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");

        await foreach (var chunk in _aiChat.StreamChatAsync(req.Message, ct))
        {
            if (chunk == "[ERROR]")
            {
                await WriteEvent("error", "Bot dang ban, vui long thu lai.", ct);
                break;
            }

            await WriteEvent("message", chunk, ct);
            await Response.Body.FlushAsync(ct);
        }

        await WriteEvent("done", "[DONE]", ct);
        await Response.Body.FlushAsync(ct);
    }

    private async Task WriteEvent(string eventName, string data, CancellationToken ct)
    {
        // SSE spec: newlines in data must be split into separate "data:" lines
        var lines = data.Replace("\r\n", "\n").Split('\n');
        var sb = new System.Text.StringBuilder();
        sb.Append($"event: {eventName}\n");
        foreach (var line in lines)
            sb.Append($"data: {line}\n");
        sb.Append('\n');
        await Response.Body.WriteAsync(
            System.Text.Encoding.UTF8.GetBytes(sb.ToString()), ct);
    }
}

public record ChatRequest(string Message);
