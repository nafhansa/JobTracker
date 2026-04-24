const geoCache = new Map<string, { country: string; countryCode: string; expires: number }>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 10000;

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

async function getCountryFromIP(ip: string): Promise<{ country?: string; countryCode?: string }> {
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "::1") {
    return {};
  }

  const cached = geoCache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return { country: cached.country, countryCode: cached.countryCode };
  }

  try {
    const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      headers: { "Accept": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        geoCache.set(ip, {
          country: data.country,
          countryCode: data.countryCode,
          expires: Date.now() + CACHE_TTL,
        });

        if (geoCache.size > MAX_CACHE_SIZE) {
          const oldestKey = geoCache.keys().next().value;
          if (oldestKey) geoCache.delete(oldestKey);
        }

        return {
          country: data.country,
          countryCode: data.countryCode,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching country from IP:", error);
  }

  return {};
}

export { getClientIP, getCountryFromIP, geoCache };