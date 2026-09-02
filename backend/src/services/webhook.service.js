const isSafeWebhookUrl = (value) => {
    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        const privateHost = host === "localhost" || host === "0.0.0.0" || host === "::1" || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
        return url.protocol === "https:" && !privateHost;
    } catch { return false; }
};
const sendWebhook = async (url, payload) => {
    if (!isSafeWebhookUrl(url)) throw Object.assign(new Error("Webhook URL is not an allowed HTTPS endpoint"), { retryable: false });
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Object.assign(new Error(`Webhook responded with HTTP ${response.status}`), { retryable: response.status >= 500 });
};
module.exports = { sendWebhook, isSafeWebhookUrl };
