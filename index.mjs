import {promisify} from "util";
import {webhookCallback} from "grammy/web";

export const wait = promisify((a, f) => setTimeout(f, a));

export const json = (...args) => new Response(JSON.stringify(...args));

export const getURL = (path = "api/index", headers = {}, proxy = "") => {
    return new URL(`${proxy}https://${getHost(headers)}/${path}`).href;
}

export const getHost = (headers = {}, header = "x-forwarded-host") => headers?.get(header) || process.env.VERCEL_URL;

export const setWebhook = (bot, path) => async ({headers}) => json(await bot.api.setWebhook(getURL(path, headers)));

export const webhookStream = (bot, onTimeout = "throw", timeoutMilliseconds = 55_000) => {
    const callback = webhookCallback(bot, "std/http", onTimeout, timeoutMilliseconds);
    return (...args) => new Response(new ReadableStream({
        start: controller => {
            const encoder = new TextEncoder();
            const interval = setInterval(() => controller.enqueue(encoder.encode(".")), 1000);
            return callback(...args).finally(() => {
                clearInterval(interval);
                controller.close();
            });
        }
    }));
}
