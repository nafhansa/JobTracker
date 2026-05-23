import React, { useEffect, useState, useCallback } from "react";
import browser from "webextension-polyfill";
import type { AutofillData, UserProfile } from "@/lib/types";
import { profileToAutofill } from "@/lib/types";
import { getAuth, clearAll, getProfile, setProfile } from "@/lib/storage";
import { fetchProfile, readTokenFromAppTab, storeAuthFromToken, openAppTab } from "@/lib/api";

type AppState =
  | "loading"
  | "unauthenticated"
  | "authenticating"
  | "authenticated_no_profile"
  | "ready"
  | "filling"
  | "filled"
  | "session_expired";

const APP_URL = "https://jobtracker.id";

export default function App() {
  const [state, setState] = useState<AppState>("loading");
  const [email, setEmail] = useState<string>("");
  const [autofill, setAutofill] = useState<AutofillData | null>(null);
  const [fillResult, setFillResult] = useState<{
    filledCount: number;
    fields: string[];
  } | null>(null);
  const [formDetected, setFormDetected] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const loadProfile = useCallback(async () => {
    const auth = await getAuth();
    if (auth && Date.now() <= auth.expiresAt) {
      setEmail(auth.email || "");

      const cached = await getProfile();
      if (cached) {
        setAutofill(profileToAutofill(cached as unknown as UserProfile));
        setState("ready");
        return;
      }

      const profile = await fetchProfile();
      if (!profile) {
        setState("authenticated_no_profile");
        return;
      }
      await setProfile(profile);
      setAutofill(profileToAutofill(profile as unknown as UserProfile));
      setState("ready");
      return;
    }

    if (auth && Date.now() > auth.expiresAt) {
      setState("session_expired");
      setEmail(auth.email || "");
      return;
    }

    const tokenData = await readTokenFromAppTab();
    if (tokenData) {
      await storeAuthFromToken(tokenData);
      const cached = await getProfile();
      if (cached) {
        setEmail(tokenData.email);
        setAutofill(profileToAutofill(cached as unknown as UserProfile));
        setState("ready");
        return;
      }
      const profile = await fetchProfile();
      if (!profile) {
        setEmail(tokenData.email);
        setState("authenticated_no_profile");
        return;
      }
      await setProfile(profile);
      setEmail(tokenData.email);
      setAutofill(profileToAutofill(profile as unknown as UserProfile));
      setState("ready");
      return;
    }

    setState("unauthenticated");
  }, []);

  const checkForm = useCallback(async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;
      const response = await browser.tabs.sendMessage(tab.id, {
        type: "CHECK_FORM",
      });
      setFormDetected(
        (response as { detected: boolean }).detected
      );
    } catch {
      setFormDetected(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    checkForm();
  }, [loadProfile, checkForm]);

  const handleSignIn = async () => {
    await openAppTab();
    setState("authenticating");
  };

  const handleCheckAuth = async () => {
    setChecking(true);
    setAuthError(null);
    const tokenData = await readTokenFromAppTab();
    if (!tokenData) {
      setChecking(false);
      setAuthError("No signed-in tab found. Make sure you're signed in on JobTracker.");
      return;
    }
    await storeAuthFromToken(tokenData);
    await loadProfile();
    setChecking(false);
  };

  useEffect(() => {
    if (state !== "authenticating") return;

    const interval = setInterval(async () => {
      const tokenData = await readTokenFromAppTab();
      if (!tokenData) return;

      clearInterval(interval);
      await storeAuthFromToken(tokenData);
      await loadProfile();
    }, 2000);

    return () => clearInterval(interval);
  }, [state, loadProfile]);

  const handleSignOut = async () => {
    await clearAll();
    setAutofill(null);
    setFillResult(null);
    setState("unauthenticated");
  };

  const handleFill = async () => {
    if (!autofill) return;
    setState("filling");

    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        setState("ready");
        return;
      }
      const response = await browser.tabs.sendMessage(tab.id, {
        type: "FILL_FORM",
        data: autofill,
      });
      setFillResult(response as { filledCount: number; fields: string[] });
      setState("filled");
    } catch {
      setState("ready");
    }
  };

  const handleRefresh = async () => {
    setState("loading");
    await loadProfile();
  };

  if (state === "loading") {
    return (
      <div className="container">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (state === "unauthenticated" || state === "session_expired") {
    return (
      <div className="container">
        <Header />
        {state === "session_expired" && (
          <div className="notice">Session expired. Please sign in again.</div>
        )}
        <div className="signin-prompt">
          <p>Sign in to autofill job applications with your profile</p>
          <button className="btn btn-primary" onClick={handleSignIn}>
            Open JobTracker
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCheckAuth}
            disabled={checking}
          >
            {checking ? "Checking..." : "Already signed in? Check now"}
          </button>
          {authError && <div className="notice" style={{ marginTop: 8 }}>{authError}</div>}
        </div>
      </div>
    );
  }

  if (state === "authenticating") {
    return (
      <div className="container">
        <Header />
        <div className="signin-prompt">
          <p>Sign in with Google on the opened tab.</p>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
            This popup will auto-detect when you're signed in.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCheckAuth}
            disabled={checking}
          >
            {checking ? "Checking..." : "Check now"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setState("unauthenticated"); setAuthError(null); }}
          >
            Cancel
          </button>
          {authError && <div className="notice" style={{ marginTop: 8 }}>{authError}</div>}
        </div>
      </div>
    );
  }

  if (state === "authenticated_no_profile") {
    return (
      <div className="container">
        <Header />
        <div className="section">
          <div className="status-row">
            <span className="status-dot connected" />
            <span>Signed in as {email}</span>
          </div>
        </div>
        <div className="signin-prompt">
          <p>Complete your profile to start autofilling</p>
          <a
            className="link"
            href={`${APP_URL}`}
            target="_blank"
            rel="noreferrer"
          >
            Open JobTracker &rarr;
          </a>
        </div>
        <button className="btn btn-danger" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  const completeness = autofill
    ? [
        autofill.full_name,
        autofill.email,
        autofill.phone,
        autofill.linkedin_url,
        autofill.skills,
        autofill.summary,
      ].filter(Boolean).length / 6
    : 0;

  return (
    <div className="container">
      <Header />

      <div className="section">
        <div className="status-row">
          <span className="status-dot connected" />
          <span>{email}</span>
        </div>
      </div>

      {autofill && (
        <div className="section">
          <div className="section-title">Profile</div>
          <div className="profile-summary">
            {autofill.full_name && (
              <div className="profile-field">
                <span className="label">Name</span>
                <span className="value">{autofill.full_name}</span>
              </div>
            )}
            {autofill.email && (
              <div className="profile-field">
                <span className="label">Email</span>
                <span className="value">{autofill.email}</span>
              </div>
            )}
            {autofill.phone && (
              <div className="profile-field">
                <span className="label">Phone</span>
                <span className="value">{autofill.phone}</span>
              </div>
            )}
            {autofill.linkedin_url && (
              <div className="profile-field">
                <span className="label">LinkedIn</span>
                <span className="value">
                  {autofill.linkedin_url.replace("https://", "")}
                </span>
              </div>
            )}
            {autofill.skills && (
              <div className="profile-field">
                <span className="label">Skills</span>
                <span className="value">{autofill.skills}</span>
              </div>
            )}
            <div className="completeness-bar">
              <div
                className="completeness-fill"
                style={{ width: `${completeness * 100}%` }}
              />
            </div>
            <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
              {Math.round(completeness * 100)}% complete
            </div>
          </div>
        </div>
      )}

      {formDetected && state !== "filled" && (
        <div className="section">
          <button
            className="btn btn-primary"
            onClick={handleFill}
            disabled={state === "filling"}
          >
            {state === "filling" ? "Filling..." : "Fill this form"}
          </button>
        </div>
      )}

      {!formDetected && state === "ready" && (
          <div className="section text-muted">
          No job application form detected on this page
        </div>
      )}

      {state === "filled" && fillResult && (
        <div className="section">
          <div className="fill-result">
            <div className="count">{fillResult.filledCount}</div>
            <div>
              field{fillResult.filledCount !== 1 ? "s" : ""} filled
            </div>
            {fillResult.fields.length > 0 && (
              <div className="fields">
                {fillResult.fields.join(", ")}
              </div>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setState("ready");
              setFillResult(null);
            }}
            style={{ marginTop: 8 }}
          >
            Fill again
          </button>
        </div>
      )}

      <div className="section" style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          style={{ flex: 1 }}
        >
          Refresh
        </button>
        <button
          className="btn btn-danger"
          onClick={handleSignOut}
          style={{ flex: 1 }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <img className="logo-img" src="logo-32.png" alt="JT" />
      <div className="header-text">
        <h1>JobTracker</h1>
        <p>Autofill</p>
      </div>
    </div>
  );
}
