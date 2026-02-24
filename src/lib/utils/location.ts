export interface LocationData {
  isIndonesia: boolean;
  country?: string;
  countryCode?: string;
  ipAddress?: string;
}

export async function detectLocation(): Promise<LocationData> {
  try {
    const response = await fetch('/api/location/detect');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error detecting location:', error);
    return { isIndonesia: false };
  }
}

export async function isUserFromIndonesia(): Promise<boolean> {
  const location = await detectLocation();
  return location.isIndonesia;
}
