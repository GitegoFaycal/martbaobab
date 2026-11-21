// Short in-memory cache for anonymous GET responses on public list endpoints.
// Each warm serverless instance keeps up to 500 entries for `seconds`; logged-in
// requests (which carry personalised fields) bypass it. The response also gets
// a private max-age so the browser reuses it when the visitor navigates back.
const store = new Map();
const MAX_ENTRIES = 500;

export default function publicCache(seconds = 60) {
  return (req, res, next) => {
    if (req.method !== "GET" || req.cookies?.loco_token || req.headers.authorization) {
      return next();
    }

    const key = req.originalUrl;
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) {
      res.set("Cache-Control", `private, max-age=${seconds}`);
      res.set("X-Loco-Cache", "hit");
      return res.status(hit.status).type("application/json").send(hit.body);
    }

    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode === 200 && typeof body === "string") {
        if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value);
        store.set(key, { status: 200, body, expires: Date.now() + seconds * 1000 });
        res.set("Cache-Control", `private, max-age=${seconds}`);
        res.set("X-Loco-Cache", "miss");
      }
      return originalSend(body);
    };
    return next();
  };
}
