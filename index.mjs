import {promisify} from "util";
import {webhookCallback} from "grammy";

export const wait = promisify((a, f) => setTimeout(f, a));

export const getURL = (path = "api/index", headers = {}, proxy = "") => {
    return new URL(`${proxy}https://${getHost(headers)}/${path}`);
}

export const getHost = (headers = {}, header = "x-forwarded-host") => headers?.get(header) || process.env.VERCEL_URL;

export const webhookStream = (bot, adapter = "std/http", onTimeout = "return", timeoutMilliseconds = 180_000) => {
    const callback = webhookCallback(bot, adapter, onTimeout, timeoutMilliseconds);
    const encoder = new TextEncoder();
    return (...args) => {
        let streamController;
        const stream = new ReadableStream({
            start: controller => streamController = controller,
            pull: controller => wait(1000).then(() => controller.enqueue(encoder.encode(".")))
        });
        callback(...args).finally(() => streamController.close());
        return new Response(stream);
    }
}

export default webhookStream;
