type FbqEvent =
  | "PageView"
  | "ViewContent"
  | "CompleteRegistration"
  | "Lead"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Subscribe"
  | "SubmitApplication"
  | "Search"
  | "Contact";

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq: {
      (action: string, event: FbqEvent, params?: FbqParams): void;
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      push: (args: unknown[]) => void;
      version: string;
    };
    _fbq: Window["fbq"];
  }
}

export function fbqTrack(event: FbqEvent, params?: FbqParams) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;
  if (!window.fbq) return;

  window.fbq("track", event, params);
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";