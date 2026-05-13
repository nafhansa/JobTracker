"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Search, Loader2, Copy, ExternalLink, CheckCircle2, AlertCircle, Building, Globe, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface EmailResult {
  name: string;
  email: string;
  role: string;
  linkedinUrl: string;
  confidence: number;
  source: string;
  verificationStatus?: string;
}

export default function ContactFinderSection() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [roleType, setRoleType] = useState<"hr" | "founder" | "both">("both");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [strategy, setStrategy] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!companyName.trim()) {
      toast.error("Company name required", { description: "Please enter a company name to search" });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const token = await user?.getIdToken();
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/ai/find-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyUrl: companyUrl.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          roleType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Search failed", { description: data.error || "Something went wrong" });
        return;
      }

      setResults(data.emails || []);
      setStrategy(data.strategy || "");

      if (data.emails?.length === 0) {
        toast.info("No emails found", { description: "Try a different company or role type" });
      } else {
        toast.success(`Found ${data.emails.length} emails`, { description: `Using ${data.strategy} strategy` });
      }
    } catch (err) {
      console.error("Email search failed:", err);
      toast.error("Search failed", { description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      toast.success("Copied!", { description: "Email copied to clipboard" });
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      toast.error("Copy failed", { description: "Could not copy to clipboard" });
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 70) return "High";
    if (confidence >= 40) return "Medium";
    return "Low";
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "hunter": return "Hunter.io";
      case "serpapi+claude": return "SerpAPI + AI";
      case "pattern_guessing": return "Pattern Guess";
      default: return source;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="text-center space-y-1 py-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Find HR & Founder Emails</h2>
        <p className="text-sm text-muted-foreground">Search for contact emails from any company using LinkedIn, Hunter.io, or pattern matching</p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Company Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Tokopedia, Google, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-background h-10 pl-10"
              disabled={loading}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
          </div>
        </div>

        {/* Company URL (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Company Website <span className="text-[10px]">(optional — improves accuracy)</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. tokopedia.com or https://tokopedia.com"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="bg-background h-10 pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* LinkedIn URL (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            LinkedIn Company URL <span className="text-[10px]">(optional)</span>
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. https://linkedin.com/company/tokopedia"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="bg-background h-10 pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* Role Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Who are you looking for?
          </label>
          <div className="flex gap-2">
            {[
              { value: "hr" as const, label: "HR / Recruiter" },
              { value: "founder" as const, label: "Founder / CEO" },
              { value: "both" as const, label: "Both" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRoleType(option.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  roleType === option.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={loading || !companyName.trim()}
          className="w-full gap-2 h-11"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Find Emails
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Found {results.length} email{results.length !== 1 ? "s" : ""}
            </h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {getSourceLabel(strategy)}
            </span>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {result.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        result.verificationStatus === "valid"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : result.verificationStatus === "accept_all"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : result.confidence >= 70
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : result.confidence >= 40
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}>
                        {result.verificationStatus
                          ? result.verificationStatus === "valid"
                            ? "Verified"
                            : result.verificationStatus === "accept_all"
                            ? "Accept All"
                            : result.verificationStatus.charAt(0).toUpperCase() + result.verificationStatus.slice(1)
                          : getConfidenceLabel(result.confidence)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {result.role}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-muted px-2.5 py-1.5 rounded font-mono">
                        {result.email}
                      </code>
                      <button
                        onClick={() => handleCopyEmail(result.email)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Copy email"
                      >
                        {copiedEmail === result.email ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {result.linkedinUrl && (
                      <a
                        href={result.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium">Email accuracy varies by strategy:</p>
              <ul className="mt-1 space-y-0.5">
                <li>• <strong>Hunter.io</strong>: High accuracy (verified emails)</li>
                <li>• <strong>SerpAPI + AI</strong>: Medium accuracy (AI-generated guesses)</li>
                <li>• <strong>Pattern Guess</strong>: Low accuracy (common patterns only)</li>
              </ul>
              <p className="mt-1">Add HUNTER_API_KEY or SERPAPI_API_KEY to .env for better results.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
