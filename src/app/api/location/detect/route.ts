import { NextResponse } from "next/server";
import { getClientIP, getCountryFromIP } from "@/lib/geo-cache";

const INDONESIA_COUNTRY_CODES = ['ID', 'INA'];

export async function GET(req: Request) {
  try {
    const ipAddress = getClientIP(req);
    const geoInfo = await getCountryFromIP(ipAddress);
    
    const isIndonesia = geoInfo.countryCode 
      ? INDONESIA_COUNTRY_CODES.includes(geoInfo.countryCode.toUpperCase())
      : true;
    
    return NextResponse.json({
      isIndonesia,
      country: geoInfo.country,
      countryCode: geoInfo.countryCode,
      ipAddress,
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return NextResponse.json(
      { isIndonesia: true, error: "Failed to detect location" },
      { status: 200 }
    );
  }
}