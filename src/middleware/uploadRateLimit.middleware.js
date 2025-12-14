const uploads = new Map();

export function uploadRateLimit({ limit = 60, windowMs = 60 * 1000 } = {}) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const arr = uploads.get(key) || [];
    // keep only timestamps within window
    const fresh = arr.filter((ts) => now - ts < windowMs);
    fresh.push(now);
    uploads.set(key, fresh);

    if (fresh.length > limit) {
      return res.status(429).json({
        responseCode: "RATE_LIMIT_EXCEEDED",
        message: `Upload rate limit exceeded. Max ${limit} uploads per ${windowMs / 1000}s.`,
      });
    }

    next();
  };
}
