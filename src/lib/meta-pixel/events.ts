import { fbqTrack } from "./client";

export const metaPageView = () => fbqTrack("PageView");

export const metaViewContent = (params?: { content_name?: string; content_category?: string; value?: number; currency?: string }) =>
  fbqTrack("ViewContent", params);

export const metaCompleteRegistration = (params?: { value?: number; currency?: string }) =>
  fbqTrack("CompleteRegistration", params);

export const metaLead = (params?: { value?: number; currency?: string; content_name?: string }) =>
  fbqTrack("Lead", params);

export const metaInitiateCheckout = (params?: { value?: number; currency?: string; content_name?: string; num_items?: number }) =>
  fbqTrack("InitiateCheckout", params);

export const metaAddPaymentInfo = (params?: { value?: number; currency?: string }) =>
  fbqTrack("AddPaymentInfo", params);

export const metaPurchase = (params: { value: number; currency: string }) =>
  fbqTrack("Purchase", params);

export const metaSubscribe = (params: { value: number; currency: string; subscription_id?: string }) =>
  fbqTrack("Subscribe", params);

export const metaSubmitApplication = (params?: { content_name?: string }) =>
  fbqTrack("SubmitApplication", params);