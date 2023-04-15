import {promisify} from "util";
import {webhookCallback} from "grammy";

const wait = promisify((a, f) => setTimeout(f, a));

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
