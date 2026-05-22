# JobTracker → Capacitor Android App Transformation Plan

## 📋 Overview

Transformasi JobTracker dari **PWA web app** menjadi **Capacitor-wrapped Android app** yang bisa di-deploy ke Google Play Store, dengan **Google Play Billing** untuk subscription dan **database sharing** (Supabase + Firebase) dengan web app.

**Project Location:** `/JobTracker/android/` (Capacitor project di dalam folder yang sama)

---

## 🏗️ Arsitektur

```
JobTracker/
├── src/                          ← Web app (Next.js, tetap sama)
├── public/                       ← Static assets
├── android/                      ← Capacitor Android project (NEW)
│   ├── app/
│   │   ├── src/main/java/        ← Native Android code
│   │   ├── src/main/res/         ← Resources (icons, splash, strings)
│   │   └── src/main/AndroidManifest.xml
│   ├── capacitor.config.json     ← Capacitor config
│   └── build.gradle              ← Android build config
├── capacitor.config.ts           ← Root Capacitor config
├── package.json                  ← Updated dengan Capacitor deps
└── CAPACITOR_PLAN.md             ← File ini
```

### Flow Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    JobTracker Android App                    │
├─────────────────────────────────────────────────────────────┤
│  WebView (Capacitor) → Next.js Web App (localhost/bundled)  │
├─────────────────────────────────────────────────────────────┤
│  Native Plugins:                                             │
│  ├── Google Play Billing (capacitor-community/billing)      │
│  ├── Push Notifications (@capacitor/push-notifications)     │
│  ├── App (@capacitor/app)                                   │
│  ├── Browser (@capacitor/browser) ← Payment redirect        │
│  └── Preferences (@capacitor/preferences)                   │
├─────────────────────────────────────────────────────────────┤
│  Shared Services:                                            │
│  ├── Firebase Auth (Google OAuth) → Same user ID            │
│  ├── Supabase Database → Same tables, real-time sync        │
│  └── Anthropic AI → Via API proxy                           │
├─────────────────────────────────────────────────────────────┤
│  Payment Flow:                                               │
│  1. User klik Subscribe → Buka Browser (Capacitor Browser)  │
│  2. Payment via Midtrans di browser                         │
│  3. Webhook → Update Supabase subscriptions table           │
│  4. App detect perubahan → Update UI                        │
│  ATAU                                                        │
│  1. User klik Subscribe → Google Play Billing (native)      │
│  2. Payment via Google Play                                 │
│  3. RevenueCat webhook → Update Supabase                    │
│  4. App detect perubahan → Update UI                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Goals

| # | Goal | Status |
|---|------|--------|
| 1 | Android app yang bisa di-deploy ke Google Play Store | ✅ Target |
| 2 | Database sharing 100% dengan web app (Supabase + Firebase) | ✅ Target |
| 3 | Firebase Auth (Google OAuth) berfungsi di Android | ✅ Target |
| 4 | Payment compliant dengan Google Play Policy | ✅ Target |
| 5 | Semua fitur web app tersedia di Android | ✅ Target |
| 6 | Push notification untuk deadline reminders | ✅ Target |
| 7 | Offline support untuk data yang sudah di-cache | ✅ Target |
| 8 | Install button di web → redirect ke Play Store | ✅ Target |

---

## 📅 Phases & Timeline

### Phase 1: Setup & Configuration (Hari 1-2)

#### 1.1 Install Capacitor Dependencies

```bash
cd /home/nafhan/Documents/job/JobTracker
npm install @capacitor/core @capacitor/cli
npx cap init JobTracker com.jobtracker.app --web-dir .next
npm install @capacitor/android
```

#### 1.2 Configure Capacitor

**File:** `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jobtracker.app',
  appName: 'JobTracker',
  webDir: '.next',
  server: {
    // Development: point to local Next.js dev server
    // Production: bundled or hosted URL
    url: process.env.CAPACITOR_DEV_SERVER || 'https://jobtracker.app',
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A66C2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0A66C2',
    },
  },
};

export default config;
```

#### 1.3 Add Android Platform

```bash
npx cap add android
```

#### 1.4 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "cap:sync": "npx cap sync",
    "cap:open": "npx cap open android",
    "cap:run": "npx cap run android",
    "cap:build": "npm run build && npx cap sync && npx cap build android"
  }
}
```

#### 1.5 Environment Variables untuk Mobile

**File:** `.env.local` (tambah)

```env
# Capacitor Config
CAPACITOR_DEV_SERVER=http://192.168.1.100:3000  # Local IP untuk testing
CAPACITOR_APP_ID=com.jobtracker.app
CAPACITOR_APP_NAME=JobTracker

# RevenueCat (untuk Google Play Billing)
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_key_here

# Google Play Billing Product IDs
PLAY_BILLING_MONTHLY_PRO=monthly_pro
PLAY_BILLING_LIFETIME_PRO=lifetime_pro
```

---

### Phase 2: Android Project Configuration (Hari 2-3)

#### 2.1 Android Manifest Configuration

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="com.android.vending.BILLING" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep link untuk OAuth & Payment callback -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.jobtracker.app" android:host="callback" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
```

#### 2.2 Build Gradle Configuration

**File:** `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        applicationId "com.jobtracker.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        
        // Google Play Billing
        buildFeatures {
            aidl true
        }
    }

    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}

dependencies {
    implementation 'com.android.billingclient:billing:6.0.1'
    implementation 'com.revenuecat.purchases:purchases:7.0.0'
}
```

#### 2.3 App Icons & Splash Screen

**Required Assets:**

| Asset | Sizes | Location |
|-------|-------|----------|
| App Icon | 192x192, 512x512 | `android/app/src/main/res/mipmap-*/` |
| Splash Screen | 1920x1920 | `android/app/src/main/res/drawable-*/` |
| Play Store Icon | 512x512 PNG | `android/app/src/main/play/listings/en-US/graphics/` |

**Generate icons dengan:**
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

---

### Phase 3: Firebase Auth Integration (Hari 3-4)

#### 3.1 Firebase Android App Registration

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Add Android app dengan package name: `com.jobtracker.app`
3. Download `google-services.json`
4. Simpan di: `android/app/google-services.json`

#### 3.2 Update Firebase Auth Flow

**File:** `src/lib/firebase/auth.ts` (update untuk Capacitor)

```typescript
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './config';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    // Di Capacitor, pakai deep link OAuth flow
    const redirectUrl = `${window.location.origin}/auth/callback`;
    Browser.open({
      url: `https://jobtracker.app/login?redirect=${encodeURIComponent(redirectUrl)}`,
      windowName: '_self',
    });
  } else {
    // Web: pakai popup
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }
};

export const logout = async () => {
  await signOut(auth);
};
```

#### 3.3 Auth Callback Handler

**File:** `src/app/auth/callback/page.tsx` (NEW)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sync user ke Supabase
        syncUserToSupabase(user);
        // Redirect ke dashboard
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <div>Logging in...</div>;
}
```

---

### Phase 4: Google Play Billing Integration (Hari 4-6)

#### 4.1 Payment Strategy Decision

**Pendekatan: Hybrid Payment**

| Scenario | Payment Method |
|----------|----------------|
| User di Android app | Google Play Billing (via RevenueCat) |
| User di web browser | Midtrans (tetap sama) |
| Install button di web | Redirect ke Play Store |

#### 4.2 RevenueCat Setup

**Install dependencies:**
```bash
npm install react-native-purchases  # Tidak, ini untuk React Native
# Untuk Capacitor, pakai:
npm install @capacitor-community/google-play-billing
```

**Alternatif: Pakai RevenueCat Web SDK + Capacitor plugin**

**File:** `src/lib/billing/revenuecat.ts` (NEW)

```typescript
import { Capacitor } from '@capacitor/core';
import { GooglePlayBilling } from '@capacitor-community/google-play-billing';

export class BillingService {
  private isConfigured = false;

  async configure(userId: string) {
    if (Capacitor.isNativePlatform() && !this.isConfigured) {
      await GooglePlayBilling.initialize({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_API_KEY!,
        appUserId: userId,
      });
      this.isConfigured = true;
    }
  }

  async getOfferings() {
    if (Capacitor.isNativePlatform()) {
      return await GooglePlayBilling.getOfferings();
    }
    return null; // Di web, pakai Midtrans
  }

  async purchaseSubscription(productId: string) {
    if (Capacitor.isNativePlatform()) {
      return await GooglePlayBilling.purchaseSubscription({
        productId,
      });
    }
    // Di web, redirect ke Midtrans
    window.open(`/pricing?payment=midtrans`, '_blank');
  }

  async checkSubscriptionStatus() {
    if (Capacitor.isNativePlatform()) {
      const customerInfo = await GooglePlayBilling.getCustomerInfo();
      return customerInfo.entitlements.active['pro'] !== undefined;
    }
    // Di web, cek dari Supabase
    return await checkSubscriptionFromSupabase();
  }
}
```

#### 4.3 Google Play Console Setup

**Produk yang perlu dibuat:**

| Product ID | Type | Price | Description |
|------------|------|-------|-------------|
| `monthly_pro` | Subscription | Rp 31,988/bulan | Monthly Pro Plan |
| `lifetime_pro` | One-time purchase | Rp 51,988 | Lifetime Pro Plan |

**Setup Steps:**
1. Buka [Google Play Console](https://play.google.com/console/)
2. Pilih app JobTracker
3. Menu: **Monetize** → **Products** → **Subscriptions**
4. Create subscription: `monthly_pro`
5. Menu: **Monetize** → **Products** → **In-app products**
6. Create product: `lifetime_pro`

#### 4.4 Webhook Sync ke Supabase

**File:** `src/app/api/billing/revenuecat-webhook/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Verify webhook signature
  const isValid = verifyRevenueCatWebhook(req);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { event, data } = body;
  const userId = data.app_user_id;
  const entitlement = data.entitlements?.pro;

  if (event === 'INITIAL_PURCHASE' || event === 'RENEWAL') {
    // Update subscription di Supabase
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: 'monthly',
        status: 'active',
        renews_at: new Date(entitlement.expires_date).toISOString(),
        midtrans_subscription_id: data.product_id,
      });
  }

  if (event === 'CANCELLATION' || event === 'EXPIRATION') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', ends_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  return NextResponse.json({ success: true });
}
```

---

### Phase 5: Push Notifications (Hari 6-7)

#### 5.1 Firebase Cloud Messaging Setup

**Install plugin:**
```bash
npm install @capacitor/push-notifications
```

#### 5.2 Push Notification Implementation

**File:** `src/lib/notifications/push.ts` (NEW)

```typescript
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase/client';

export class NotificationService {
  async register() {
    if (!Capacitor.isNativePlatform()) return;

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', async (token: Token) => {
      // Simpan FCM token ke Supabase
      await supabase
        .from('user_profiles')
        .update({ fcm_token: token.value })
        .eq('user_id', getCurrentUserId());
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
      // Handle navigation dari notification
      const data = notification.notification.data;
      if (data.type === 'deadline_reminder') {
        window.location.href = '/dashboard';
      }
    });
  }
}
```

#### 5.3 Backend: Kirim Push Notification

**File:** `src/app/api/notifications/send/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

initializeFirebaseAdmin();

export async function POST(req: NextRequest) {
  const { userId, title, body, data } = await req.json();

  // Ambil FCM token dari Supabase
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('fcm_token')
    .eq('user_id', userId)
    .single();

  if (!profile?.fcm_token) {
    return NextResponse.json({ error: 'No FCM token' }, { status: 404 });
  }

  // Kirim push notification
  await admin.messaging().send({
    token: profile.fcm_token,
    notification: { title, body },
    data,
  });

  return NextResponse.json({ success: true });
}
```

---

### Phase 6: UI Updates untuk Mobile (Hari 7-9)

#### 6.1 Detect Platform & Adjust UI

**File:** `src/components/PlatformDetector.tsx` (NEW)

```typescript
'use client';

import { Capacitor } from '@capacitor/core';
import { createContext, useContext, useEffect, useState } from 'react';

type Platform = 'web' | 'android' | 'ios';

interface PlatformContextType {
  platform: Platform;
  isNative: boolean;
  isAndroid: boolean;
  isWeb: boolean;
}

const PlatformContext = createContext<PlatformContextType>({
  platform: 'web',
  isNative: false,
  isAndroid: false,
  isWeb: true,
});

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platformName = Capacitor.getPlatform() as Platform;
      setPlatform(platformName);
    }
  }, []);

  return (
    <PlatformContext.Provider
      value={{
        platform,
        isNative: platform !== 'web',
        isAndroid: platform === 'android',
        isWeb: platform === 'web',
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export const usePlatform = () => useContext(PlatformContext);
```

#### 6.2 Update Install Button → Play Store Redirect

**File:** `src/components/InstallAppButton.tsx` (NEW)

```typescript
'use client';

import { usePlatform } from './PlatformDetector';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function InstallAppButton() {
  const { isWeb, isAndroid } = usePlatform();

  if (!isWeb) return null; // Hide di Android app

  const handleInstall = () => {
    if (isAndroid) {
      // Redirect ke Play Store
      window.open('https://play.google.com/store/apps/details?id=com.jobtracker.app', '_blank');
    } else {
      // iOS: show PWA install instructions
      showIOSInstallInstructions();
    }
  };

  return (
    <Button onClick={handleInstall}>
      <Download className="w-4 h-4 mr-2" />
      Install Android App
    </Button>
  );
}
```

#### 6.3 Update Payment Flow Detection

**File:** `src/components/payment/PaymentButton.tsx` (update)

```typescript
'use client';

import { usePlatform } from '@/components/PlatformDetector';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PaymentButtonProps {
  plan: 'monthly' | 'lifetime';
  amount: number;
}

export function PaymentButton({ plan, amount }: PaymentButtonProps) {
  const { isNative, isAndroid } = usePlatform();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    if (isNative && isAndroid) {
      // Google Play Billing
      try {
        const billingService = new BillingService();
        await billingService.configure(getCurrentUserId());
        
        const productId = plan === 'monthly' ? 'monthly_pro' : 'lifetime_pro';
        await billingService.purchaseSubscription(productId);
        
        // Success
        router.push('/payment/success');
      } catch (error) {
        console.error('Payment failed:', error);
        router.push('/payment/failed');
      }
    } else {
      // Web: Midtrans
      router.push(`/payment/midtrans?plan=${plan}&amount=${amount}`);
    }

    setLoading(false);
  };

  return (
    <Button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Subscribe - Rp ${amount.toLocaleString()}`}
    </Button>
  );
}
```

#### 6.4 Mobile-Optimized Navigation

**Update:** `src/components/MobileBottomNav.tsx`

Tambahkan Capacitor-specific behavior:
- Back button handling
- Status bar color sync
- Safe area insets

```typescript
import { StatusBar } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

// Handle back button
App.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    App.exitApp();
  }
});

// Set status bar color
StatusBar.setBackgroundColor({ color: '#0A66C2' });
StatusBar.setStyle({ style: 'light' });
```

---

### Phase 7: Offline Support & Caching (Hari 9-10)

#### 7.1 Service Worker untuk Capacitor

**File:** `public/sw.js` (update existing)

```javascript
const CACHE_NAME = 'jobtracker-v1';
const OFFLINE_URL = '/offline';

const CACHE_URLS = [
  '/',
  '/dashboard',
  '/offline',
  '/icon-android-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
```

#### 7.2 Local Data Sync

**File:** `src/lib/sync/localSync.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase/client';
import { Preferences } from '@capacitor/preferences';

export class LocalSyncService {
  private static instance: LocalSyncService;

  static getInstance() {
    if (!LocalSyncService.instance) {
      LocalSyncService.instance = new LocalSyncService();
    }
    return LocalSyncService.instance;
  }

  async cacheJobs(userId: string) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId);

    await Preferences.set({
      key: `cached_jobs_${userId}`,
      value: JSON.stringify(jobs),
    });
  }

  async getCachedJobs(userId: string) {
    const { value } = await Preferences.get({
      key: `cached_jobs_${userId}`,
    });
    return value ? JSON.parse(value) : [];
  }

  async syncPendingChanges() {
    // Sync offline changes saat back online
    const pending = await this.getPendingChanges();
    for (const change of pending) {
      await supabase.from(change.table).upsert(change.data);
    }
    await this.clearPendingChanges();
  }
}
```

---

### Phase 8: Testing & Debugging (Hari 10-12)

#### 8.1 Development Testing

**Run di Android Studio:**
```bash
npm run build
npx cap sync
npx cap open android
```

**Run di device/emulator:**
```bash
npx cap run android --live-reload
```

#### 8.2 Testing Checklist

| Test | Status |
|------|--------|
| Firebase Auth (Google OAuth) | ⬜ |
| Job Tracker CRUD | ⬜ |
| Client Tracker CRUD | ⬜ |
| Dashboard stats & charts | ⬜ |
| Google Play Billing purchase | ⬜ |
| Subscription status sync | ⬜ |
| Push notifications | ⬜ |
| Offline mode | ⬜ |
| Deep link callback | ⬜ |
| Back button handling | ⬜ |
| Status bar & safe area | ⬜ |
| Payment redirect (Midtrans) | ⬜ |
| AI Writer generation | ⬜ |
| i18n language toggle | ⬜ |
| Dark/Light mode | ⬜ |

#### 8.3 Debugging Tools

```bash
# Chrome DevTools untuk WebView
chrome://inspect

# Logcat untuk native logs
adb logcat | grep -i capacitor

# Capacitor doctor
npx cap doctor
```

---

### Phase 9: Build & Deploy (Hari 12-14)

#### 9.1 Signing Key Setup

**Generate keystore:**
```bash
keytool -genkey -v -keystore jobtracker-release.keystore -alias jobtracker -keyalg RSA -keysize 2048 -validity 10000
```

**Simpan di:** `android/app/jobtracker-release.keystore`

**Tambahkan ke `android/keystore.properties`:**
```properties
RELEASE_STORE_FILE=jobtracker-release.keystore
RELEASE_STORE_PASSWORD=your_password
RELEASE_KEY_ALIAS=jobtracker
RELEASE_KEY_PASSWORD=your_password
```

#### 9.2 Build AAB (Android App Bundle)

```bash
npm run build
npx cap sync
cd android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

#### 9.3 Google Play Console Upload

1. Buka [Google Play Console](https://play.google.com/console/)
2. Pilih app JobTracker
3. Menu: **Release** → **Production**
4. Upload `app-release.aab`
5. Isi release notes
6. Submit untuk review

#### 9.4 Play Store Listing

**Required Assets:**
- App icon (512x512 PNG)
- Screenshots (min 2, max 8)
- Feature graphic (1024x500)
- Short description (80 chars)
- Full description (4000 chars)

**Short Description Example:**
```
Track job applications & freelance clients in one place. Stay organized!
```

**Full Description Example:**
```
JobTracker helps you manage your job search and freelance projects effortlessly.

✨ KEY FEATURES:
• Track job applications with status updates
• Manage freelance clients & projects
• Dashboard with analytics & insights
• AI-powered cover letter generation
• Daily streaks & gamification
• Dark mode & customizable themes

🔒 YOUR DATA, SYNCED EVERYWHERE:
• Cloud-synced across all devices
• Secure Firebase authentication
• Real-time updates with Supabase

💼 PERFECT FOR:
• Job seekers tracking applications
• Freelancers managing clients
• Anyone who wants to stay organized

Download now and take control of your career!
```

---

## ⚠️ Important Considerations

### 1. Google Play Policy Compliance

| Policy | Status |
|--------|--------|
| Digital goods MUST use Google Play Billing | ✅ Implemented via RevenueCat |
| No external payment links in app | ✅ Midtrans only via web |
| Subscription management in app | ✅ Via Google Play subscriptions |
| Privacy policy required | ✅ Update `src/app/terms-policy/page.tsx` |

### 2. Commission Comparison

| Platform | Commission | Notes |
|----------|------------|-------|
| Midtrans (Web) | ~2-3% | Direct to bank account |
| Google Play Billing | 15% (year 1), 30% (year 2+) | Google takes cut |

**Recommendation:** Consider price adjustment untuk mobile app untuk cover commission.

### 3. Database Sync Strategy

| Data | Sync Method |
|------|-------------|
| Jobs | Supabase real-time subscription |
| Freelance Jobs | Supabase real-time subscription |
| User Profile | Supabase query on load |
| Subscription Status | RevenueCat webhook → Supabase |
| AI Coins | Supabase query + local cache |
| Streaks | Supabase query + local cache |

### 4. Environment Variables Summary

| Variable | Usage | Platform |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database | Web + Mobile |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database | Web + Mobile |
| `NEXT_PUBLIC_FIREBASE_*` | Auth | Web + Mobile |
| `NEXT_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Billing | Mobile only |
| `MIDTRANS_SERVER_KEY` | Payment webhook | Web only |
| `ANTHROPIC_API_KEY` | AI Writer | Server only |

---

## 📝 Checklist To-Do List

### Phase 1: Setup
- [ ] Install Capacitor dependencies
- [ ] Initialize Capacitor config
- [ ] Add Android platform
- [ ] Update package.json scripts
- [ ] Setup environment variables

### Phase 2: Android Config
- [ ] Configure AndroidManifest.xml
- [ ] Update build.gradle
- [ ] Generate app icons & splash screen
- [ ] Setup signing keystore
- [ ] Configure proguard rules

### Phase 3: Firebase Auth
- [ ] Register Android app di Firebase Console
- [ ] Download & add google-services.json
- [ ] Update auth flow untuk Capacitor
- [ ] Create auth callback page
- [ ] Test Google OAuth di Android

### Phase 4: Google Play Billing
- [ ] Setup RevenueCat account
- [ ] Create products di Google Play Console
- [ ] Install billing plugin
- [ ] Implement billing service
- [ ] Create webhook handler
- [ ] Test purchase flow
- [ ] Test subscription sync

### Phase 5: Push Notifications
- [ ] Setup FCM di Firebase Console
- [ ] Install push notification plugin
- [ ] Implement notification service
- [ ] Create backend notification API
- [ ] Test push notifications
- [ ] Setup notification deep link

### Phase 6: UI Updates
- [ ] Create platform detector
- [ ] Update install button → Play Store redirect
- [ ] Update payment flow detection
- [ ] Optimize mobile navigation
- [ ] Handle back button
- [ ] Adjust status bar & safe area
- [ ] Test responsive layout

### Phase 7: Offline Support
- [ ] Update service worker
- [ ] Implement local sync service
- [ ] Cache jobs & freelance data
- [ ] Handle offline changes
- [ ] Test offline mode

### Phase 8: Testing
- [ ] Test di Android Studio emulator
- [ ] Test di physical device
- [ ] Test semua fitur utama
- [ ] Performance testing
- [ ] Memory leak testing
- [ ] Network condition testing

### Phase 9: Deploy
- [ ] Generate signing key
- [ ] Build AAB release
- [ ] Create Play Store listing
- [ ] Upload screenshots & assets
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Handle review feedback

---

## 🚀 Post-Launch

### Monitoring
- [ ] Setup Crashlytics untuk crash reporting
- [ ] Monitor Play Console ANRs & crashes
- [ ] Track subscription conversion rate
- [ ] Monitor RevenueCat metrics

### Updates
- [ ] Setup CI/CD untuk auto-build
- [ ] Create update checklist
- [ ] Plan feature parity dengan web app
- [ ] Collect user feedback

---

## 📚 Resources

| Resource | URL |
|----------|-----|
| Capacitor Docs | https://capacitorjs.com/docs |
| Google Play Billing | https://developer.android.com/google/play/billing |
| RevenueCat Docs | https://www.revenuecat.com/docs |
| Firebase Android | https://firebase.google.com/docs/android/setup |
| Supabase JS Client | https://supabase.com/docs/reference/javascript/introduction |
| Play Console Help | https://support.google.com/googleplay/android-developer |

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| App rating di Play Store | ≥ 4.5 stars |
| Crash-free users | ≥ 99.5% |
| Subscription conversion | ≥ 5% |
| DAU/MAU ratio | ≥ 30% |
| App size | < 50 MB |
| Load time | < 3 seconds |

---

**Last Updated:** May 19, 2026
**Status:** Planning Phase
**Next Action:** Start Phase 1 - Setup & Configuration
