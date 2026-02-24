import { NextResponse } from "next/server";

const INDONESIA_COUNTRY_CODES = ['ID', 'INA'];

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

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      headers: { "Accept": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
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

export async function GET(req: Request) {
  try {
    const ipAddress = getClientIP(req);
    const geoInfo = await getCountryFromIP(ipAddress);
    
    const isIndonesia = geoInfo.countryCode 
      ? INDONESIA_COUNTRY_CODES.includes(geoInfo.countryCode.toUpperCase())
      : false;
    
    return NextResponse.json({
      isIndonesia,
      country: geoInfo.country,
      countryCode: geoInfo.countryCode,
      ipAddress,
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return NextResponse.json(
      { isIndonesia: false, error: "Failed to detect location" },
      { status: 500 }
    );
  }
}
