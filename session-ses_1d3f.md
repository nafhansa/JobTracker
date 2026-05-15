# Setup Meta Ads Pixel Code

**Session ID:** ses_1d3f6410effem7uK5E1QtaoRiJ
**Created:** 5/15/2026, 9:28:16 PM
**Updated:** 5/15/2026, 9:38:12 PM

---

## User

aku lagi setup meta ads 

katanya butuh ini untuk intall pixel codenya
Add event code
Select an event from the list below to add parameters and view the code. Copy and paste the event tags below </head> in your website header section. Choose a business category to see a filtered list of recommended events. Learn more
Event name
Description
View Content
A visit to a content page that you care about, such as a product page, landing page or article. Information about the page viewed can be passed to Meta for use in Advantage+ catalogue ads.

    Track event when page loads
    Track event on in-line action

Copy ViewContent event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Content ID
Req. for dynamic ads
Content type
Req. for dynamic ads
<script>
  fbq('track', 'ViewContent');
</script>
Paste the view content event code

    Place the event code on your content or detail page page.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'view content' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Complete Registration
A submission of information by a customer in exchange for a service provided by your business (e.g. signing up for email subscription).

    Track event when page loads
    Track event on in-line action

Copy complete registration event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
<script>
  fbq('track', 'CompleteRegistration');
</script>
Paste the complete registration event code

    Place the event code on your form completion page.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'complete registration' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Initiate Checkout
The start of a checkout process.

    Track event when page loads
    Track event on in-line action

Copy initiate checkout event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
<script>
  fbq('track', 'InitiateCheckout');
</script>
Paste the initiate checkout event code

    Place the event code on the first page of your checkout process.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'initiate checkout' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Add Payment Info
The addition of customer payment information during a checkout process.

    Track event when page loads
    Track event on in-line action

Copy the AddPaymentInfo event code
Copy the event code snippet.
<script>
  fbq('track', 'AddPaymentInfo');
</script>
Paste the add payment info event code

    Place the event code on the add payment "success" page in a checkout flow, or within an account settings section.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'add payment info' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Purchase
The completion of a purchase, usually signified by receiving order/purchase confirmation or a transaction receipt.

    Track event when page loads
    Track event on in-line action

Copy the purchase event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Contents
Include all parameters to complete the basket. Learn more
ID
Quantity
Content ID
Req. for dynamic ads
<script>
  fbq('track', 'Purchase');
</script>
Paste the Purchase event code

    We recommend tracking this event on page load.
    If using in-line events, add the event code to the HTML element for the Complete Order button.

<button id="addToCartButton">Purchase</button>
<script type="text/javascript">
document.getElementById('addToCartButton').addEventListener('click', function() {
insert_event_code_here;
...
}, false);
</script>
Test your 'purchase' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Customise product
The customisation of products through a configuration tool or other application that your business owns.

    Track event when page loads
    Track event on in-line action

Copy the customise product event code
Copy the event code snippet.
<script>
  fbq('track', 'CustomizeProduct');
</script>
Paste the "Customise Product" event code

    If your Customise product button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'customise product' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Search
A search performed on your website, app or other property (e.g. product search, travel search).

    Track event when page loads
    Track event on in-line action

Copy search event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Search string
Content ID
Req. for dynamic ads
Content type
Req. for dynamic ads
<script>
  fbq('track', 'Search');
</script>
Paste the search event code

    Place the event code on your search results page.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'search' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Contact
A telephone call/SMS message, email, chat or other type of contact between a customer and your business.

    Track event when page loads
    Track event on in-line action

Copy "Contact" event code
Copy the event code snippet.
<script>
  fbq('track', 'Contact');
</script>
Paste the "Contact" event code

    If your Contact button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your "Contact" event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Lead
A submission of information by a customer with the understanding that they may be contacted at a later date by your business.

    Track event when page loads
    Track event on in-line action

Copy lead event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
<script>
  fbq('track', 'Lead');
</script>
Paste the lead event code

    Place the event code on your form completion page.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your lead event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Start trial
The start of a free trial of a product or service that you offer (e.g. trial subscription).

    Track event when page loads
    Track event on in-line action

Copy "Start Trial" event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Subscription ID
Predicted LTV
<script>
  fbq('track', 'StartTrial');
</script>
Paste the start trial event code

    If your Start trial button leads to a new page, place the event on that page. Otherwise, track this event on an inline action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your start trial event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Submit Application
The submission of an application for a product, service or programme that you offer (e.g. credit card, educational programme or job).

    Track event when page loads
    Track event on in-line action

Copy "Submit Application" event code
Copy the event code snippet.
<script>
  fbq('track', 'SubmitApplication');
</script>
Paste the submit application event code

    If your Submit Application button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your submit application event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Find location
When a person finds one of your locations via the web or app, with the intention to visit (e.g. searching for a product and finding it in one of your local shops).

    Track event when page loads
    Track event on in-line action

Copy 'find location' event code
Copy the event code snippet.
<script>
  fbq('track', 'FindLocation');
</script>
Paste the 'find location' event code

    If your Find location button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your find location event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
See more events
Event name
Description
Add to Cart
The addition of an item to a shopping basket (e.g. clicking an Add to Cart button on a website).

    Track event when page loads
    Track event on in-line action

Copy the AddToCart event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Contents
Include all parameters to complete the basket. Learn more
ID
Quantity
Content ID
Req. for dynamic ads
<script>
  fbq('track', 'AddToCart');
</script>
Paste the AddToCart event code

    If your Add to Cart button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your add to cart event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Add to wishlist
The addition of items to a wishlist (e.g. clicking an Add to Wishlist button on a website).

    Track event when page loads
    Track event on in-line action

Copy AddToWishlist event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Content ID
Req. for dynamic ads
Content type
Req. for dynamic ads
<script>
  fbq('track', 'AddToWishlist');
</script>
Paste the AddToWishlist event code

    If your Add to wishlist button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'add to wishlist' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Donate
The donation of funds to your organisation or cause.

    Track event when page loads
    Track event on in-line action

Copy the donate event code
Copy the event code snippet.
<script>
  fbq('track', 'Donate');
</script>
Paste the "Donate" event code

    If your Donate button leads to a new page, place the event on that page. Otherwise, track this event on an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your donate event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Schedule
The booking of an appointment to visit one of your locations.

    Track event when page loads
    Track event on in-line action

Copy schedule event code
Copy the event code snippet.
<script>
  fbq('track', 'Schedule');
</script>
Paste the schedule event code

    If your Schedule button leads to a new Page, place the event on that Page. Otherwise, track this event on an inline action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your 'schedule' event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Subscribe
The start of a paid subscription for a product or service that you offer.

    Track event when page loads
    Track event on in-line action

Copy Subscribe event code
Copy the event code snippet. You can add parameters to send additional on-page data.
Send event parameters
Choose the parameters that you'd like to send with your event. Then input the value for each parameter. You can also input variables to send dynamic data. Copy the event code once you've finalised the parameters.
Conversion value
Currency
Subscription ID
Predicted LTV
<script>
  fbq('track', 'Subscribe');
</script>
Paste the "Subscribe" event code

    If your Subscribe button leads to a new page, place the event on that page. Otherwise, track this event as part of an in-line action.
    Add the event code just below the </head> tag. This allows the event code to load along with the pixel code when the page loads.

<!-- End Meta pixel code -->
</head>
<body>
<script>insert_event_code_here;<script>
Test your subscribe event
Check the status of your event by triggering the event on your live web page. If your status is shown as Active, the event has been successfully added. Note that this process may take several minutes.
No activity yet
Can't see an event that fits? Set up a custom event. Learn more
Test event code
You can verify your event setup in real time and troubleshoot any issues by using the Test Events tool in Events Manager. Learn more 

use context7

---

## Assistant (Plan · GLM-5.1 · 13.4s)

_Thinking:_

The user is setting up Meta (Facebook) Pixel for their Next.js app and wants me to help them integrate it. They've pasted the Meta Pixel event setup instructions. Let me first understand the codebase structure, particularly the layout files and any existing analytics/tracking setup, to plan where to add the Meta Pixel code.

Since I'm in plan mode, I should research the codebase first and then present a plan. Let me look at the relevantfiles.

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/layout.tsx"
}
```

**Output:**
```
/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/**/layout.tsx"
}
```

**Output:**
```
/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx
/home/nafhan/Documents/job/JobTracker/src/app/onboarding/layout.tsx
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "fbq|facebook|meta.*pixel|gtag|gtm|GoogleTagManager",
  "include": "*.{tsx,ts,js,jsx}"
}
```

**Output:**
```
No files found
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/.env.example"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/.env.example</path>
<type>file</type>
<content>
1: # ===========================================
2: # FIREBASE CONFIGURATION
3: # ===========================================
4: NEXT_PUBLIC_FIREBASE_API_KEY=
5: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
6: NEXT_PUBLIC_FIREBASE_PROJECT_ID=
7: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
8: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
9: NEXT_PUBLIC_FIREBASE_APP_ID=
10: # Firebase Admin (Server-side only)
11: FIREBASE_CLIENT_EMAIL=
12: FIREBASE_PRIVATE_KEY=
13: # ===========================================
14: # SUPABASE CONFIGURATION
15: # ===========================================
16: NEXT_PUBLIC_SUPABASE_URL=
17: NEXT_PUBLIC_SUPABASE_ANON_KEY=
18: # Supabase Service Role (Server-side only)
19: SUPABASE_SERVICE_ROLE_KEY=
20: # ===========================================
21: # MIDTRANS PAYMENT
22: # ===========================================
23: MIDTRANS_SERVER_KEY=
24: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
25: MIDTRANS_IS_PRODUCTION=false
26: # ===========================================
27: # GOOGLE OAUTH (Gmail Integration)
28: # ===========================================
29: GOOGLE_CLIENT_ID=
30: GOOGLE_CLIENT_SECRET=
31: GOOGLE_REDIRECT_URI=
32: # ===========================================
33: # FASTSPRING (Legacy webhook)
34: # ===========================================
35: FASTSPRING_WEBHOOK_SECRET=
36: # ===========================================
37: # FEATURE FLAGS
38: # ===========================================
39: NEXT_PUBLIC_USE_SUPABASE_READ=false
40: NEXT_PUBLIC_USE_SUPABASE_WRITE=false
41: # ===========================================
42: # POSTHOG (Analytics & Session Replay)
43: # ===========================================
44: NEXT_PUBLIC_POSTHOG_KEY=
45: NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
46: POSTHOG_PERSONAL_API_KEY=
47: # ===========================================
48: # ANTHROPIC (AI Writer)
49: # ===========================================
50: ANTHROPIC_API_KEY=
51: # ===========================================
52: # JINA (Company website scraping - optional, higher rate limits)
53: # ===========================================
54: JINA_API_KEY=
55: # ===========================================
56: # EMAIL FINDER (Optional - for LinkedIn HR/Founder email finder)
57: # ===========================================
58: # Hunter.io - 25 free searches/month (https://hunter.io)
59: HUNTER_API_KEY=
60: # SerpAPI - 100 free searches/month (https://serpapi.com)
61: SERPAPI_API_KEY=

(End of file - total 61 lines)
</content>
```

---

## Assistant (Plan · GLM-5.1 · 4.2s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx</path>
<type>file</type>
<content>
1: // src/app/layout.tsx
2: import "./globals.css";
3: import { AuthProvider } from "@/lib/firebase/auth-context";
4: import { LanguageProvider } from "@/lib/language/context";
5: import { ThemeProvider } from "@/lib/theme/context";
6: import { PostHogProvider, PostHogIdentify } from "@/lib/posthog/PostHogProvider";
7: import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
8: import { SplashScreen } from "@/components/SplashScreen";
9: import { ErrorBoundary } from "@/components/ErrorBoundary";
10: import { Toaster } from "@/components/ui/sonner";
11: import type { Viewport } from "next";
12: 
13: export const metadata = {
14:   manifest: "/manifest.json",
15: };
16: 
17: export const viewport: Viewport = {
18:   width: "device-width",
19:   initialScale: 1,
20:   maximumScale: 1,
21:   userScalable: false,
22: };
23: 
24: export default function RootLayout({
25:   children,
26: }: {
27:   children: React.ReactNode;
28: }) {
29:   return (
30:     <html lang="en">
31:       <head>
32:         <link rel="manifest" href="/manifest.json" />
33:       </head>
34:       <body>
35:         <ErrorBoundary>
36:           <ThemeProvider>
37:             <LanguageProvider>
38:               <PostHogProvider>
39:                 <AuthProvider>
40:                   <PostHogIdentify />
41:                   <SplashScreen />
42:                   {children}
43:                   <PWAInstallPrompt />
44:                   <Toaster />
45:                 </AuthProvider>
46:               </PostHogProvider>
47:             </LanguageProvider>
48:           </ThemeProvider>
49:         </ErrorBoundary>
50:       </body>
51:     </html>
52:   );
53: }

(End of file - total 53 lines)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "PostHog|posthog|analytics|AnalyticsProvider",
  "include": "*.{tsx,ts}"
}
```

**Output:**
```
Found 171 matches (showing first 100)
/home/nafhan/Documents/job/JobTracker/src/lib/posthog/PostHogProvider.tsx:
  Line 4: import posthog from "posthog-js";

  Line 5: import { PostHogProvider as PHProvider } from "posthog-js/react";

  Line 7: import { initPostHog } from "./client";

  Line 9: export function PostHogProvider({ children }: { children: React.ReactNode }) {

  Line 11:     initPostHog();

  Line 14:   return <PHProvider client={posthog}>{children}</PHProvider>;

  Line 17: export function PostHogIdentify() {

  Line 22:       posthog.identify(user.uid, {

  Line 29:       posthog.group("subscription", subscription?.plan || "free", {

  Line 34:       posthog.reset();


/home/nafhan/Documents/job/JobTracker/src/lib/onboarding/context.tsx:
  Line 10: import { trackOnboardingCompleted, trackOnboardingStep } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/lib/posthog/events.ts:
  Line 1: import { posthog } from "./client";

  Line 4:   posthog.capture("sign_up_started", { method });

  Line 7:   posthog.capture("sign_up_completed", { method });

  Line 10:   posthog.capture("login_completed", { method });

  Line 13:   posthog.capture("onboarding_started");

  Line 16:   posthog.capture("onboarding_step_completed", { step });

  Line 19:   posthog.capture("onboarding_completed", { language });

  Line 22:   posthog.capture("pricing_viewed");

  Line 25:   posthog.capture("checkout_started", { plan, amount, currency: "IDR" });

  Line 28:   posthog.capture("payment_completed", { plan, amount, currency: "IDR", payment_method: method });

  Line 31:   posthog.capture("payment_failed", { plan, reason });

  Line 34:   posthog.capture("subscription_cancelled", { plan });

  Line 37:   posthog.capture("ai_writer_opened");

  Line 40:   posthog.capture("ai_generation_started", { type });

  Line 43:   posthog.capture("ai_generation_completed", { type, coins_remaining });

  Line 46:   posthog.capture("jps_purchased", { package_name, coins, amount, currency: "IDR" });

  Line 49:   posthog.capture("job_added", { source });

  Line 52:   posthog.capture("job_status_changed", { from_status: from, to_status: to });

  Line 55:   posthog.capture("job_deleted");

  Line 58:   posthog.capture("client_added");

  Line 61:   posthog.capture("switched_to_freelance_mode");

  Line 64:   posthog.capture("resume_uploaded");

  Line 67:   posthog.capture("profile_updated");

  Line 70:   posthog.capture("gmail_connected");

  Line 73:   posthog.capture("cold_outreach_sent", { channel });

  Line 76:   posthog.capture("sidebar_section_viewed", { section });

  Line 79:   posthog.capture("tracker_mode_switched", { mode });

/home/nafhan/Documents/job/JobTracker/src/lib/posthog/server.ts:
  Line 1: import { PostHog } from "posthog-node";

  Line 3: let posthogServer: PostHog | null = null;

  Line 5: export function getServerPostHog() {

  Line 6:   if (!posthogServer) {

  Line 7:     posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {

  Line 12:   return posthogServer;


/home/nafhan/Documents/job/JobTracker/src/lib/posthog/client.ts:
  Line 1: import posthog from "posthog-js";

  Line 3: export function initPostHog() {

  Line 4:   if (typeof window !== "undefined" && !posthog.__loaded) {

  Line 5:     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {

  Line 16:         (window as any).posthog = ph;

  Line 19:     (posthog as any).__loaded = true;

  Line 20:     (window as any).posthog = posthog;

  Line 22:   return posthog;

  Line 25: export { posthog };

/home/nafhan/Documents/job/JobTracker/src/components/ai-writer/ProfessionalProfile.tsx:
  Line 12: import { trackResumeUploaded } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/components/ai-writer/JpsShopSection.tsx:
  Line 12: import { trackCheckoutStarted } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/components/ai-writer/AIWriterSection.tsx:
  Line 31: import { trackAIGenerationStarted, trackAIGenerationCompleted, trackAIWriterOpened } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/components/Sidebar.tsx:
  Line 8: import { trackSidebarSection } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/components/TrackerModeSwitcher.tsx:
  Line 11: import { trackTrackerModeSwitched } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx:
  Line 8: import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";

  Line 13: import { trackLoginCompleted, trackSignUpCompleted } from "@/lib/posthog/events";

  Line 37:           fetch("/api/analytics/track", {

  Line 48:           fetch("/api/analytics/track", {

  Line 112:           await fetch("/api/analytics/track", {

  Line 124:           await fetch("/api/analytics/track", {


/home/nafhan/Documents/job/JobTracker/src/app/payment/midtrans/page.tsx:
  Line 8: import { trackPaymentCompleted, trackPaymentFailed } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/app/upgrade/page.tsx:
  Line 14: import { trackPricingViewed } from "@/lib/posthog/events";


/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx:
  Line 6: import { PostHogProvider, PostHogIdentify } from "@/lib/posthog/PostHogProvider";

  Line 38:               <PostHogProvider>

  Line 40:                   <PostHogIdentify />

  Line 46:               </PostHogProvider>


/home/nafhan/Documents/job/JobTracker/src/app/api/subscription/cancel/route.ts:
  Line 8: import { getServerPostHog } from "@/lib/posthog/server";

  Line 190:       getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/webhook/route.ts:
  Line 10: import { getServerPostHog } from '@/lib/posthog/server';

  Line 206:       getServerPostHog().capture({

  Line 255:         getServerPostHog().capture({

  Line 395:       getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/jobs/update/route.ts:
  Line 4: import { getServerPostHog } from "@/lib/posthog/server";

  Line 89:           getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/charge/route.ts:
  Line 5: import { getServerPostHog } from "@/lib/posthog/server";

  Line 120:     getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/freelance/add/route.ts:
  Line 4: import { getServerPostHog } from "@/lib/posthog/server";

  Line 58:     getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/jobs/add/route.ts:
  Line 4: import { getServerPostHog } from "@/lib/posthog/server";

  Line 156:     getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/api/jobs/delete/route.ts:
  Line 4: import { getServerPostHog } from "@/lib/posthog/server";

  Line 53:     getServerPostHog().capture({


/home/nafhan/Documents/job/JobTracker/src/app/dashboard/page.tsx:
  Line 22: import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";

  Line 81:           await fetch("/api/analytics/track", {


/home/nafhan/Documents/job/JobTracker/src/lib/supabase/analytics.ts:
  Line 8:     await supabase.from('analytics_visits').insert({

  Line 29:     await supabase.from('analytics_logins').insert({

  Line 52:     await supabase.from('analytics_dashboard_visits').insert({

  Line 84:  * Get analytics stats (server-side only, via API)

  Line 95:       .from('analytics_visits') as any)

  Line 103:       .from('analytics_logins') as any)

  Line 111:       .from('analytics_dashboard_visits') as any)

  Line 120:       .from('analytics_active_users')

  Line 128:       .from('analytics_visits')

  Line 132:       .from('analytics_logins')

  Line 136:       .from('analytics_dashboard_visits')

  Line 173:     console.error('Error getting analytics stats:', error);


(Results truncated: showing 100 of 171 matches (71 hidden). Consider using a more specific path or pattern.)
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/api/payment/**/*"
}
```

**Output:**
```
/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/webhook/route.ts
/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/charge/route.ts
/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/verify/route.ts
/home/nafhan/Documents/job/JobTracker/src/app/api/payment/lifetime-availability/route.ts
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/api/midtrans/**/*"
}
```

**Output:**
```
No files found
```

---

## Assistant (Plan · GLM-5.1 · 6.3s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/posthog/events.ts"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/lib/posthog/events.ts</path>
<type>file</type>
<content>
1: import { posthog } from "./client";
2: 
3: export const trackSignUpStarted = (method: string) =>
4:   posthog.capture("sign_up_started", { method });
5: 
6: export const trackSignUpCompleted = (method: string) =>
7:   posthog.capture("sign_up_completed", { method });
8: 
9: export const trackLoginCompleted = (method: string) =>
10:   posthog.capture("login_completed", { method });
11: 
12: export const trackOnboardingStarted = () =>
13:   posthog.capture("onboarding_started");
14: 
15: export const trackOnboardingStep = (step: string) =>
16:   posthog.capture("onboarding_step_completed", { step });
17: 
18: export const trackOnboardingCompleted = (language: string) =>
19:   posthog.capture("onboarding_completed", { language });
20: 
21: export const trackPricingViewed = () =>
22:   posthog.capture("pricing_viewed");
23: 
24: export const trackCheckoutStarted = (plan: string, amount: number) =>
25:   posthog.capture("checkout_started", { plan, amount, currency: "IDR" });
26: 
27: export const trackPaymentCompleted = (plan: string, amount: number, method: string) =>
28:   posthog.capture("payment_completed", { plan, amount, currency: "IDR", payment_method: method });
29: 
30: export const trackPaymentFailed = (plan: string, reason?: string) =>
31:   posthog.capture("payment_failed", { plan, reason });
32: 
33: export const trackSubscriptionCancelled = (plan: string) =>
34:   posthog.capture("subscription_cancelled", { plan });
35: 
36: export const trackAIWriterOpened = () =>
37:   posthog.capture("ai_writer_opened");
38: 
39: export const trackAIGenerationStarted = (type: "cover_letter" | "cold_outreach") =>
40:   posthog.capture("ai_generation_started", { type });
41: 
42: export const trackAIGenerationCompleted = (type: string, coins_remaining: number) =>
43:   posthog.capture("ai_generation_completed", { type, coins_remaining });
44: 
45: export const trackJPsPurchased = (package_name: string, coins: number, amount: number) =>
46:   posthog.capture("jps_purchased", { package_name, coins, amount, currency: "IDR" });
47: 
48: export const trackJobAdded = (source: string) =>
49:   posthog.capture("job_added", { source });
50: 
51: export const trackJobStatusChanged = (from: string, to: string) =>
52:   posthog.capture("job_status_changed", { from_status: from, to_status: to });
53: 
54: export const trackJobDeleted = () =>
55:   posthog.capture("job_deleted");
56: 
57: export const trackClientAdded = () =>
58:   posthog.capture("client_added");
59: 
60: export const trackFreelanceModeSwitched = () =>
61:   posthog.capture("switched_to_freelance_mode");
62: 
63: export const trackResumeUploaded = () =>
64:   posthog.capture("resume_uploaded");
65: 
66: export const trackProfileUpdated = () =>
67:   posthog.capture("profile_updated");
68: 
69: export const trackGmailConnected = () =>
70:   posthog.capture("gmail_connected");
71: 
72: export const trackColdOutreachSent = (channel: string) =>
73:   posthog.capture("cold_outreach_sent", { channel });
74: 
75: export const trackSidebarSection = (section: string) =>
76:   posthog.capture("sidebar_section_viewed", { section });
77: 
78: export const trackTrackerModeSwitched = (mode: "job" | "client") =>
79:   posthog.capture("tracker_mode_switched", { mode });

(End of file - total 79 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/charge/route.ts"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/api/payment/midtrans/charge/route.ts</path>
<type>file</type>
<content>
1: import { NextResponse } from "next/server";
2: import crypto from 'crypto';
3: import { MIDTRANS_CONFIG, MIDTRANS_PRICES } from "@/lib/midtrans-config";
4: import { supabaseAdmin } from "@/lib/supabase/server";
5: import { getServerPostHog } from "@/lib/posthog/server";
6: 
7: export async function GET(req: Request) {
8:   try {
9:     const { searchParams } = new URL(req.url);
10:     const orderId = searchParams.get("orderId");
11: 
12:     if (!orderId) {
13:       return NextResponse.json(
14:         { error: "Missing orderId" },
15:         { status: 400 }
16:       );
17:     }
18: 
19:     const { data: transaction, error } = await (supabaseAdmin as any)
20:       .from('pending_midtrans_transactions')
21:       .select('*')
22:       .eq('order_id', orderId)
23:       .single();
24: 
25:     if (error || !transaction) {
26:       console.error('Transaction not found:', error);
27:       return NextResponse.json(
28:         { error: "Payment session expired or not found. Please go back and try again." },
29:         { status: 404 }
30:       );
31:     }
32: 
33:     console.log('GET /api/payment/midtrans/charge:', {
34:       orderId,
35:       snapToken: transaction.snap_token,
36:     });
37:     
38:     return NextResponse.json({
39:       success: true,
40:       orderId: transaction.order_id,
41:       amount: transaction.amount,
42:       token: transaction.snap_token,
43:       plan: transaction.plan,
44:     });
45:   } catch (error) {
46:     console.error('Payment GET error:', error);
47:     const err = error as { message?: string; code?: string };
48:     return NextResponse.json(
49:       { error: err.message || 'Failed to fetch transaction' },
50:       { status: 500 }
51:     );
52:   }
53: }
54: 
55: export async function POST(req: Request) {
56:   try {
57:     const body = await req.json();
58:     const { userId, plan, customerDetails, currency = 'IDR', enableAutoRenew } = body;
59: 
60:     if (!userId || !plan || !customerDetails) {
61:       return NextResponse.json(
62:         { error: "Missing required fields: userId, plan, customerDetails" },
63:         { status: 400 }
64:       );
65:     }
66: 
67:     const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';
68: 
69:     const { data: existingSubscription } = await (supabaseAdmin as any)
70:       .from('subscriptions')
71:       .select('id, plan, status, ends_at')
72:       .eq('user_id', userId)
73:       .maybeSingle();
74: 
75:     if (existingSubscription?.plan === 'lifetime' && planType !== 'lifetime') {
76:       return NextResponse.json(
77:         { error: "You already have lifetime access. No need to subscribe again." },
78:         { status: 400 }
79:       );
80:     }
81: 
82:     if (existingSubscription?.plan === planType && existingSubscription.status === 'active') {
83:       if (planType === 'monthly' && existingSubscription.ends_at && new Date(existingSubscription.ends_at) > new Date()) {
84:         return NextResponse.json(
85:           { error: "You already have an active monthly subscription." },
86:           { status: 400 }
87:         );
88:       }
89:     }
90: 
91:     const { data: existingPending } = await (supabaseAdmin as any)
92:       .from('pending_midtrans_transactions')
93:       .select('*')
94:       .eq('user_id', userId)
95:       .eq('plan', planType)
96:       .gt('expires_at', new Date().toISOString())
97:       .maybeSingle();
98: 
99:     if (existingPending) {
100:       console.log('Returning existing pending transaction for user:', userId);
101:       return NextResponse.json({
102:         success: true,
103:         orderId: existingPending.order_id,
104:         token: existingPending.snap_token,
105:       });
106:     }
107: 
108:     const shouldAutoRenew = enableAutoRenew !== undefined ? enableAutoRenew : planType === 'monthly';
109:     const amount = currency === 'USD'
110:       ? (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeUSD : MIDTRANS_PRICES.monthlyUSD)
111:       : (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeIDR : MIDTRANS_PRICES.monthlyIDR);
112: 
113:     const timestamp = Date.now().toString(36);
114:     const randomStr = Math.random().toString(36).substring(2, 10);
115:     const userIdShort = userId.substring(0, 12);
116:     const orderId = `JT-${userIdShort}-${timestamp}-${randomStr}`;
117: 
118:     const billingDay = new Date().getDate();
119: 
120:     getServerPostHog().capture({
121:       distinctId: userId,
122:       event: 'checkout_started',
123:       properties: { plan: planType, amount, currency },
124:     });
125: 
126:     return await createSnapTransaction({
127:       userId,
128:       planType,
129:       amount,
130:       currency,
131:       customerDetails,
132:       orderId,
133:       enableAutoRenew: shouldAutoRenew,
134:       billingDay,
135:     });
136:   } catch (error) {
137:     const err = error as { message?: string; code?: string };
138:     return NextResponse.json(
139:       { error: err.message || 'Failed to create transaction' },
140:       { status: 500 }
141:     );
142:   }
143: }
144: 
145: async function createSnapTransaction({
146:   userId,
147:   planType,
148:   amount,
149:   currency,
150:   customerDetails,
151:   orderId,
152:   enableAutoRenew = false,
153:   billingDay,
154: }: {
155:   userId: string;
156:   planType: 'monthly' | 'lifetime';
157:   amount: number;
158:   currency: string;
159:   customerDetails: {
160:     firstName: string;
161:     lastName: string;
162:     email: string;
163:     phone: string;
164:   };
165:   orderId: string;
166:   enableAutoRenew?: boolean;
167:   billingDay: number;
168: }) {
169:   const snapBody: any = {
170:     transaction_details: {
171:       order_id: orderId,
172:       gross_amount: amount,
173:       currency: currency,
174:     },
175:     customer_details: {
176:       first_name: customerDetails.firstName || 'JobTracker',
177:       last_name: customerDetails.lastName || 'User',
178:       email: customerDetails.email || '',
179:       phone: customerDetails.phone || '',
180:     },
181:     item_details: [
182:       {
183:         id: planType === 'lifetime' ? 'jobtracker_lifetime' : 'jobtracker_monthly',
184:         price: amount,
185:         quantity: 1,
186:         name: planType === 'lifetime' ? 'JobTracker Lifetime Pro' : 'JobTracker Monthly Pro',
187:         brand: 'JobTracker',
188:         currency: currency,
189:       },
190:     ],
191:     custom_field1: userId,
192:     custom_field2: planType,
193:     custom_field3: currency,
194:   };
195: 
196:   if (enableAutoRenew && planType === 'monthly') {
197:     snapBody.credit_card = {
198:       save_card: true,
199:     };
200:   }
201: 
202:   if (!MIDTRANS_CONFIG.serverKey) {
203:     console.error('Midtrans server key not configured');
204:     return NextResponse.json(
205:       { error: 'Midtrans server key not configured' },
206:       { status: 500 }
207:     );
208:   }
209: 
210:   const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
211:   const snapApiUrl = MIDTRANS_CONFIG.isProduction
212:     ? 'https://app.midtrans.com/snap/v1/transactions'
213:     : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
214: 
215:   console.log('Creating Midtrans transaction:', {
216:     orderId,
217:     amount,
218:     currency,
219:     snapApiUrl,
220:     serverKeyLength: MIDTRANS_CONFIG.serverKey.length,
221:     authStringLength: authString.length,
222:     enableAutoRenew,
223:     billingDay,
224:   });
225: 
226:   let response;
227:   try {
228:     const controller = new AbortController();
229:     const timeoutId = setTimeout(() => controller.abort(), 30000);
230: 
231:     response = await fetch(snapApiUrl, {
232:       method: 'POST',
233:       headers: {
234:         'Accept': 'application/json',
235:         'Content-Type': 'application/json',
236:         'Authorization': `Basic ${authString}`,
237:       },
238:       body: JSON.stringify(snapBody),
239:       signal: controller.signal,
240:     });
241: 
242:     clearTimeout(timeoutId);
243:   } catch (fetchError) {
244:     console.error('Failed to connect to Midtrans API:', fetchError);
245:     if (fetchError instanceof Error && fetchError.name === 'AbortError') {
246:       return NextResponse.json(
247:         { error: 'Midtrans API request timed out. Please try again.' },
248:         { status: 504 }
249:       );
250:     }
251:     return NextResponse.json(
252:       { error: `Failed to connect to Midtrans API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
253:       { status: 500 }
254:     );
255:   }
256: 
257:   const responseText = await response.text();
258:   console.log('Midtrans response status:', response.status);
259:   console.log('Midtrans response body:', responseText);
260: 
261:   if (!response.ok) {
262:     console.error('Midtrans API error:', response.status, responseText);
263:     return NextResponse.json(
264:       { error: `Midtrans API error: ${response.status} - ${responseText}` },
265:       { status: 500 }
266:     );
267:   }
268: 
269:   if (!responseText || responseText.trim() === '') {
270:     console.error('Midtrans API returned empty response body');
271:     return NextResponse.json(
272:       { error: 'Midtrans API returned empty response' },
273:       { status: 500 }
274:     );
275:   }
276: 
277:   const result = JSON.parse(responseText);
278: 
279:   if (!result.token) {
280:     console.error('Midtrans Snap error: No token in response', result);
281:     return NextResponse.json(
282:       { error: 'No token returned from Midtrans' },
283:       { status: 500 }
284:     );
285:   }
286: 
287:   const token = result.token;
288:   const redirectUrl = result.redirect_url;
289: 
290:   const transactionId = crypto.randomUUID();
291: 
292:   const { error: dbError } = await (supabaseAdmin as any)
293:     .from('pending_midtrans_transactions')
294:     .insert({
295:       id: transactionId,
296:       order_id: orderId,
297:       user_id: userId,
298:       plan: planType,
299:       amount: amount,
300:       snap_token: token,
301:       customer_email: customerDetails.email || null,
302:       currency: currency,
303:       billing_day: billingDay,
304:     });
305: 
306:   if (dbError) {
307:     console.error('Failed to store transaction in database:', dbError);
308:     return NextResponse.json(
309:       { error: `Failed to store transaction: ${dbError.message}` },
310:       { status: 500 }
311:     );
312:   }
313: 
314:   return NextResponse.json({
315:     success: true,
316:     orderId,
317:     token,
318:     redirectUrl,
319:   });
320: }

(End of file - total 320 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx</path>
<type>file</type>
<content>
1: // /home/nafhan/Documents/projek/job/src/app/login/page.tsx
2: "use client";
3: 
4: import { loginWithGoogle, handleRedirectResult } from "@/lib/firebase/auth";
5: import { useRouter } from "next/navigation"; 
6: import Link from "next/link";
7: import { ArrowLeft, Loader2 } from "lucide-react";
8: import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
9: import { useEffect, useState } from "react";
10: import { auth } from "@/lib/firebase/config";
11: import { onAuthStateChanged } from "firebase/auth";
12: import { ResetThemeToDefault } from "@/components/ResetThemeToDefault";
13: import { trackLoginCompleted, trackSignUpCompleted } from "@/lib/posthog/events";
14: 
15: export default function LoginPage() {
16:   const router = useRouter(); 
17:   const [isLoading, setIsLoading] = useState(false);
18:   
19:   // Handle redirect result (from popup-blocked fallback)
20:   useEffect(() => {
21:     let cancelled = false;
22:     handleRedirectResult().then((user) => {
23:       if (cancelled || !user) return;
24:       const sessionId = getOrCreateSessionId();
25:       const deviceInfo = getDeviceInfo();
26: 
27:       const isNewUser = user.metadata && (user.metadata as any).creationTime === (user.metadata as any).lastSignInTime;
28:       if (isNewUser) {
29:         trackSignUpCompleted("google");
30:       } else {
31:         trackLoginCompleted("google");
32:       }
33: 
34:       fetch(`/api/onboarding?userId=${user.uid}`)
35:         .then((res) => res.json())
36:         .then((data) => {
37:           fetch("/api/analytics/track", {
38:             method: "POST",
39:             headers: { "Content-Type": "application/json" },
40:             body: JSON.stringify({
41:               type: "login",
42:               userId: user.uid,
43:               userEmail: user.email || undefined,
44:               sessionId,
45:               deviceInfo,
46:             }),
47:           });
48:           fetch("/api/analytics/track", {
49:             method: "POST",
50:             headers: { "Content-Type": "application/json" },
51:             body: JSON.stringify({
52:               type: "dashboard",
53:               userId: user.uid,
54:               userEmail: user.email || undefined,
55:               sessionId,
56:               deviceInfo,
57:             }),
58:           });
59:           if (!data.completed) {
60:             router.push("/onboarding/language");
61:           } else {
62:             router.push("/dashboard");
63:           }
64:         })
65:         .catch(() => router.push("/dashboard"));
66:     });
67:     return () => { cancelled = true; };
68:   }, [router]);
69: 
70:   // Check if user is already logged in
71:   useEffect(() => {
72:     const unsubscribe = onAuthStateChanged(auth, async (user) => {
73:       if (user) {
74:         setIsLoading(true);
75:         try {
76:           const res = await fetch(`/api/onboarding?userId=${user.uid}`);
77:           const data = await res.json();
78:           if (!data.completed) {
79:             router.push("/onboarding/language");
80:           } else {
81:             router.push("/dashboard");
82:           }
83:         } catch (error) {
84:           console.error("Error checking onboarding:", error);
85:           router.push("/dashboard");
86:         }
87:       }
88:     });
89:     return () => unsubscribe();
90:   }, [router]);
91: 
92:   const handleLogin = async () => {
93:     if (isLoading) return;
94:     setIsLoading(true);
95:     try {
96:       const sessionId = getOrCreateSessionId();
97:       const deviceInfo = getDeviceInfo();
98: 
99:       const user = await loginWithGoogle();
100:       if (user) {
101:         const isNewUser = (user.metadata as any).creationTime === (user.metadata as any).lastSignInTime;
102:         if (isNewUser) {
103:           trackSignUpCompleted("google");
104:         } else {
105:           trackLoginCompleted("google");
106:         }
107: 
108:         try {
109:           const onboardingRes = await fetch(`/api/onboarding?userId=${user.uid}`);
110:           const onboardingData = await onboardingRes.json();
111: 
112:           await fetch("/api/analytics/track", {
113:             method: "POST",
114:             headers: { "Content-Type": "application/json" },
115:             body: JSON.stringify({ 
116:               type: "login",
117:               userId: user.uid,
118:               userEmail: user.email || undefined,
119:               sessionId,
120:               deviceInfo,
121:             }),
122:           });
123: 
124:           await fetch("/api/analytics/track", {
125:             method: "POST",
126:             headers: { "Content-Type": "application/json" },
127:             body: JSON.stringify({ 
128:               type: "dashboard", 
129:               userId: user.uid,
130:               userEmail: user.email || undefined,
131:               sessionId,
132:               deviceInfo,
133:             }),
134:           });
135: 
136:           if (!onboardingData.completed) {
137:             router.push("/onboarding/language");
138:           } else {
139:             router.push("/dashboard");
140:           }
141:         } catch (error) {
142:           console.error("Error checking onboarding:", error);
143:           router.push("/dashboard");
144:         }
145:       } else {
146:         setIsLoading(false);
147:       }
148:     } catch (error) {
149:       console.error(error);
150:       alert("Gagal login bro"); 
151:       setIsLoading(false);
152:     }
153:   };
154:   return (
155:     <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground relative overflow-hidden">
156:       <ResetThemeToDefault />
157:       <div className="relative z-10 w-full max-w-md px-6">
158:         
159:         <div className="mb-8">
160:             <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group">
161:                 <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
162:                 Back to Home
163:             </Link>
164:         </div>
165:         <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 text-center relative overflow-hidden group">  
166:             <h2 className="text-3xl font-bold tracking-wider mb-2 text-foreground">
167:                 Job<span className="text-primary">Tracker</span>.
168:             </h2>
169:             <p className="text-muted-foreground text-sm mb-8 font-normal">
170:                 Manage your professional journey with confidence.
171:             </p>
172:             <button 
173:                 onClick={handleLogin}
174:                 disabled={isLoading}
175:                 className={`w-full flex items-center justify-center gap-3 bg-white text-slate-900 dark:bg-slate-900 dark:text-white border border-border px-6 py-4 rounded-lg font-semibold tracking-wide transition-all duration-300 shadow-md ${
176:                   isLoading ? "opacity-70 cursor-wait" : "hover:bg-gray-50 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
177:                 }`}
178:             >
179:                 {isLoading ? (
180:                   <Loader2 className="w-5 h-5 animate-spin" />
181:                 ) : (
182:                   <svg className="w-5 h-5" viewBox="0 0 24 24">
183:                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
184:                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
185:                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
186:                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
187:                   </svg>
188:                 )}
189:                 {isLoading ? "Signing in..." : "Sign in with Google"}
190:             </button>
191:             <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
192:                 By continuing, you agree to our Terms of Service and Privacy Policy.
193:             </div>
194:         </div>
195:       </div>
196:     </div>
197:   );
198: }

(End of file - total 198 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/payment/midtrans/page.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/payment/midtrans/page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect, useState, Suspense } from "react";
4: import { useRouter, useSearchParams } from "next/navigation";
5: import { useAuth, forceReloadSubscription } from "@/lib/firebase/auth-context";
6: import { useLanguage } from "@/lib/language/context";
7: import Navbar from "@/components/Navbar";
8: import { trackPaymentCompleted, trackPaymentFailed } from "@/lib/posthog/events";
9: import {
10:   ArrowLeft,
11:   CheckCircle2,
12:   ArrowRight,
13:   AlertTriangle,
14:   Loader2,
15:   ShieldCheck,
16:   Lock,
17:   CreditCard,
18:   RefreshCw
19: } from "lucide-react";
20: 
21: function PaymentPage() {
22:   const router = useRouter();
23:   const searchParams = useSearchParams();
24:   const { user, loading: authLoading } = useAuth();
25:   const { t } = useLanguage();
26:   const [isLoading, setIsLoading] = useState(true);
27:   const [paymentData, setPaymentData] = useState<any>(null);
28:   const [error, setError] = useState<string>("");
29:   const [paymentSuccess, setPaymentSuccess] = useState(false);
30: 
31:   const orderId = searchParams.get("orderId");
32: 
33:   useEffect(() => {
34:     const loadMidtransScript = () => {
35:       if (typeof window !== 'undefined' && !window.snap) {
36:         const script = document.createElement('script');
37:         script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
38:           ? "https://app.midtrans.com/snap/snap.js"
39:           : "https://app.sandbox.midtrans.com/snap/snap.js";
40:         script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
41:         document.body.appendChild(script);
42:       }
43:     };
44: 
45:     loadMidtransScript();
46:   }, []);
47: 
48:   useEffect(() => {
49:     const fetchPaymentData = async () => {
50:       if (!orderId) {
51:         setError("Missing order ID");
52:         setIsLoading(false);
53:         return;
54:       }
55: 
56:       try {
57:         const response = await fetch(`/api/payment/midtrans/charge?orderId=${orderId}`);
58: 
59:         if (!response.ok) {
60:           const errorText = await response.text();
61:           setError(`Payment API error (${response.status}): ${errorText || 'Unknown error'}`);
62:           setIsLoading(false);
63:           return;
64:         }
65: 
66:         const data = await response.json();
67: 
68:         if (data.success && data.amount) {
69:           setPaymentData({
70:             ...data,
71:             amount: data.amount,
72:           });
73:           setIsLoading(false);
74:         } else {
75:           setError(data.error || "Failed to fetch payment data");
76:           setIsLoading(false);
77:         }
78:       } catch (err) {
79:         setError("Failed to connect to payment server");
80:         setIsLoading(false);
81:       }
82:     };
83: 
84:     fetchPaymentData();
85:   }, [orderId]);
86: 
87:   const handlePayment = async () => {
88:     try {
89:       setIsLoading(true);
90:       setError("");
91:       setPaymentSuccess(false);
92: 
93:       if (typeof window === 'undefined' || !window.snap) {
94:         setError("Midtrans Snap not loaded. Please refresh page.");
95:         setIsLoading(false);
96:         return;
97:       }
98: 
99:       const snapToken = paymentData?.token;
100: 
101:       if (!snapToken) {
102:         setError("Payment token not found. Please try again.");
103:         setIsLoading(false);
104:         return;
105:       }
106: 
107:       window.snap?.pay(snapToken, {
108:         onSuccess: async (result: any) => {
109:           console.log('Payment success:', result);
110:           setPaymentSuccess(true);
111:           trackPaymentCompleted(
112:             paymentData?.plan || 'unknown',
113:             paymentData?.amount || 0,
114:             result.payment_type || 'unknown'
115:           );
116: 
117:           setTimeout(async () => {
118:             if (user) {
119:               console.log('Payment page: About to force reload subscription');
120:               console.log('Payment page: Current user:', {
121:                 uid: user.uid,
122:                 email: user.email,
123:                 displayName: user.displayName
124:               });
125: 
126:               const result = await forceReloadSubscription();
127:               console.log('Payment page: Force reload result:', result);
128:             }
129:             router.push('/dashboard');
130:           }, 2000);
131:         },
132:         onPending: (result: any) => {
133:           console.log('Payment pending:', result);
134:           setIsLoading(false);
135:         },
136:         onError: (result: any) => {
137:           console.error('Payment failed:', result);
138:           setError('Payment failed. Please try again.');
139:           setIsLoading(false);
140:           setPaymentSuccess(false);
141:           trackPaymentFailed(paymentData?.plan || 'unknown', result.status_message || 'midtrans_error');
142:         },
143:         onClose: () => {
144:           console.log('Payment popup closed');
145:           setIsLoading(false);
146:           if (!paymentSuccess) {
147:             setPaymentData(null);
148:           }
149:         },
150:       });
151:     } catch (err) {
152:       console.error('Payment error:', err);
153:       setError('Failed to initiate payment. Please try again.');
154:       setIsLoading(false);
155:       setPaymentSuccess(false);
156:     }
157:   };
158: 
159:   // --- UI STATES ---
160: 
161:   if (!orderId) {
162:     return (
163:       <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
164:         <div className="max-w-md w-full text-center space-y-4">
165:           <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
166:             <AlertTriangle className="w-8 h-8" />
167:           </div>
168:           <h1 className="text-2xl font-bold tracking-tight">Invalid Request</h1>
169:           <p className="text-muted-foreground">Order ID is missing from the URL.</p>
170:           <button
171:             onClick={() => router.push("/upgrade")}
172:             className="mt-6 w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
173:           >
174:             Back to Upgrade
175:           </button>
176:         </div>
177:       </div>
178:     );
179:   }
180: 
181:   if (authLoading) {
182:     return (
183:       <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
184:         <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
185:         <p className="text-sm text-muted-foreground font-medium animate-pulse">Authenticating...</p>
186:       </div>
187:     );
188:   }
189: 
190:   if (!user) {
191:     return (
192:       <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
193:         <div className="max-w-md w-full text-center space-y-4">
194:           <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
195:           <h1 className="text-xl font-semibold">Authentication Required</h1>
196:           <p className="text-muted-foreground">Please log in to complete your payment.</p>
197:         </div>
198:       </div>
199:     );
200:   }
201: 
202:   return (
203:     <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-background text-foreground font-sans">
204:       <Navbar />
205: 
206:       <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
207:         <div className="w-full max-w-lg">
208:           {/* Back Button */}
209:           <button
210:             onClick={() => router.push("/upgrade")}
211:             className="mb-8 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors group"
212:           >
213:             <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
214:             Back to Upgrade
215:           </button>
216: 
217:            {/* Main Card */}
218:            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
219:              {isLoading ? (
220:                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
221:                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
222:                    <h2 className="text-lg font-semibold mb-2">Preparing Checkout</h2>
223:                    <p className="text-sm text-muted-foreground max-w-xs">
224:                      Please wait a moment while we set up your secure payment session.
225:                    </p>
226:                </div>
227:              ) : paymentSuccess ? (
228:                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
229:                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
230:                    <CheckCircle2 className="w-8 h-8" />
231:                  </div>
232:                  <h2 className="text-xl font-bold mb-2 text-emerald-600">Payment Successful!</h2>
233:                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
234:                    Thank you for your subscription! We're updating your account...
235:                  </p>
236:                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
237:                    <Loader2 className="w-4 h-4 animate-spin" />
238:                    <span className="text-sm">Redirecting to dashboard...</span>
239:                  </div>
240:                </div>
241:              ) : error ? (
242:               <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
243:                 <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
244:                   <AlertTriangle className="w-8 h-8" />
245:                 </div>
246:                 <h2 className="text-xl font-bold mb-2">Payment Error</h2>
247:                 <p className="text-sm text-muted-foreground mb-8 max-w-sm">{error}</p>
248:                 <button
249:                   onClick={() => window.location.reload()}
250:                   className="w-full py-3 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-colors"
251:                 >
252:                   Try Again
253:                 </button>
254:               </div>
255:             ) : paymentData && (
256:               <div className="flex flex-col">
257:                 {/* Header */}
258:                 <div className="bg-muted/30 border-b border-border p-6 text-center">
259:                   <h2 className="text-lg font-semibold">Order Summary</h2>
260:                 </div>
261: 
262:                 {/* Body / Receipt */}
263:                 <div className="p-6 space-y-6">
264:                   <div className="space-y-4">
265:                     <div className="flex justify-between items-center pb-4 border-b border-border/50">
266:                       <span className="text-sm text-muted-foreground">Order ID</span>
267:                       <span className="text-sm font-mono text-foreground">{orderId}</span>
268:                     </div>
269:                     
270:                     <div className="flex justify-between items-center pb-4 border-b border-border/50">
271:                       <span className="text-sm text-muted-foreground">Payment Gateway</span>
272:                       <span className="text-sm font-medium text-foreground flex items-center gap-2">
273:                         <CreditCard className="w-4 h-4 text-primary" />
274:                         Midtrans
275:                       </span>
276:                     </div>
277: 
278:                     <div className="flex justify-between items-center pt-2">
279:                       <span className="text-base font-medium">Total Amount</span>
280:                       <span className="text-2xl font-bold tracking-tight text-primary">
281:                         Rp {paymentData.amount?.toLocaleString('id-ID')}
282:                       </span>
283:                     </div>
284:                   </div>
285: 
286:                   {/* Pay Button */}
287:                   <button
288:                     onClick={handlePayment}
289:                     disabled={isLoading}
290:                     className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
291:                   >
292:                     Pay Now
293:                     <ArrowRight className="w-5 h-5" />
294:                   </button>
295:                 </div>
296: 
297:                 {/* Footer Trust Badges */}
298:                 <div className="bg-muted/30 p-6 border-t border-border">
299:                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
300:                     <div className="flex items-center gap-1.5">
301:                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
302:                       <span>Secure by Midtrans</span>
303:                     </div>
304:                     <div className="hidden sm:block text-border">•</div>
305:                     <div className="flex items-center gap-1.5">
306:                       <Lock className="w-4 h-4" />
307:                       <span>Encrypted Checkout</span>
308:                     </div>
309:                   </div>
310:                 </div>
311:               </div>
312:             )}
313:           </div>
314:           
315:           {/* Bottom Cancel Link */}
316:           {!isLoading && !error && (
317:             <div className="mt-6 text-center">
318:               <button
319:                 onClick={() => router.push("/upgrade")}
320:                 className="text-sm text-muted-foreground hover:text-foreground transition-colors"
321:               >
322:                 Cancel transaction
323:               </button>
324:             </div>
325:           )}
326:         </div>
327:       </main>
328: 
329:       <footer className="py-6 border-t border-border text-center text-xs text-muted-foreground">
330:         <p>&copy; {new Date().getFullYear()} JobTracker. All rights reserved.</p>
331:       </footer>
332:     </div>
333:   );
334: }
335: 
336: export default function MidtransPaymentPage() {
337:   return (
338:     <Suspense fallback={
339:       <div className="min-h-screen flex items-center justify-center bg-background">
340:         <Loader2 className="w-8 h-8 text-primary animate-spin" />
341:       </div>
342:     }>
343:       <PaymentPage />
344:     </Suspense>
345:   );
346: }

(End of file - total 346 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/upgrade/page.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/upgrade/page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useState, useEffect } from "react";
4: import { useRouter } from "next/navigation";
5: import { useAuth } from "@/lib/firebase/auth-context";
6: import { useLanguage } from "@/lib/language/context";
7: import Navbar from "@/components/Navbar";
8: import { TwitterShareModal } from "@/components/TwitterShareModal";
9: import { ArrowLeft, CheckCircle2, ArrowRight, Star, Tag, Gift, AlertTriangle, Clock, Loader2 } from "lucide-react";
10: import { Button } from "@/components/ui/button";
11: import { detectLocation } from "@/lib/utils/location";
12: import { PRICING_USD, PRICING_IDR, LIFETIME_ACCESS_LIMIT } from "@/lib/pricing-config";
13: import { MIDTRANS_PRICES } from "@/lib/midtrans-config";
14: import { trackPricingViewed } from "@/lib/posthog/events";
15: 
16: export default function UpgradePage() {
17:   const router = useRouter();
18:   const { user, loading: authLoading } = useAuth();
19:   const { t } = useLanguage();
20: 
21:   useEffect(() => {
22:     if (!authLoading && !user) {
23:       router.push("/login");
24:     }
25:   }, [user, authLoading, router]);
26: 
27:   useEffect(() => {
28:     trackPricingViewed();
29:   }, []);
30: 
31:   if (authLoading) {
32:     return (
33:       <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-4">
34:         <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
35:         <p className="text-muted-foreground animate-pulse">Loading...</p>
36:       </div>
37:     );
38:   }
39: 
40:   if (!user) return null;
41: 
42:   return (
43:     <div className="flex flex-col min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
44:       <Navbar />
45: 
46:       <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16 px-6">
47:         <div className="w-full max-w-6xl mb-8">
48:           <Button
49:             variant="ghost"
50:             onClick={() => router.push("/dashboard")}
51:             className="text-foreground hover:text-primary hover:bg-accent"
52:           >
53:             <ArrowLeft className="w-4 h-4 mr-2" />
54:             Back to Dashboard
55:           </Button>
56:         </div>
57: 
58:         <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
59:           <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
60:             Upgrade Your Account
61:           </h1>
62:           <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
63:             You've reached your free plan limit. Upgrade to unlock unlimited job tracking and premium features.
64:           </p>
65:         </div>
66: 
67:         <PricingCards user={user} />
68:       </main>
69:     </div>
70:   );
71: }
72: 
73: function PricingCards({ user }: { user: any }) {
74:   const { t } = useLanguage();
75:   const router = useRouter();
76: 
77:   const [isIndonesia, setIsIndonesia] = useState(true);
78:   const [loadingLocation, setLoadingLocation] = useState(true);
79:   const [lifetimeAvailability, setLifetimeAvailability] = useState<any>(null);
80:   const [loadingLifetime, setLoadingLifetime] = useState(true);
81:   const [showTwitterModal, setShowTwitterModal] = useState(false);
82:   const [pendingPlanType, setPendingPlanType] = useState<'monthly' | 'lifetime'>('monthly');
83: 
84:   useEffect(() => {
85:     const fetchData = async () => {
86:       try {
87:         const location = await detectLocation();
88:         setIsIndonesia(location.isIndonesia);
89:         
90:         const response = await fetch('/api/payment/lifetime-availability');
91:         const data = await response.json();
92:         setLifetimeAvailability(data);
93:       } catch (error) {
94:         console.error('Error fetching pricing data:', error);
95:       } finally {
96:         setLoadingLocation(false);
97:         setLoadingLifetime(false);
98:       }
99:     };
100:     
101:     fetchData();
102:   }, []);
103: 
104:   const pricing = isIndonesia ? PRICING_IDR : PRICING_USD;
105:   const showLifetime = !loadingLifetime && lifetimeAvailability?.isAvailable;
106: 
107:   return (
108:     <div className="w-full max-w-6xl">
109:       {!loadingLifetime && showLifetime && lifetimeAvailability && (
110:         <div className="mb-8 bg-gradient-to-r from-orange-500/90 to-red-500/90 border border-orange-400/50 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4 shadow-lg animate-[scale-up-down_2s_ease-in-out_infinite]">
111:           <div className="flex items-center gap-3">
112:             <div className="bg-white/20 p-2.5 rounded-full">
113:               <Clock className="w-5 h-5 text-white" />
114:             </div>
115:             <div>
116:               <p className="font-semibold text-white text-base">Limited Availability: {lifetimeAvailability.remaining} slots remaining</p>
117:               <p className="text-sm text-white/90">
118:                 {LIFETIME_ACCESS_LIMIT - lifetimeAvailability.remaining} already claimed • Claim yours today
119:               </p>
120:             </div>
121:           </div>
122:           <div className="flex items-center gap-3">
123:             <div className="w-32 h-2.5 bg-white/30 rounded-full overflow-hidden">
124:               <div
125:                 className="h-full bg-white transition-all duration-500"
126:                 style={{ width: `${(lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100}%` }}
127:               />
128:             </div>
129:             <span className="text-sm font-medium text-white bg-white/15 px-3 py-1.5 rounded-full">
130:               {Math.round((lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100)}% available
131:             </span>
132:           </div>
133:         </div>
134:       )}
135:       {loadingLocation || loadingLifetime ? (
136:         <div className="grid gap-6 lg:gap-8 items-start md:grid-cols-3">
137:           <PricingCardSkeleton />
138:           <PricingCardSkeleton />
139:           <PricingCardSkeleton isFeatured={true} />
140:         </div>
141:       ) : (
142:         <>
143:           <div className={`grid gap-6 lg:gap-8 items-stretch ${showLifetime ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
144:             
145:             <PricingCard
146:               plan="Free Plan"
147:               price={pricing.free.price}
148:               period="forever"
149:               description="Your current plan"
150:               features={[
151:                 "Track up to 10 Applications",
152:                 "Basic Application Tracker",
153:                 "Basic Filters",
154:                 "View & Track Status",
155:               ]}
156:               buttonText="Current Plan"
157:               isFree
158:               disabled={true}
159:               user={user}
160:             />
161: 
162:             <PricingCard
163:               plan={t("pricing.monthly.title")}
164:               price={pricing.monthly.price}
165:               originalPrice={pricing.monthly.originalPrice}
166:               period={isIndonesia ? "/bulan" : "/month"}
167:               description={t("pricing.monthly.desc")}
168:               features={[
169:                 t("pricing.monthly.feature1"),
170:                 t("pricing.monthly.feature2"),
171:                 t("pricing.monthly.feature3"),
172:                 t("pricing.monthly.feature4"),
173:               ]}
174:               buttonText={t("pricing.monthly.cta")}
175:               user={user}
176:               isIndonesia={isIndonesia}
177:               discount={pricing.monthly.discount}
178:             />
179: 
180:             {showLifetime ? (
181:               <PricingCard
182:                 plan={t("pricing.lifetime.title")}
183:                 price={pricing.lifetime.price}
184:                 originalPrice={pricing.lifetime.originalPrice}
185:                 period="one-time"
186:                 description={t("pricing.lifetime.desc")}
187:                 features={[
188:                   t("pricing.lifetime.feature1"),
189:                   t("pricing.lifetime.feature2"),
190:                   t("pricing.lifetime.feature3"),
191:                   t("pricing.lifetime.feature4"),
192:                 ]}
193:                 buttonText={t("pricing.lifetime.cta")}
194:                 isFeatured
195:                 user={user}
196:                 isIndonesia={isIndonesia}
197:                 showSlotCounter={true}
198:                 remainingSlots={lifetimeAvailability?.remaining || 0}
199:                 discount={pricing.lifetime.discount}
200:                 onLifetimeClick={() => {
201:                   setPendingPlanType('lifetime');
202:                   setShowTwitterModal(true);
203:                 }}
204:               />
205:             ) : null}
206:           </div>
207: 
208:           {!loadingLifetime && !showLifetime && (
209:             <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
210:               <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
211:               <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-1">Lifetime Access Habis</p>
212:               <p className="text-yellow-700 dark:text-yellow-200 text-sm">
213:                 Semua {LIFETIME_ACCESS_LIMIT} slot lifetime access sudah terisi. Tapi jangan khawatir, paket bulanan tetap tersedia!
214:               </p>
215:             </div>
216:           )}
217: 
218:           <TwitterShareModal
219:             isOpen={showTwitterModal}
220:             onClose={() => setShowTwitterModal(false)}
221:             onConfirm={async () => {
222:               setShowTwitterModal(false);
223:               if (user) {
224:                 const planType = pendingPlanType;
225:                 const response = await fetch('/api/payment/midtrans/charge', {
226:                   method: 'POST',
227:                   headers: { 'Content-Type': 'application/json' },
228:                   body: JSON.stringify({
229:                     userId: user.uid,
230:                     plan: planType,
231:                     currency: isIndonesia ? 'IDR' : 'USD',
232:                     customerDetails: {
233:                       firstName: user.displayName?.split(' ')[0] || '',
234:                       lastName: user.displayName?.split(' ').slice(1).join('') || '',
235:                       email: user.email || '',
236:                       phone: user.phoneNumber || '',
237:                     },
238:                   }),
239:                 });
240: 
241:                 if (!response.ok) {
242:                   const errorText = await response.text();
243:                   console.error('Payment API error:', response.status, errorText);
244:                   alert(`Payment error (${response.status}): ${errorText || 'Unknown error'}`);
245:                   return;
246:                 }
247: 
248:                 const data = await response.json();
249: 
250:                 if (data.success) {
251:                   router.push(`/payment/midtrans?orderId=${data.orderId}`);
252:                 } else {
253:                   console.error('Failed to create transaction:', data.error);
254:                   alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
255:                 }
256:               }
257:              }}
258:           />
259:         </>
260:       )}
261:     </div>
262:   );
263: }
264: 
265:  function PricingCard({
266:   plan,
267:   price,
268:   originalPrice,
269:   period,
270:   description,
271:   features,
272:   buttonText,
273:   isFeatured = false,
274:   isFree = false,
275:   isIndonesia = false,
276:   showSlotCounter = false,
277:   remainingSlots = 0,
278:   disabled = false,
279:   user,
280:   discount,
281:   onLifetimeClick,
282: }: {
283:   plan: string;
284:   price: string;
285:   originalPrice?: string;
286:   period: string;
287:   description: string;
288:   features: string[];
289:   buttonText: string;
290:   isFeatured?: boolean;
291:   isFree?: boolean;
292:   isIndonesia?: boolean;
293:   showSlotCounter?: boolean;
294:   remainingSlots?: number;
295:   disabled?: boolean;
296:   user?: any;
297:   discount?: string;
298:   onLifetimeClick?: () => void;
299: }) {
300:   const { t } = useLanguage();
301:   const router = useRouter();
302: 
303:   const isLifetime = plan.toLowerCase().includes('lifetime');
304:   const isMonthly = plan.toLowerCase().includes('monthly');
305:   const isFreePlan = plan.toLowerCase().includes('free');
306: 
307:   const handleSubscribe = async () => {
308:     if (disabled) return;
309: 
310:     if (user) {
311:       const planType = isLifetime ? 'lifetime' : 'monthly';
312: 
313:       const response = await fetch('/api/payment/midtrans/charge', {
314:         method: 'POST',
315:         headers: { 'Content-Type': 'application/json' },
316:         body: JSON.stringify({
317:           userId: user.uid,
318:           plan: planType,
319:           currency: isIndonesia ? 'IDR' : 'USD',
320:           enableAutoRenew: planType === 'monthly',
321:           customerDetails: {
322:             firstName: user.displayName?.split(' ')[0] || '',
323:             lastName: user.displayName?.split(' ').slice(1).join('') || '',
324:             email: user.email || '',
325:             phone: user.phoneNumber || '',
326:           },
327:         }),
328:       });
329: 
330:       if (!response.ok) {
331:         const errorText = await response.text();
332:         console.error('Payment API error:', response.status, errorText);
333:         alert(`Payment error (${response.status}): ${errorText || 'Unknown error'}`);
334:         return;
335:       }
336: 
337:       const data = await response.json();
338: 
339:       if (data.success) {
340:         router.push(`/payment/midtrans?orderId=${data.orderId}`);
341:       } else {
342:         console.error('Failed to create transaction:', data.error);
343:         alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
344:       }
345:     } else {
346:       router.push("/login");
347:     }
348:   };
349: 
350:   return (
351:     <div
352:       className={`group relative h-full flex flex-col p-10 rounded-2xl transition-all duration-300 bg-card border ${
353:         isFeatured
354:           ? "border-primary/50 shadow-lg md:-translate-y-2 z-10 ring-2 ring-primary/10"
355:           : isFree
356:           ? "border-border opacity-75"
357:           : "border-border hover:border-primary/20 hover:shadow-sm"
358:       }`}
359:     >
360:       {isFeatured && (
361:         <div className="absolute -top-3 right-6">
362:           <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-full tracking-wide shadow-md flex items-center gap-1">
363:             <Star className="w-3 h-3 fill-current" /> {t("pricing.badge.best")}
364:           </span>
365:         </div>
366:       )}
367:       
368:       {isFree && (
369:         <div className="absolute -top-3 right-6">
370:           <span className="bg-gray-500 text-white text-xs font-medium px-4 py-1.5 rounded-full tracking-wide shadow-md flex items-center gap-1">
371:             Current
372:           </span>
373:         </div>
374:       )}
375: 
376:       <h3 className="text-2xl font-bold text-foreground">{plan}</h3>
377:       <p className="text-muted-foreground text-sm mt-2">{description}</p>
378:       
379:       <div className="mt-8">
380:         {originalPrice && (
381:           <div className="flex items-center gap-2.5 mb-2">
382:             <span className="text-lg text-muted-foreground line-through decoration-muted-foreground decoration-2 font-medium">
383:               {originalPrice}
384:             </span>
385:             <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
386:               {discount ? `Save ${discount}` : (() => {
387:                 const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
388:                 const current = parseFloat(price.replace(/[^0-9.]/g, ''));
389:                 const discount = original > 0 ? Math.round(((original - current) / original) * 100) : 0;
390:                 return `${t("pricing.badge.save")} ${discount}%`;
391:               })()}
392:             </span>
393:           </div>
394:         )}
395: 
396:         <div className="flex items-baseline gap-1">
397:           <span className="text-4xl md:text-5xl font-bold text-foreground">{price}</span>
398:           <span className="text-muted-foreground font-medium">{period}</span>
399:         </div>
400: 
401:         {showSlotCounter && (
402:           <div className="mt-3 bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30 rounded-lg p-3 flex items-center gap-2">
403:             <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
404:             <div className="flex flex-col">
405:               <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
406:                 {remainingSlots} slots remaining
407:               </span>
408:               <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70">
409:                 Limited availability
410:               </span>
411:             </div>
412:           </div>
413:         )}
414:       </div>
415: 
416:       <ul className="mt-8 space-y-4 flex-1">
417:         {features.map((feature, index) => (
418:           <li key={index} className="flex items-start gap-3">
419:             <div className={`mt-0.5 p-0.5 rounded-full ${isFeatured ? "bg-primary/20 text-primary" : "text-muted-foreground/40"}`}>
420:               <CheckCircle2 className={`w-5 h-5 ${isFeatured ? "text-emerald-500" : "text-muted-foreground"}`} />
421:             </div>
422:             <span className={`text-sm ${isFeatured ? "text-foreground font-medium" : "text-muted-foreground"}`}>
423:               {feature}
424:             </span>
425:           </li>
426:         ))}
427:       </ul>
428: 
429:       <div className="mt-10 relative z-20">
430:         <button
431:           onClick={() => {
432:             if (disabled) return;
433:             if (isFree) {
434:               return;
435:             }
436:             if (!user) {
437:               router.push("/login");
438:               return;
439:             }
440:             if (isFeatured && onLifetimeClick) {
441:               onLifetimeClick();
442:             } else {
443:               handleSubscribe();
444:             }
445:           }}
446:           disabled={disabled}
447:           className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
448:             isFeatured
449:               ? "bg-primary text-white hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-primary/50"
450:               : isFree
451:               ? "bg-gray-400 text-white cursor-not-allowed"
452:               : "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
453:           }`}
454:         >
455:           {disabled
456:             ? buttonText
457:             : user
458:             ? (isFree ? buttonText : isIndonesia ? "Mulai Sekarang" : "Pay Now")
459:             : buttonText}
460:           <ArrowRight className="ml-2 w-4 h-4" />
461:         </button>
462:       </div>
463:     </div>
464:   );
465: }
466: 
467: function PricingCardSkeleton({ isFeatured = false }: { isFeatured?: boolean }) {
468:   return (
469:     <div
470:       className={`group relative p-8 rounded-2xl transition-all duration-300 bg-card border shadow-sm animate-pulse ${
471:         isFeatured 
472:           ? "border-primary border-2 shadow-md md:-translate-y-4 z-10" 
473:           : "border-border"
474:       }`}
475:     >
476:       {isFeatured && (
477:         <div className="absolute -top-4 right-6">
478:           <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 h-7 w-24"></div>
479:         </div>
480:       )}
481: 
482:       <div className="space-y-4">
483:         <div className="h-7 bg-muted rounded w-32"></div>
484:         <div className="h-4 bg-muted rounded w-48"></div>
485:         
486:         {isFeatured && (
487:           <>
488:             <div className="flex items-center gap-2 mb-1 mt-6">
489:               <div className="h-5 bg-muted rounded w-24"></div>
490:               <div className="h-5 bg-muted rounded w-16"></div>
491:             </div>
492: 
493:             <div className="flex items-center gap-2 mt-2">
494:               <div className="h-4 bg-muted rounded w-4"></div>
495:               <div className="h-4 bg-muted rounded w-20"></div>
496:             </div>
497:           </>
498:         )}
499: 
500:         <div className="flex items-baseline gap-1 mt-6">
501:           <div className="h-12 bg-muted rounded w-40"></div>
502:           <div className="h-6 bg-muted rounded w-20"></div>
503:         </div>
504:       </div>
505: 
506:       <div className="space-y-4 mt-8">
507:         {[1, 2, 3, 4].map((i) => (
508:           <div key={i} className="flex items-start gap-3">
509:             <div className="w-5 h-5 bg-muted rounded-full"></div>
510:             <div className="h-4 bg-muted rounded flex-1"></div>
511:           </div>
512:         ))}
513:       </div>
514: 
515:       <div className="h-12 bg-muted rounded w-full mt-8"></div>
516:       {isFeatured && (
517:         <div className="h-3 bg-muted rounded w-32 mx-auto mt-4"></div>
518:       )}
519:     </div>
520:   );
521: }

(End of file - total 521 lines)
</content>
```

---

## Assistant (Plan · GLM-5.1 · 2.8s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/next.config.mjs"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/next.config.mjs</path>
<type>file</type>
<content>
1: // next.config.mjs
2: import withPWA from 'next-pwa';
3: 
4: /** @type {import('next').NextConfig} */
5: 
6: const baseConfig = {
7:     async headers() {
8:         return [
9:             {
10:                 source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
11:                 headers: [
12:                     {
13:                         key: 'Content-Security-Policy',
14:                         value: `
15:               default-src 'self';
16:               script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://effectivelyassets.com https://vercel.live https://apis.google.com https://accounts.google.com https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js https://us.i.posthog.com https://us-assets.i.posthog.com;
17:               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
18:               font-src 'self' https://fonts.gstatic.com https://vercel.live;
19:               img-src 'self' data: https://*.googleusercontent.com https://grainy-gradients.vercel.app https://vercel.live https://us.i.posthog.com;
20:               connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://vercel.live https://accounts.google.com https://www.googleapis.com https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com;
21:               frame-src 'self' https://vercel.live https://accounts.google.com https://*.firebaseapp.com https://app.sandbox.midtrans.com https://app.midtrans.com;
22:               object-src 'none';
23:               base-uri 'self';
24:               form-action 'self';
25:               frame-ancestors 'self';
26:               upgrade-insecure-requests;
27:             `.replace(/\s{2,}/g, ' ').trim(),
28:                     },
29:                 ],
30:             },
31:             {
32:                 source: '/payment/midtrans/:path*',
33:                 headers: [
34:                     {
35:                         key: 'Content-Security-Policy',
36:                         value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js; default-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.midtrans.com https://*.firebaseio.com https://*.firebase.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
37:                     },
38:                 ],
39:             },
40:             {
41:                 source: '/payment/finish',
42:                 headers: [
43:                     {
44:                         key: 'Content-Security-Policy',
45:                         value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com; default-src 'self'; connect-src 'self' https://*.midtrans.com https://*.firebaseio.com https://*.firebase.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com; style-src 'self' 'unsafe-inline';",
46:                     },
47:                 ],
48:             },
49:             {
50:                 source: '/api/payment/midtrans/webhook',
51:                 headers: [
52:                     {
53:                         key: 'Access-Control-Allow-Origin',
54:                         value: '*',
55:                     },
56:                     {
57:                         key: 'Access-Control-Allow-Methods',
58:                         value: 'POST, OPTIONS',
59:                     },
60:                     {
61:                         key: 'Access-Control-Allow-Headers',
62:                         value: 'Content-Type, x-callback-token, x-signature-key',
63:                     },
64:                 ],
65:             },
66:         ];
67:     },
68: };
69: 
70: export default process.env.NODE_ENV === 'development'
71:     ? baseConfig
72:     : withPWA({
73:         dest: 'public',
74:         disable: false,
75:         register: true,
76:         skipWaiting: true,
77:         ...baseConfig,
78:     });

(End of file - total 78 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/**/page.tsx"
}
```

**Output:**
```
/home/nafhan/Documents/job/JobTracker/src/app/upgrade/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/payment/midtrans/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/dashboard/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/dashboard/billing/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/terms-policy/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/pricing/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/payment/finish/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/onboarding/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/onboarding/language/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/onboarding/questions/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/jps-shop/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/admin/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/payment/error/page.tsx
/home/nafhan/Documents/job/JobTracker/src/app/payment/unfinish/page.tsx
```

---

## Assistant (Plan · GLM-5.1 · 212.5s)

_Thinking:_

Now I have a good understanding of the codebase. Let me plan the Meta Pixel integration.

The user needs to set up Meta Pixel with these events:
1. **ViewContent** - Page views/landing pages
2. **CompleteRegistration** - Sign up
3. **InitiateCheckout** - Start checkout
4. **AddPaymentInfo** - Adding payment info
5. **Purchase** - Purchase completion
6. **Subscribe** - Subscription start
7. **StartTrial** - (could be for free trial/start)
8. **Lead** - Could be sign up or lead generation
9. **Search** - Job search
10. **Contact** - Contact action
11. **AddToCart** - Adding to cart (pricing page)
12. **CustomizeProduct** - Customization
13. **AddToWishlist** - Save/bookmark
14. **Donate** - Donation
15. **Schedule** - Scheduling
16. **SubmitApplication** - Job application submission
17. **FindLocation** - Find location

For JobTracker specifically, the relevant events would be:
1. **CompleteRegistration** - When user signs up (login page)
2. **InitiateCheckout** - When user goes to upgrade/pricing page
3. **Purchase** - When payment is completed (Midtrans webhook)
4. **Subscribe** - When subscription starts
5. **ViewContent** - Page views (landing page, pricing page)
6. **Lead** - Could map to sign up
7. **SubmitApplication** - Could map to job application submission
8. **StartTrial** - Could map to free plan start

The approach for Next.js App Router:

1. **Base Pixel Code**: Add the Meta Pixel base code in `layout.tsx` `<head>` section using a `<Script>` component or direct `<script>` tag.

2. **Event Tracking**: Create a utility file (`src/lib/meta-pixel/events.ts`) similar to PostHog events pattern.

3. **Map events to relevant actions**:
   - `CompleteRegistration` → Sign up / first login
   - `InitiateCheckout` → Upgrade/pricing page view or checkout start
   - `Purchase` → Payment success (client-side in payment page)
   - `Subscribe` → Subscription start
   - `ViewContent` → Landing page, pricing page view
   - `Lead` → Sign up
   - `StartTrial` → Free plan start

Let me think about the implementation:

**Step 1: Add Pixel ID env var**
Add `NEXT_PUBLIC_META_PIXEL_ID` to `.env.example`

**Step 2: Create Meta Pixel utility**
Create `src/lib/meta-pixel/client.ts` for initializing fbq
Create `src/lib/meta-pixel/events.ts` for event tracking functions

**Step 3: Add base pixel code to layout.tsx**
Add the `<Script>` or inline script in layout.tsx `<head>`

**Step 4: Update CSP in next.config.mjs**
Add `https://connect.facebook.net` to `script-src` and `https://www.facebook.com` etc.

**Step 5: Add event calls at relevant places**
- Login page: CompleteRegistration on sign up
- Upgrade page: ViewContent (pricing page), InitiateCheckout
- Payment success: Purchase
- Payment webhook: Purchase (server-side via Conversions API if needed)

For the relevant Meta events for this SaaS app:

1. **ViewContent** - Landing page (`/`), pricing page (`/upgrade`)
2. **CompleteRegistration** - When new user signs up (in login page)
3. **InitiateCheckout** - When user clicks "Pay Now" on upgrade page
4. **Purchase** - When payment succeeds (in payment page)
5. **Subscribe** - When subscription is confirmed (could be same as purchase)
6. **StartTrial** - When free plan starts (sign-up)
7. **Lead** - Sign up or important action
8. **AddToCart** - When user selects a plan on pricing page

Let me also check if there's a Meta Pixel ID already configured somewhere, and look at the CSP more carefully.

Actually, I need to look at what the user is asking. They've shown me the Meta Pixel setup page with all the event options. They want me to help them integrate Meta Pixel into their Next.js app.

Key decisions to make:
1. Which events are relevant for JobTracker?
2. Where to place the pixel base code?
3. How to handle CSP for Facebook scripts?
4. Whether to use server-side Conversions API or just client-side pixel?

Let me ask the user some clarifying questions before finalizing the plan.

Oke, gue udah analisa codebase lu. Berikut rencana integrasi Meta Pixel:

## Rencana Integrasi Meta Pixel untuk JobTracker

### Events yang Relevan (SaaS Subscription Model)

| Meta Event | Mapping di JobTracker | Lokasi Kode |
|---|---|---|
| **CompleteRegistration** | User baru sign up via Google | `src/app/login/page.tsx` |
| **ViewContent** | Landing page & pricing page | `src/app/page.tsx`, `src/app/upgrade/page.tsx` |
| **InitiateCheckout** | User klik "Pay Now" / mulai checkout | `src/app/upgrade/page.tsx` (saat handleSubscribe) |
| **AddPaymentInfo** | User buka halaman payment Midtrans | `src/app/payment/midtrans/page.tsx` |
| **Purchase** | Payment sukses | `src/app/payment/midtrans/page.tsx` (onSuccess callback) |
| **Subscribe** | Subscription confirmed (sama Purchase) | `src/app/payment/midtrans/page.tsx` |

Events lain kayak Search, Contact, Lead, dll — kurang relevan untuk model bisnis JobTracker (SaaS subscription), jadi gue skip.

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "Pertanyaan sebelum implementasi:",
      "header": "Meta Pixel Setup",
      "options": [
        {
          "label": "Tanya dulu",
          "description": "Jawab pertanyaan di bawah dulu sebelum gue mulai implement"
        },
        {
          "label": "Langsung implement",
          "description": "Pake default: pixel ID dari env var, semua events di atas, client-side only"
        }
      ],
      "multiple": false
    },
    {
      "question": "Sudah punya Meta Pixel ID?",
      "header": "Pixel ID",
      "options": [
        {
          "label": "Sudah punya",
          "description": "Gue akan simpan Pixel ID di NEXT_PUBLIC_META_PIXEL_ID env var"
        },
        {
          "label": "Belum / nanti setup",
          "description": "Gue buat code-nya dulu, Pixel ID-nya nanti diisi di .env"
        }
      ],
      "multiple": false
    },
    {
      "question": "Mau pakai Conversions API (server-side tracking) juga, atau client-side Pixel aja?",
      "header": "Tracking Mode",
      "options": [
        {
          "label": "Client-side only (Recommended)",
          "description": "Lebih simple, cukup Pixel script di browser. Cukup buat meta ads optimization."
        },
        {
          "label": "Client + Server-side",
          "description": "Double setup: Pixel + Conversions API via server route. Lebih akurat tapi lebih ribet."
        }
      ],
      "multiple": false
    },
    {
      "question": "Ada event lain yang mau di-track selain yang gue list di atas?",
      "header": "Extra Events",
      "options": [
        {
          "label": "Cukup yang di atas",
          "description": "CompleteRegistration, ViewContent, InitiateCheckout, AddPaymentInfo, Purchase, Subscribe"
        },
        {
          "label": "Tambah Lead event",
          "description": "Track Lead event saat user sign up (selain CompleteRegistration)"
        },
        {
          "label": "Tambah SubmitApplication",
          "description": "Track SubmitApplication saat user add new job application"
        },
        {
          "label": "Custom combo",
          "description": "Gue mau pilih kombinasi lain"
        }
      ],
      "multiple": false
    }
  ]
}
```

**Output:**
```
User has answered your questions: "Pertanyaan sebelum implementasi:"="Tanya dulu", "Sudah punya Meta Pixel ID?"="<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '973669348398388');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=973669348398388&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->", "Mau pakai Conversions API (server-side tracking) juga, atau client-side Pixel aja?"="enaknya gimana", "Ada event lain yang mau di-track selain yang gue list di atas?"="enaknyua gimana ya soalnya kan aku make posthog juga, pengennya yaa bisa duaduanya lah kombinasi seagala hal". You can now continue with the user's answers in mind.
```

---

## Assistant (Plan · GLM-5.1 · 16.6s)

_Thinking:_

The user:
1. Has a Pixel ID: `973669348398388`
2. Wants both client-side and server-side tracking (asked what's better, I should recommend)
3. Wants comprehensive tracking with both PostHog and Meta Pixel events

Let me give my recommendation:

For the tracking mode:
- Client-side is simpler and sufficient for most Meta ads optimization
- Conversions API adds reliability (ad blockers, iOS privacy changes) but is more complex
- Since he already has PostHog server-side tracking via the webhook routes, adding Conversions API would mean creating a new API route to send events to Meta server-side
- My recommendation: Start with **client-side only** — it's simpler, and it's enough for Meta ads optimization. If they need more accuracy later, they can add the Conversions API.

For extra events:
- He wants comprehensive tracking, so I should add all the relevant ones:
  - CompleteRegistration (sign up)
  - ViewContent (landing, pricing)
  - InitiateCheckout (checkout start)
  - AddPaymentInfo (payment page)
  - Purchase (payment success)
  - Subscribe (subscription confirmed)
  - Lead (sign up — in addition to CompleteRegistration, cover both bases)
  - SubmitApplication (when user adds a job — this is actually very relevant for a job tracker app!)

Now let me plan the implementation:

### Implementation Plan:

1. **Add env var** `NEXT_PUBLIC_META_PIXEL_ID=973669348398388` to `.env.example`
2. **Create `src/lib/meta-pixel/client.ts`** — initialize fbq and export helper functions
3. **Create `src/lib/meta-pixel/events.ts`** — event tracking functions (similar pattern to PostHog)
4. **Add base pixel code to `src/app/layout.tsx`** — in `<head>` section
5. **Update CSP in `next.config.mjs`** — add Facebook domains
6. **Add event calls** at relevant places:
   - `CompleteRegistration` + `Lead` → login page (on sign up / first login)
   - `ViewContent` → landing page, pricing/upgrade page
   - `InitiateCheckout` → upgrade page (when user clicks subscribe/pay)
   - `AddPaymentInfo` → payment/midtrans page
   - `Purchase` → payment success callback
   - `Subscribe` → payment success (with value/currency params)
   - `SubmitApplication` → when adding a job

Let me present this plan clearly.

Oke, gue rekomendasi: **Client-side Pixel aja dulu** — cukup buat Meta ads optimization. Conversions API bisa ditambah nanti kalau perlu. Double coverage (PostHog + Meta) udah bagus banget.

## Final Plan: Meta Pixel Integration

**Pixel ID:** `973669348398388`

### Yang akan gue implement:

1. **`NEXT_PUBLIC_META_PIXEL_ID`** ke `.env.example`
2. **`src/lib/meta-pixel/client.ts`** — init fbq, export helper (mirip pattern PostHog)
3. **`src/lib/meta-pixel/events.ts`** — semua event tracking functions
4. **Base pixel code** di `src/app/layout.tsx` `<head>`
5. **Update CSP** di `next.config.mjs` — tambah `connect.facebook.net`
6. **Event calls** di halaman-halaman terkait:

| Event | Kapan | File |
|---|---|---|
| `PageView` | Auto (base pixel) | layout.tsx |
| `CompleteRegistration` | User baru sign up | login/page.tsx |
| `Lead` | User login (repeat) | login/page.tsx |
| `ViewContent` | Landing + pricing page | page.tsx, upgrade/page.tsx |
| `InitiateCheckout` | Klik pay/subscribe | upgrade/page.tsx |
| `AddPaymentInfo` | Buka Midtrans payment | payment/midtrans/page.tsx |
| `Purchase` | Payment sukses | payment/midtrans/page.tsx |
| `Subscribe` | Payment sukses (monthly/lifetime) | payment/midtrans/page.tsx |
| `SubmitApplication` | User add new job | API route add job |

Mau gue mulai implement?

---

## User

gas implement, use context7. 

---

## Assistant (Build · GLM-5.1 · 15.7s)

_Thinking:_

Let me start implementing the Meta Pixel integration. I need to:

1. Create `src/lib/meta-pixel/client.ts` - init and base functions
2. Create `src/lib/meta-pixel/events.ts` - event tracking functions
3. Add `NEXT_PUBLIC_META_PIXEL_ID` to `.env.example`
4. Update `src/app/layout.tsx` to add base pixel code in `<head>`
5. Update CSP in `next.config.mjs`
6. Add event calls in relevant pages

Let me first check Context7 for Next.js best practices for adding third-party scripts.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Add base pixel script to src/app/layout.tsx <head>",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Update CSP in next.config.mjs for Meta domains",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Add CompleteRegistration + Lead events in login/page.tsx",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Add ViewContent events in landing & pricing pages",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Add InitiateCheckout event in upgrade/page.tsx",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Add SubmitApplication event in jobs/add API route",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Run typecheck to verify everything compiles",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add base pixel script to src/app/layout.tsx <head>",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Update CSP in next.config.mjs for Meta domains",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add CompleteRegistration + Lead events in login/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add ViewContent events in landing & pricing pages",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add InitiateCheckout event in upgrade/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add SubmitApplication event in jobs/add API route",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Run typecheck to verify everything compiles",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · GLM-5.1 · 7.8s)

**Tool: context7_resolve-library-id**

**Input:**
```json
{
  "libraryName": "Next.js",
  "query": "how to add meta pixel facebook pixel script to Next.js app router layout head"
}
```

**Output:**
```
Available Libraries:

- Title: Next.js
- Context7-compatible library ID: /vercel/next.js
- Description: Next.js enables you to create full-stack web applications by extending the latest React features and integrating powerful Rust-based JavaScript tooling for the fastest builds.
- Code Snippets: 2178
- Source Reputation: High
- Benchmark Score: 88.99
- Versions: v14.3.0-canary.87, v13.5.11, v15.1.8, v15.4.0-canary.82, v12.3.7, v11.1.3, v16.0.3, __branch__01-02-copy_58398, v16.1.0, v16.1.1, v15.1.11, v16.1.5, v16.1.6, v16.2.2, __branch__15-6-0-canary-57
----------
- Title: Next.js
- Context7-compatible library ID: /sleeptok3n/next.js
- Description: Next.js is the React Framework for production that enables developers to build full-stack web applications with server-side rendering, static generation, API routes, and advanced performance optimization features.
- Code Snippets: 7891
- Source Reputation: Medium
- Benchmark Score: 81.84
----------
- Title: Next.js
- Context7-compatible library ID: /llmstxt/nextjs_llms-full_txt
- Description: Next.js is a React framework for building full-stack web applications, featuring file-system routing, API routes, and optimized rendering with the App Router.
- Code Snippets: 40721
- Source Reputation: High
- Benchmark Score: 78.58
----------
- Title: Next.js
- Context7-compatible library ID: /llmstxt/nextjs_llms_txt
- Description: Next.js is a React framework for building full-stack web applications, offering features like server-side rendering, static site generation, and API routes.
- Code Snippets: 26035
- Source Reputation: High
- Benchmark Score: 84.25
----------
- Title: Next.js
- Context7-compatible library ID: /websites/nextjs
- Description: Next.js is a React framework for building full-stack web applications. It provides additional features and optimizations, automatically configuring lower-level tools to help developers focus on building products quickly.
- Code Snippets: 7602
- Source Reputation: High
- Benchmark Score: 41.43
```

**Tool: bash**

**Input:**
```json
{
  "command": "echo \"[graphify] Knowledge graph available. Read graphify-out/GRAPH_REPORT.md for god nodes and architecture context before searching files.\" && rtk ls /home/nafhan/Documents/job/JobTracker/src/lib/",
  "description": "List lib directory structure"
}
```

**Output:**
```
[graphify] Knowledge graph available. Read graphify-out/GRAPH_REPORT.md for god nodes and architecture context before searching files.
ai/
firebase/
language/
middleware/
migration/
onboarding/
posthog/
supabase/
theme/
tutorial/
utils/
geo-cache.ts  3.2K
google.ts  226B
midtrans-config.ts  623B
pricing-config.ts  1.3K
utils.ts  166B

```

---

## Assistant (Build · GLM-5.1 · 9.2s)

**Tool: context7_query-docs**

**Input:**
```json
{
  "libraryId": "/vercel/next.js",
  "query": "how to add third party script like meta pixel facebook pixel to Next.js app router layout head Script component"
}
```

**Output:**
```
### Load script in root layout for all routes - Next.js App Router

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

Import and use the next/script component in the root layout file to load a third-party script for all routes in the application. The script loads only once regardless of navigation between pages. Supports both TypeScript and JavaScript syntax.

```typescript
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script src="https://example.com/script.js" />
    </html>
  )
}
```

```javascript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script src="https://example.com/script.js" />
    </html>
  )
}
```

--------------------------------

### Load Critical Scripts Before Interaction in Next.js (beforeInteractive)

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/02-components/script.mdx

This snippet demonstrates how to use the `beforeInteractive` strategy for loading critical scripts in Next.js. Scripts loaded with this strategy are injected into the initial HTML, fetched before any Next.js modules, and execute early, but do not block page hydration. It's suitable for site-wide scripts like bot detectors or cookie consent managers, placed in `app/layout.tsx`, `app/layout.js` (App Router), or `pages/_document.js` (Pages Router).

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://example.com/script.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
```

```jsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://example.com/script.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
```

```jsx
import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          src="https://example.com/script.js"
          strategy="beforeInteractive"
        />
      </body>
    </Html>
  )
}
```

--------------------------------

### Integrate Third-party Scripts in App Router

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/content-security-policy.mdx

Demonstrates how to retrieve a nonce from headers and apply it to the GoogleTagManager component within the App Router's root layout.

```tsx
import { GoogleTagManager } from '@next/third-parties/google'
import { headers } from 'next/headers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTagManager gtmId="GTM-XYZ" nonce={nonce} />
      </body>
    </html>
  )
}
```

```jsx
import { GoogleTagManager } from '@next/third-parties/google'
import { headers } from 'next/headers'

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTagManager gtmId="GTM-XYZ" nonce={nonce} />
      </body>
    </html>
  )
}
```

### How to load and optimize scripts > Layout Scripts (App Router)

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

To load a third-party script for multiple routes in the App Router, import `next/script` and include the script directly in your layout component. The third-party script is fetched when the folder route (e.g. `dashboard/page.js`) or any nested route (e.g. `dashboard/settings/page.js`) is accessed by the user. Next.js will ensure the script will **only load once**, even if a user navigates between multiple routes in the same layout.

--------------------------------

### How to load and optimize scripts > Application Scripts (App Router)

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

To load a third-party script for all routes in the App Router, import `next/script` and include the script directly in your root layout. This script will load and execute when _any_ route in your application is accessed. Next.js will ensure the script will **only load once**, even if a user navigates between multiple pages. We recommend only including third-party scripts in specific pages or layouts in order to minimize any unnecessary impact to performance.
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/posthog/client.ts"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/lib/posthog/client.ts</path>
<type>file</type>
<content>
1: import posthog from "posthog-js";
2: 
3: export function initPostHog() {
4:   if (typeof window !== "undefined" && !posthog.__loaded) {
5:     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
6:       api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
7:       autocapture: true,
8:       capture_pageview: true,
9:       capture_pageleave: true,
10:       session_recording: {
11:         recordCrossOriginIframes: true,
12:       },
13:       respect_dnt: true,
14:       loaded: (ph) => {
15:         if (process.env.NODE_ENV === "development") ph.debug();
16:         (window as any).posthog = ph;
17:       },
18:     });
19:     (posthog as any).__loaded = true;
20:     (window as any).posthog = posthog;
21:   }
22:   return posthog;
23: }
24: 
25: export { posthog };

(End of file - total 25 lines)
</content>
```

---

## Assistant (Build · GLM-5.1 · 51.9s)

_Thinking:_

Now I have the context I need. Let me implement the Meta Pixel integration step by step.

The approach:
1. Create `src/lib/meta-pixel/client.ts` - similar pattern to PostHog client, but for Meta Pixel (fbq)
2. Create `src/lib/meta-pixel/events.ts` - event tracking functions
3. Update `.env.example` to add `NEXT_PUBLIC_META_PIXEL_ID`
4. Update `src/app/layout.tsx` to add Meta Pixel base script using `next/script`
5. Update CSP in `next.config.mjs` to allow Meta/Facebook domains
6. Add event calls in relevant files

For the base pixel script in layout.tsx, I'll use the Next.js `Script` component with `afterInteractive` strategy, following the same pattern they use for other scripts. The Meta Pixel needs to be loaded early but it's not critical enough for `beforeInteractive`.

Actually, looking at it more carefully, the Meta Pixel code is an inline script (not just a src reference). The `next/script` component can handle inline scripts too. But the Meta Pixel has two parts:
1. The init script (inline JS that defines fbq and loads the SDK)
2. The noscript img fallback

The best approach for Next.js App Router:
- Use a custom component `MetaPixel` that renders the init script using `next/script`
- The noscript fallback goes in the `<head>` or we can skip it for SPA (it's mainly for non-JS browsers)
- Event tracking uses the `fbq()` function which we wrap in our client module

Let me look at how the existing code handles the PostHog provider to understand the pattern better, and then implement Meta Pixel similarly.

Looking at the codebase:
- PostHog is initialized in `src/lib/posthog/client.ts` and wrapped in `PostHogProvider` in `PostHogProvider.tsx`
- Events are in `src/lib/posthog/events.ts`

For Meta Pixel, I'll follow a similar pattern but simpler since Meta Pixel doesn't need a React context/provider - just the init script and then fbq() calls.

Let me create the implementation:

1. `src/lib/meta-pixel/client.ts` - fbq type declaration, init function, and helpers
2. `src/lib/meta-pixel/events.ts` - event tracking functions
3. Update `.env.example` 
4. Update `layout.tsx` with the MetaPixelScript component
5. Update CSP
6. Add event calls

Let me look at the relevant pages more carefully for where to add events.

For `login/page.tsx`:
- `CompleteRegistration` when `isNewUser` is true (line 29, 103)
- `Lead` when not new user (login = lead for Meta)

For `upgrade/page.tsx`:
- `ViewContent` when page loads (pricing page viewed)
- `InitiateCheckout` when user clicks subscribe/pay button

For `payment/midtrans/page.tsx`:
- `AddPaymentInfo` when payment page loads
- `Purchase` + `Subscribe` on payment success (line 111)

For `src/app/api/jobs/add/route.ts`:
- `SubmitApplication` server-side might not work directly with fbq. I need to think about this... fbq is a client-side function. For server-side tracking, we'd need the Conversions API. Since the user chose client-side only, I should track SubmitApplication on the client side after the API call succeeds. But the add job is done via an API route... let me check if there's a client component that calls this API.

Let me check the dashboard page for how jobs are added.

Actually, I already have the PostHog events track, so I can see where job_added is tracked. Let me check that.

From the grep results, I saw:
- `src/app/api/jobs/add/route.ts` uses PostHog server-side tracking
- `trackJobAdded` is called from `src/lib/posthog/events.ts`

For Meta Pixel, since it's client-side only, I need to track the SubmitApplication event on the client side after the job is successfully added. Let me find where jobs are added from the client.

Let me search for where the add job API is called from the client.

Actually, instead of searching for every place, let me just focus on the key files and implement what I can. For SubmitApplication, I can add it to the client-side wherever trackJobAdded is called from PostHog. But I need to find those places first.

Let me think about what to implement now and what can be added later. The critical ones for Meta Ads are:
1. CompleteRegistration (sign up)
2. Lead (returning login)
3. ViewContent (pricing/landing page)
4. InitiateCheckout (start checkout)
5. AddPaymentInfo (payment page)
6. Purchase (payment success)
7. Subscribe (subscription confirmed)

These are the most important for Meta Ads optimization. SubmitApplication is nice-to-have.

Let me start implementing.

For the layout.tsx, I'll add a `MetaPixel` component that loads the fbq script. Since this is a Next.js App Router layout, I'll use `next/script` with an inline script.

Actually wait - looking at the Meta Pixel code more carefully:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '973669348398388');
fbq('track', 'PageView');
</script>
```

This is an inline script. In Next.js App Router, the best way to handle this is:
1. Use `next/script` with `dangerouslySetInnerHTML` for the inline script
2. Or create a component that uses `useEffect` to load the script

Since Meta Pixel needs to load early (before page interactions), I'll use the `Script` component approach with `afterInteractive` strategy.

Actually, the cleanest approach is to:
1. Create a client component `MetaPixelScript` that uses `next/script` to load `fbevents.js`
2. Also initialize `fbq` inline before the script loads (to queue events)
3. This way, any `fbq()` calls before the script loads will be queued

Let me create a proper implementation.

For the client.ts, I'll write TypeScript-safe fbq wrapper functions similar to how PostHog is done.

Let me implement this step by step now.

**Tool: context7_query-docs**

**Input:**
```json
{
  "libraryId": "/vercel/next.js",
  "query": "next/script inline script dangerouslySetInnerHTML App Router layout meta pixel third party tracking"
}
```

**Output:**
```
### Integrate Google Analytics 4 Globally in Next.js App Router

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/third-party-libraries.mdx

Demonstrates how to add the `GoogleAnalytics` component to the root layout (`app/layout.tsx` or `app/layout.js`) to enable Google Analytics 4 tracking across all routes in a Next.js App Router application. It requires a `gaId` for configuration.

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XYZ" />
    </html>
  )
}
```

```jsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XYZ" />
    </html>
  )
}
```

--------------------------------

### Load script in layout component - Next.js App Router

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

Import and use the next/script component in a layout file to load a third-party script for multiple routes. The script loads only once even when navigating between routes in the same layout. Supports both TypeScript and JavaScript syntax.

```typescript
import Script from 'next/script'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://example.com/script.js" />
    </>
  )
}
```

```javascript
import Script from 'next/script'

export default function DashboardLayout({ children }) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://example.com/script.js" />
    </>
  )
}
```

--------------------------------

### Embed inline script using Next.js Script component with dangerouslySetInnerHTML

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

This snippet demonstrates an alternative method for embedding inline JavaScript within the Next.js `Script` component using the `dangerouslySetInnerHTML` property. Similar to the curly brace method, an `id` property is mandatory for Next.js to track and optimize the inline script effectively.

```jsx
<Script
  id="show-banner"
  dangerouslySetInnerHTML={{
    __html: `document.getElementById('banner').classList.remove('hidden')`,
  }}
/>
```

--------------------------------

### Integrate Third-party Scripts in App Router

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/content-security-policy.mdx

Demonstrates how to retrieve a nonce from headers and apply it to the GoogleTagManager component within the App Router's root layout.

```tsx
import { GoogleTagManager } from '@next/third-parties/google'
import { headers } from 'next/headers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTagManager gtmId="GTM-XYZ" nonce={nonce} />
      </body>
    </html>
  )
}
```

```jsx
import { GoogleTagManager } from '@next/third-parties/google'
import { headers } from 'next/headers'

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTagManager gtmId="GTM-XYZ" nonce={nonce} />
      </body>
    </html>
  )
}
```

### Inline Scripts

Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/scripts.mdx

The `Script` component also supports inline scripts, which are JavaScript snippets not loaded from an external file. These can be included either by placing the JavaScript directly within curly braces or by using the `dangerouslySetInnerHTML` property. It is crucial to assign an `id` property to inline scripts. This `id` allows Next.js to effectively track and optimize the script, ensuring proper functionality and performance.
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/posthog/PostHogProvider.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/lib/posthog/PostHogProvider.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect } from "react";
4: import posthog from "posthog-js";
5: import { PostHogProvider as PHProvider } from "posthog-js/react";
6: import { useAuth } from "@/lib/firebase/auth-context";
7: import { initPostHog } from "./client";
8: 
9: export function PostHogProvider({ children }: { children: React.ReactNode }) {
10:   useEffect(() => {
11:     initPostHog();
12:   }, []);
13: 
14:   return <PHProvider client={posthog}>{children}</PHProvider>;
15: }
16: 
17: export function PostHogIdentify() {
18:   const { user, isPro, subscription } = useAuth();
19: 
20:   useEffect(() => {
21:     if (user) {
22:       posthog.identify(user.uid, {
23:         email: user.email,
24:         name: user.displayName,
25:         plan: subscription?.plan || "free",
26:         is_pro: isPro,
27:         sign_up_method: user.providerData[0]?.providerId || "unknown",
28:       });
29:       posthog.group("subscription", subscription?.plan || "free", {
30:         plan: subscription?.plan || "free",
31:         status: subscription?.status || "active",
32:       });
33:     } else {
34:       posthog.reset();
35:     }
36:   }, [user, isPro, subscription]);
37: 
38:   return null;
39: }

(End of file - total 39 lines)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "trackJobAdded|trackJobStatusChanged",
  "include": "*.{tsx,ts}",
  "path": "/home/nafhan/Documents/job/JobTracker/src"
}
```

**Output:**
```
Found 2 matches
/home/nafhan/Documents/job/JobTracker/src/lib/posthog/events.ts:
  Line 48: export const trackJobAdded = (source: string) =>

  Line 51: export const trackJobStatusChanged = (from: string, to: string) =>

```

---

## Assistant (Build · GLM-5.1 · 2.7s)

**Tool: grep**

**Input:**
```json
{
  "include": "*.{tsx,ts}",
  "pattern": "trackJobAdded"
}
```

**Output:**
```
Found 1 matches
/home/nafhan/Documents/job/JobTracker/src/lib/posthog/events.ts:
  Line 48: export const trackJobAdded = (source: string) =>

```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/components/**/AddJob*.tsx"
}
```

**Output:**
```
/home/nafhan/Documents/job/JobTracker/src/components/forms/AddJobModal.tsx
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "src/components/**/JobForm*.tsx"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · GLM-5.1 · 5.5s)

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
      "priority": "high",
      "status": "in_progress"
    },
    {
      "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Add base pixel script to src/app/layout.tsx <head>",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Update CSP in next.config.mjs for Meta domains",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Add CompleteRegistration + Lead events in login/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add ViewContent events in landing & pricing pages",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add InitiateCheckout event in upgrade/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add SubmitApplication event in AddJobModal.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Run typecheck to verify everything compiles",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add base pixel script to src/app/layout.tsx <head>",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Update CSP in next.config.mjs for Meta domains",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add CompleteRegistration + Lead events in login/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add ViewContent events in landing & pricing pages",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add InitiateCheckout event in upgrade/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add SubmitApplication event in AddJobModal.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Run typecheck to verify everything compiles",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · GLM-5.1 · 2.5s)

**Tool: bash**

**Input:**
```json
{
  "command": "mkdir -p /home/nafhan/Documents/job/JobTracker/src/lib/meta-pixel",
  "description": "Create meta-pixel directory"
}
```

**Output:**
```
(no output)
```

---

## Assistant (Build · GLM-5.1 · 34.6s)

**Tool: write**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/meta-pixel/client.ts",
  "content": "type FbqEvent =\n  | \"PageView\"\n  | \"ViewContent\"\n  | \"CompleteRegistration\"\n  | \"Lead\"\n  | \"InitiateCheckout\"\n  | \"AddPaymentInfo\"\n  | \"Purchase\"\n  | \"Subscribe\"\n  | \"SubmitApplication\"\n  | \"Search\"\n  | \"Contact\";\n\ntype FbqParams = Record<string, unknown>;\n\ndeclare global {\n  interface Window {\n    fbq: ((event: string, name: FbqEvent, params?: FbqParams) => void) & {\n      callMethod?: (...args: unknown[]) => void;\n      queue?: unknown[];\n      loaded?: boolean;\n      push: (args: unknown[]) => void;\n    };\n    _fbq: Window[\"fbq\"];\n  }\n}\n\nexport function initMetaPixel() {\n  if (typeof window === \"undefined\") return;\n\n  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;\n  if (!pixelId) return;\n\n  if ((window as any)._fbqInitialized) return;\n\n  window.fbq = function (event: string, name: FbqEvent, params?: FbqParams) {\n    if (window.fbq.callMethod) {\n      window.fbq.callMethod(event, name, params);\n    } else {\n      window.fbq.queue = window.fbq.queue || [];\n      window.fbq.queue.push([event, name, params]);\n    }\n  } as Window[\"fbq\"];\n\n  window.fbq.push = window.fbq.push || ((args: unknown[]) => {\n    if (window.fbq) window.fbq(args[0] as string, args[1] as FbqEvent, args[2] as FbqParams);\n  });\n\n  if (!window._fbq) {\n    window._fbq = window.fbq;\n  }\n\n  window.fbq(\"init\", \"PageView\" as any, { pixelId } as any);\n\n  (window as any)._fbqInitialized = true;\n}\n\nexport function fbqTrack(event: FbqEvent, params?: FbqParams) {\n  if (typeof window === \"undefined\") return;\n  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;\n\n  if (window.fbq) {\n    window.fbq(\"track\", event, params);\n  }\n}\n\nexport const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || \"\";"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · GLM-5.1 · 18.7s)

_Thinking:_

Wait, I need to rethink the client.ts. The Meta Pixel initialization is different from PostHog. The standard way Meta Pixel works:

1. A script snippet that defines `fbq` function and queues calls
2. Then loads `fbevents.js` from connect.facebook.net
3. Then calls `fbq('init', '<PIXEL_ID>')` and `fbq('track', 'PageView')`

Since we're using Next.js App Router, the proper way is:
- Use `next/script` in layout.tsx to load `fbevents.js`
- Use an inline script before that (or in `useEffect`) that initializes fbq and queues init + PageView

Actually, looking at how other Next.js apps integrate Meta Pixel, the cleanest approach is:

1. Create a `MetaPixel` component that uses `next/script` to load fbevents.js and init the pixel
2. The component should be a client component that:
   - First defines the fbq stub (so events are queued before SDK loads)
   - Then loads fbevents.js via Script component
   - Then fires `fbq('init', PIXEL_ID)` and `fbq('track', 'PageView')`

But actually, the simplest and most common approach is to use the inline script approach with `next/script` and `dangerouslySetInnerHTML`, similar to what Meta provides.

Let me revise the implementation to be cleaner and more aligned with standard Meta Pixel integration patterns.

For the client.ts, I should:
1. Just export helper functions that call `fbq('track', ...)` 
2. Not try to do the initialization there - that should be in the component that loads the pixel script

The Meta Pixel script handles the initialization itself. The standard approach:

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{pixel-id}');
  fbq('track', 'PageView');
</script>
```

So the approach should be:

1. In `layout.tsx`, add a `<Script>` component that loads the Meta Pixel base code (using `dangerouslySetInnerHTML`)
2. In `client.ts`, just export helper functions that call `window.fbq('track', eventName, params)` if available
3. In `events.ts`, create typed wrapper functions

Let me rewrite client.ts properly.

**Tool: write**

**Input:**
```json
{
  "content": "type FbqEvent =\n  | \"PageView\"\n  | \"ViewContent\"\n  | \"CompleteRegistration\"\n  | \"Lead\"\n  | \"InitiateCheckout\"\n  | \"AddPaymentInfo\"\n  | \"Purchase\"\n  | \"Subscribe\"\n  | \"SubmitApplication\"\n  | \"Search\"\n  | \"Contact\";\n\ntype FbqParams = Record<string, unknown>;\n\ndeclare global {\n  interface Window {\n    fbq: {\n      (action: string, event: FbqEvent, params?: FbqParams): void;\n      callMethod?: (...args: unknown[]) => void;\n      queue?: unknown[];\n      loaded?: boolean;\n      push: (args: unknown[]) => void;\n      version: string;\n    };\n    _fbq: Window[\"fbq\"];\n  }\n}\n\nexport function fbqTrack(event: FbqEvent, params?: FbqParams) {\n  if (typeof window === \"undefined\") return;\n  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;\n  if (!window.fbq) return;\n\n  window.fbq(\"track\", event, params);\n}\n\nexport const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || \"\";",
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/meta-pixel/client.ts"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · GLM-5.1 · 9.6s)

**Tool: write**

**Input:**
```json
{
  "content": "import { fbqTrack } from \"./client\";\n\nexport const metaPageView = () => fbqTrack(\"PageView\");\n\nexport const metaViewContent = (params?: { content_name?: string; content_category?: string; value?: number; currency?: string }) =>\n  fbqTrack(\"ViewContent\", params);\n\nexport const metaCompleteRegistration = (params?: { value?: number; currency?: string }) =>\n  fbqTrack(\"CompleteRegistration\", params);\n\nexport const metaLead = (params?: { value?: number; currency?: string; content_name?: string }) =>\n  fbqTrack(\"Lead\", params);\n\nexport const metaInitiateCheckout = (params?: { value?: number; currency?: string; content_name?: string; num_items?: number }) =>\n  fbqTrack(\"InitiateCheckout\", params);\n\nexport const metaAddPaymentInfo = (params?: { value?: number; currency?: string }) =>\n  fbqTrack(\"AddPaymentInfo\", params);\n\nexport const metaPurchase = (params: { value: number; currency: string }) =>\n  fbqTrack(\"Purchase\", params);\n\nexport const metaSubscribe = (params: { value: number; currency: string; subscription_id?: string }) =>\n  fbqTrack(\"Subscribe\", params);\n\nexport const metaSubmitApplication = (params?: { content_name?: string }) =>\n  fbqTrack(\"SubmitApplication\", params);",
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/meta-pixel/events.ts"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · GLM-5.1 · 6.4s)

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
      "priority": "high",
      "status": "in_progress"
    },
    {
      "content": "Add base pixel script to src/app/layout.tsx <head>",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Update CSP in next.config.mjs for Meta domains",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Add CompleteRegistration + Lead events in login/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add ViewContent events in landing & pricing pages",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add InitiateCheckout event in upgrade/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add SubmitApplication event in AddJobModal.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Run typecheck to verify everything compiles",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Add base pixel script to src/app/layout.tsx <head>",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Update CSP in next.config.mjs for Meta domains",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Add CompleteRegistration + Lead events in login/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add ViewContent events in landing & pricing pages",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add InitiateCheckout event in upgrade/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add SubmitApplication event in AddJobModal.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Run typecheck to verify everything compiles",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · GLM-5.1 · 2.4s)

Now let me add the env var and update the layout:

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/.env.example"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/.env.example</path>
<type>file</type>
<content>
1: # ===========================================
2: # FIREBASE CONFIGURATION
3: # ===========================================
4: NEXT_PUBLIC_FIREBASE_API_KEY=
5: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
6: NEXT_PUBLIC_FIREBASE_PROJECT_ID=
7: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
8: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
9: NEXT_PUBLIC_FIREBASE_APP_ID=
10: # Firebase Admin (Server-side only)
11: FIREBASE_CLIENT_EMAIL=
12: FIREBASE_PRIVATE_KEY=
13: # ===========================================
14: # SUPABASE CONFIGURATION
15: # ===========================================
16: NEXT_PUBLIC_SUPABASE_URL=
17: NEXT_PUBLIC_SUPABASE_ANON_KEY=
18: # Supabase Service Role (Server-side only)
19: SUPABASE_SERVICE_ROLE_KEY=
20: # ===========================================
21: # MIDTRANS PAYMENT
22: # ===========================================
23: MIDTRANS_SERVER_KEY=
24: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
25: MIDTRANS_IS_PRODUCTION=false
26: # ===========================================
27: # GOOGLE OAUTH (Gmail Integration)
28: # ===========================================
29: GOOGLE_CLIENT_ID=
30: GOOGLE_CLIENT_SECRET=
31: GOOGLE_REDIRECT_URI=
32: # ===========================================
33: # FASTSPRING (Legacy webhook)
34: # ===========================================
35: FASTSPRING_WEBHOOK_SECRET=
36: # ===========================================
37: # FEATURE FLAGS
38: # ===========================================
39: NEXT_PUBLIC_USE_SUPABASE_READ=false
40: NEXT_PUBLIC_USE_SUPABASE_WRITE=false
41: # ===========================================
42: # POSTHOG (Analytics & Session Replay)
43: # ===========================================
44: NEXT_PUBLIC_POSTHOG_KEY=
45: NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
46: POSTHOG_PERSONAL_API_KEY=
47: # ===========================================
48: # ANTHROPIC (AI Writer)
49: # ===========================================
50: ANTHROPIC_API_KEY=
51: # ===========================================
52: # JINA (Company website scraping - optional, higher rate limits)
53: # ===========================================
54: JINA_API_KEY=
55: # ===========================================
56: # EMAIL FINDER (Optional - for LinkedIn HR/Founder email finder)
57: # ===========================================
58: # Hunter.io - 25 free searches/month (https://hunter.io)
59: HUNTER_API_KEY=
60: # SerpAPI - 100 free searches/month (https://serpapi.com)
61: SERPAPI_API_KEY=

(End of file - total 61 lines)
</content>
```

---

## Assistant (Build · GLM-5.1 · 3.0s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/.env.example",
  "oldString": "# ===========================================\n# ANTHROPIC (AI Writer)\n# ===========================================\nANTHROPIC_API_KEY=",
  "newString": "# ===========================================\n# ANTHROPIC (AI Writer)\n# ===========================================\nANTHROPIC_API_KEY=\n# ===========================================\n# META PIXEL (Facebook Ads)\n# ===========================================\nNEXT_PUBLIC_META_PIXEL_ID="
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 4.9s)

Now create the MetaPixelScript component and update layout.tsx:

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport Script from \"next/script\";\nimport { META_PIXEL_ID } from \"./client\";\n\nexport function MetaPixel() {\n  if (!META_PIXEL_ID) return null;\n\n  return (\n    <>\n      <Script\n        id=\"meta-pixel\"\n        strategy=\"afterInteractive\"\n        dangerouslySetInnerHTML={{\n          __html: `\n            !function(f,b,e,v,n,t,s)\n            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n            n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n            n.queue=[];t=b.createElement(e);t.async=!0;\n            t.src=v;s=b.getElementsByTagName(e)[0];\n            s.parentNode.insertBefore(t,s)}(window, document,'script',\n            'https://connect.facebook.net/en_US/fbevents.js');\n            fbq('init', '${META_PIXEL_ID}');\n            fbq('track', 'PageView');\n          `,\n        }}\n      />\n      <noscript>\n        <img\n          height=\"1\"\n          width=\"1\"\n          style={{ display: \"none\" }}\n          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}\n          alt=\"\"\n        />\n      </noscript>\n    </>\n  );\n}",
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/lib/meta-pixel/MetaPixel.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · GLM-5.1 · 2.2s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx"
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx</path>
<type>file</type>
<content>
1: // src/app/layout.tsx
2: import "./globals.css";
3: import { AuthProvider } from "@/lib/firebase/auth-context";
4: import { LanguageProvider } from "@/lib/language/context";
5: import { ThemeProvider } from "@/lib/theme/context";
6: import { PostHogProvider, PostHogIdentify } from "@/lib/posthog/PostHogProvider";
7: import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
8: import { SplashScreen } from "@/components/SplashScreen";
9: import { ErrorBoundary } from "@/components/ErrorBoundary";
10: import { Toaster } from "@/components/ui/sonner";
11: import type { Viewport } from "next";
12: 
13: export const metadata = {
14:   manifest: "/manifest.json",
15: };
16: 
17: export const viewport: Viewport = {
18:   width: "device-width",
19:   initialScale: 1,
20:   maximumScale: 1,
21:   userScalable: false,
22: };
23: 
24: export default function RootLayout({
25:   children,
26: }: {
27:   children: React.ReactNode;
28: }) {
29:   return (
30:     <html lang="en">
31:       <head>
32:         <link rel="manifest" href="/manifest.json" />
33:       </head>
34:       <body>
35:         <ErrorBoundary>
36:           <ThemeProvider>
37:             <LanguageProvider>
38:               <PostHogProvider>
39:                 <AuthProvider>
40:                   <PostHogIdentify />
41:                   <SplashScreen />
42:                   {children}
43:                   <PWAInstallPrompt />
44:                   <Toaster />
45:                 </AuthProvider>
46:               </PostHogProvider>
47:             </LanguageProvider>
48:           </ThemeProvider>
49:         </ErrorBoundary>
50:       </body>
51:     </html>
52:   );
53: }

(End of file - total 53 lines)
</content>
```

---

## Assistant (Build · GLM-5.1 · 2.7s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx",
  "oldString": "import { Toaster } from \"@/components/ui/sonner\";\nimport type { Viewport } from \"next\";",
  "newString": "import { Toaster } from \"@/components/ui/sonner\";\nimport { MetaPixel } from \"@/lib/meta-pixel/MetaPixel\";\nimport type { Viewport } from \"next\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 10.3s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/layout.tsx",
  "oldString": "<body>\n        <ErrorBoundary>",
  "newString": "<body>\n        <MetaPixel />\n        <ErrorBoundary>"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 17.1s)

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add base pixel script to src/app/layout.tsx <head>",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Update CSP in next.config.mjs for Meta domains",
      "priority": "high",
      "status": "in_progress"
    },
    {
      "content": "Add CompleteRegistration + Lead events in login/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add ViewContent events in landing & pricing pages",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add InitiateCheckout event in upgrade/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add SubmitApplication event in AddJobModal.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Run typecheck to verify everything compiles",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add base pixel script to src/app/layout.tsx <head>",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Update CSP in next.config.mjs for Meta domains",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Add CompleteRegistration + Lead events in login/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add ViewContent events in landing & pricing pages",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add InitiateCheckout event in upgrade/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add SubmitApplication event in AddJobModal.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Run typecheck to verify everything compiles",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · GLM-5.1 · 7.2s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/next.config.mjs",
  "newString": "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://effectivelyassets.com https://vercel.live https://apis.google.com https://accounts.google.com https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js https://us.i.posthog.com https://us-assets.i.posthog.com https://connect.facebook.net;",
  "oldString": "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://effectivelyassets.com https://vercel.live https://apis.google.com https://accounts.google.com https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js https://us.i.posthog.com https://us-assets.i.posthog.com;"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 3.0s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/next.config.mjs",
  "newString": "img-src 'self' data: https://*.googleusercontent.com https://grainy-gradients.vercel.app https://vercel.live https://us.i.posthog.com https://www.facebook.com;",
  "oldString": "img-src 'self' data: https://*.googleusercontent.com https://grainy-gradients.vercel.app https://vercel.live https://us.i.posthog.com;"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 4.7s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/next.config.mjs",
  "newString": "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://vercel.live https://accounts.google.com https://www.googleapis.com https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://graph.facebook.com;",
  "oldString": "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://vercel.live https://accounts.google.com https://www.googleapis.com https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com;"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 6.2s)

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add base pixel script to src/app/layout.tsx <head>",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Update CSP in next.config.mjs for Meta domains",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Add CompleteRegistration + Lead events in login/page.tsx",
      "priority": "medium",
      "status": "in_progress"
    },
    {
      "content": "Add ViewContent events in landing & pricing pages",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add InitiateCheckout event in upgrade/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Add SubmitApplication event in AddJobModal.tsx",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Run typecheck to verify everything compiles",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create src/lib/meta-pixel/client.ts - fbq init & helpers",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create src/lib/meta-pixel/events.ts - all event tracking functions",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add NEXT_PUBLIC_META_PIXEL_ID to .env.example",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add base pixel script to src/app/layout.tsx <head>",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Update CSP in next.config.mjs for Meta domains",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add CompleteRegistration + Lead events in login/page.tsx",
    "status": "in_progress",
    "priority": "medium"
  },
  {
    "content": "Add ViewContent events in landing & pricing pages",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add InitiateCheckout event in upgrade/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add AddPaymentInfo + Purchase + Subscribe events in payment/midtrans/page.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Add SubmitApplication event in AddJobModal.tsx",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Run typecheck to verify everything compiles",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · GLM-5.1 · 3.1s)

Now let me add the event tracking calls to all the relevant pages. Let me read the files I need to modify:

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx",
  "newString": "import { trackLoginCompleted, trackSignUpCompleted } from \"@/lib/posthog/events\";\nimport { metaCompleteRegistration, metaLead } from \"@/lib/meta-pixel/events\";",
  "oldString": "import { trackLoginCompleted, trackSignUpCompleted } from \"@/lib/posthog/events\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 3.4s)

Now add the Meta events alongside the PostHog events in login/page.tsx. There are two places where sign up / login istracked:

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx",
  "newString": "if (isNewUser) {\n        trackSignUpCompleted(\"google\");\n        metaCompleteRegistration();\n      } else {\n        trackLoginCompleted(\"google\");\n        metaLead();\n      }",
  "oldString": "if (isNewUser) {\n        trackSignUpCompleted(\"google\");\n      } else {\n        trackLoginCompleted(\"google\");\n      }"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 2.5s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx",
  "offset": 95,
  "limit": 20
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx</path>
<type>file</type>
<content>
95:   const handleLogin = async () => {
96:     if (isLoading) return;
97:     setIsLoading(true);
98:     try {
99:       const sessionId = getOrCreateSessionId();
100:       const deviceInfo = getDeviceInfo();
101: 
102:       const user = await loginWithGoogle();
103:       if (user) {
104:         const isNewUser = (user.metadata as any).creationTime === (user.metadata as any).lastSignInTime;
105:         if (isNewUser) {
106:           trackSignUpCompleted("google");
107:         } else {
108:           trackLoginCompleted("google");
109:         }
110: 
111:         try {
112:           const onboardingRes = await fetch(`/api/onboarding?userId=${user.uid}`);
113:           const onboardingData = await onboardingRes.json();
114: 

(Showing lines 95-114 of 201. Use offset=115 to continue.)
</content>
```

---

## Assistant (Build · GLM-5.1 · 5.0s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/login/page.tsx",
  "newString": "if (isNewUser) {\n          trackSignUpCompleted(\"google\");\n          metaCompleteRegistration();\n        } else {\n          trackLoginCompleted(\"google\");\n          metaLead();\n        }",
  "oldString": "if (isNewUser) {\n          trackSignUpCompleted(\"google\");\n        } else {\n          trackLoginCompleted(\"google\");\n        }"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 4.4s)

Now add ViewContent to the landing and upgradepages:

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/page.tsx",
  "limit": 30
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect, useState, useRef, useCallback } from "react";
4: import { useRouter } from "next/navigation";
5: import Navbar from "@/components/Navbar";
6: import { ResetThemeToDefault } from "@/components/ResetThemeToDefault";
7: import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
8: import { useLanguage } from "@/lib/language/context";
9: import { useAuth } from "@/lib/firebase/auth-context";
10: import HeroSection from "@/components/landing/HeroSection";
11: import ShowcaseSection from "@/components/landing/ShowcaseSection";
12: import EarlyBirdSection from "@/components/landing/EarlyBirdSection";
13: import ComparisonSection from "@/components/landing/ComparisonSection";
14: import AIWriterLandingSection from "@/components/landing/AIWriterLandingSection";
15: import SocialProofSection from "@/components/landing/SocialProofSection";
16: import FAQSection from "@/components/landing/FAQSection";
17: import FooterSection from "@/components/landing/FooterSection";
18: import IOSInstallModal from "@/components/landing/IOSInstallModal";
19: 
20: export default function LandingPage() {
21:   const { t } = useLanguage();
22:   const router = useRouter();
23:   const { user, loading: authLoading } = useAuth();
24:   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
25:   const [isIOS, setIsIOS] = useState(false);
26:   const [showIOSInstructions, setShowIOSInstructions] = useState(false);
27:   const [isPWA, setIsPWA] = useState(false);
28:   const [startTime] = useState(() => Date.now());
29:   const scrollDepthRef = useRef<number>(0);
30:   const [pwaRedirecting, setPwaRedirecting] = useState(false);

(Showing lines 1-30 of 228. Use offset=31 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/pricing/page.tsx",
  "limit": 30
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/pricing/page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useRouter } from "next/navigation";
4: import { useAuth } from "@/lib/firebase/auth-context";
5: import { useLanguage } from "@/lib/language/context";
6: import { CheckCircle2, ArrowRight, ArrowLeft, Star, Tag, Gift, AlertTriangle, Clock, Loader2, RefreshCw } from "lucide-react";
7: import Navbar from "@/components/Navbar";
8: import { TwitterShareModal } from "@/components/TwitterShareModal";
9: import { ResetThemeToDefault } from "@/components/ResetThemeToDefault";
10: import { Button } from "@/components/ui/button";
11: import { useState, useEffect } from "react";
12: import { FREE_PLAN_JOB_LIMIT } from "@/types";
13: import { detectLocation } from "@/lib/utils/location";
14: import { PRICING_USD, PRICING_IDR, LIFETIME_ACCESS_LIMIT } from "@/lib/pricing-config";
15: import { MIDTRANS_PRICES } from "@/lib/midtrans-config";
16: 
17: interface LifetimeAvailability {
18:   totalPurchased: number;
19:   limit: number;
20:   remaining: number;
21:   isAvailable: boolean;
22: }
23: 
24: export default function PricingPage() {
25:   const { t } = useLanguage();
26:   const router = useRouter();
27:   const { user, subscription } = useAuth();
28:   
29:   const [isIndonesia, setIsIndonesia] = useState(true);
30:   const [loadingLocation, setLoadingLocation] = useState(true);

(Showing lines 1-30 of 588. Use offset=31 to continue.)
</content>
```

---

## Assistant (Build · GLM-5.1 · 3.4s)

**Tool: grep**

**Input:**
```json
{
  "include": "page.tsx",
  "pattern": "useEffect",
  "path": "/home/nafhan/Documents/job/JobTracker/src/app/page.tsx"
}
```

**Output:**
```
Found 7 matches
/home/nafhan/Documents/job/JobTracker/src/app/page.tsx:
  Line 3: import { useEffect, useState, useRef, useCallback } from "react";

  Line 33:   useEffect(() => {

  Line 56:   useEffect(() => {

  Line 82:   useEffect(() => {

  Line 92:   useEffect(() => {

  Line 148:   useEffect(() => {

  Line 168:   useEffect(() => {

```

---

## Assistant (Build · GLM-5.1 · 2.2s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/page.tsx",
  "offset": 30,
  "limit": 35
}
```

**Output:**
```
<path>/home/nafhan/Documents/job/JobTracker/src/app/page.tsx</path>
<type>file</type>
<content>
30:   const [pwaRedirecting, setPwaRedirecting] = useState(false);
31:   const showcaseRef = useRef<HTMLDivElement>(null);
32: 
33:   useEffect(() => {
34:     const trackVisit = async () => {
35:       try {
36:         const sessionId = getOrCreateSessionId();
37:         const deviceInfo = getDeviceInfo();
38: 
39:         await fetch("/api/analytics/track", {
40:           method: "POST",
41:           headers: { "Content-Type": "application/json" },
42:           body: JSON.stringify({
43:             type: "visit",
44:             page: "home",
45:             sessionId,
46:             deviceInfo,
47:           }),
48:         });
49:       } catch (error) {
50:         console.error("Failed to track visit:", error);
51:       }
52:     };
53:     trackVisit();
54:   }, []);
55: 
56:   useEffect(() => {
57:     const checkPWA = () => {
58:       const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
59:       const isIOSStandalone = (navigator as any).standalone === true;
60:       const detectedPWA = isStandalone || isIOSStandalone;
61: 
62:       setIsPWA(detectedPWA);
63: 
64:       return detectedPWA;

(Showing lines 30-64 of 228. Use offset=65 to continue.)
</content>
```

---

## Assistant (Build · GLM-5.1 · 3.3s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/page.tsx",
  "newString": "import { useAuth } from \"@/lib/firebase/auth-context\";\nimport { metaViewContent } from \"@/lib/meta-pixel/events\";",
  "oldString": "import { useAuth } from \"@/lib/firebase/auth-context\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 4.5s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/page.tsx",
  "newString": "trackVisit();\n    metaViewContent({ content_name: \"landing_page\", content_category: \"marketing\" });\n  }, []);",
  "oldString": "trackVisit();\n  }, []);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 2.6s)

Now add ViewContent to the upgrade/pricing page:

**Tool: edit**

**Input:**
```json
{
  "filePath": "/home/nafhan/Documents/job/JobTracker/src/app/upgrade/page.tsx",
  "newString": "import { trackPricingViewed } from \"@/lib/posthog/events\";\nimport { metaViewContent, metaInitiateCheckout } from \"@/lib/meta-pixel/events\";",
  "oldString": "import { trackPricingViewed } from \"@/lib/posthog/events\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · GLM-5.1 · 87.9s)

---

