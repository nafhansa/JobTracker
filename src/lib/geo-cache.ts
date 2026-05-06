import { supabaseAdmin } from "./supabase/server";

const memoryCache = new Map<string, { country: string; countryCode: string; expires: number }>();

const CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_MEMORY_CACHE_SIZE = 1000;

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

  const memoryCached = memoryCache.get(ip);
  if (memoryCached && memoryCached.expires > Date.now()) {
    return { country: memoryCached.country, countryCode: memoryCached.countryCode };
  }

  try {
    const { data } = await (supabaseAdmin as any)
      .from("geo_cache")
      .select("country, country_code")
      .eq("ip_hash", ip)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (data) {
      memoryCache.set(ip, {
        country: data.country,
        countryCode: data.country_code,
        expires: Date.now() + CACHE_TTL,
      });

      if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
        const oldestKey = memoryCache.keys().next().value;
        if (oldestKey) memoryCache.delete(oldestKey);
      }

      return { country: data.country, countryCode: data.country_code };
    }
  } catch (error) {
    console.warn("Geo cache DB lookup failed, falling back to API:", error);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        const result = { country: data.country, countryCode: data.countryCode };

        memoryCache.set(ip, {
          country: data.country,
          countryCode: data.countryCode,
          expires: Date.now() + CACHE_TTL,
        });

        if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
          const oldestKey = memoryCache.keys().next().value;
          if (oldestKey) memoryCache.delete(oldestKey);
        }

        try {
          await (supabaseAdmin as any)
            .from("geo_cache")
            .upsert({
              ip_hash: ip,
              country: data.country,
              country_code: data.countryCode,
              expires_at: new Date(Date.now() + CACHE_TTL).toISOString(),
            });
        } catch (dbError) {
          console.warn("Failed to cache geo data in Supabase:", dbError);
        }

        return result;
      }
    }
  } catch (error) {
    console.error("Error fetching country from IP:", error);
  }

  return {};
}

export { getClientIP, getCountryFromIP, memoryCache };
