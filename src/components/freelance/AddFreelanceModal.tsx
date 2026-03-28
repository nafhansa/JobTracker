"use client";

import { useState, useRef, useEffect } from "react";
import { FreelanceJob, FreelanceJobStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Building,
  Mail,
  Briefcase,
  Package,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
  X,
} from "lucide-react";

interface AddFreelanceModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobToEdit?: FreelanceJob | null;
}

const SERVICE_TYPES = [
  "Web Development", "Mobile App Development", "Frontend Development",
  "Backend Development", "Full-Stack Development", "iOS Development",
  "Android Development", "WordPress Development", "Shopify Development",
  "API Development & Integration", "Chrome Extension Development",
  "Game Development", "Software Development", "DevOps & Cloud", "QA & Testing",
  "UI/UX Design", "Graphic Design", "Logo & Brand Identity", "Web Design",
  "Mobile App Design", "Motion Graphics", "Illustration", "3D Modeling & Animation",
  "Print Design", "Packaging Design", "Presentation Design", "Infographic Design",
  "NFT & Digital Art", "Content Writing", "Copywriting", "SEO Writing",
  "Technical Writing", "Ghostwriting", "Blog Writing", "Social Media Content",
  "Email Marketing", "Press Release Writing", "Resume & LinkedIn Writing",
  "Script Writing", "Proofreading & Editing", "Translation", "Digital Marketing",
  "SEO Optimization", "Social Media Marketing", "Google Ads / PPC",
  "Facebook & Instagram Ads", "Influencer Marketing", "Brand Strategy",
  "Market Research", "Business Consulting", "Product Management",
  "CRM & Sales Automation", "Video Editing", "Video Production", "Photography",
  "Podcast Production", "Voiceover", "Animation", "2D Animation", "3D Animation",
  "Music Production", "Sound Design", "Data Analysis", "Data Visualization",
  "Machine Learning / AI", "Prompt Engineering", "Chatbot Development",
  "Data Entry", "Web Scraping", "Business Intelligence", "Virtual Assistant",
  "Customer Support", "Project Management", "Accounting & Bookkeeping",
  "HR & Recruitment", "Legal Services", "Research", "Online Tutoring",
  "Course Creation", "Training & Workshop", "Other",
];

const PRODUCTS = [
  "Landing Page", "Company Profile Website", "E-commerce Website",
  "Portfolio Website", "Blog / News Website", "Web App / Dashboard",
  "Admin Panel", "SaaS Product", "Booking / Reservation System",
  "Membership Portal", "iOS App", "Android App", "Cross-Platform App",
  "Logo Design", "Brand Identity Package", "UI/UX Prototype",
  "Figma / Adobe XD File", "Social Media Kit", "Pitch Deck / Presentation",
  "Poster / Banner", "Infographic", "Business Card", "Merchandise Design",
  "Packaging Design", "T-Shirt / Apparel Design", "Promotional Video",
  "Explainer Video", "YouTube Video", "Reels / TikTok Content",
  "Motion Graphics Video", "Product Photography", "Event Photography",
  "Podcast Episode", "Blog Post / Article", "Website Copy", "Ad Copy",
  "Email Newsletter", "Social Media Caption", "Press Release", "Case Study",
  "Whitepaper / eBook", "Product Description", "Google Ads Campaign",
  "Meta Ads Campaign", "SEO Audit & Strategy", "Content Marketing Plan",
  "Social Media Strategy", "Data Analysis Report", "Market Research Report",
  "Business Plan", "Financial Model", "Chatbot", "AI Workflow Automation",
  "Custom GPT / AI Tool", "Consultation Session", "Training / Workshop",
  "Maintenance & Support", "Other",
];

// ─── Searchable Combobox ──────────────────────────────────────────────────────
interface SearchableSelectProps {
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}

function SearchableSelect({ id, options, value, onChange, placeholder, icon }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dedupedOptions = Array.from(new Set(options));
  // A value is "custom" only if it's not empty AND not in the preset list
  const isCustom = value !== "" && value !== "Other" && !dedupedOptions.includes(value);

  const filtered = query.trim()
    ? dedupedOptions.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : dedupedOptions;

  const exactMatch = dedupedOptions.some(
    (o) => o.toLowerCase() === query.trim().toLowerCase()
  );
  const showUseCustom = query.trim().length > 0 && !exactMatch;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  };

  const handleUseCustom = () => {
    if (query.trim()) {
      onChange(query.trim());
      setOpen(false);
      setQuery("");
    }
  };

  // Display label in the trigger
  const triggerLabel = isCustom
    ? `✏️ ${value}`
    : value || placeholder;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        className={`flex items-center h-10 rounded-md border bg-background text-foreground text-sm cursor-pointer transition-colors
          ${open ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/50"}`}
        onClick={() => {
          setOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <span className="pl-3 pr-2 text-primary/50 shrink-0">{icon}</span>
        {open ? (
          <input
            ref={inputRef}
            id={id}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
            placeholder="Search or type custom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
            {triggerLabel}
          </span>
        )}
        <span className="pr-2 flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-52 overflow-y-auto">
          {showUseCustom && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 border-b border-border flex items-center gap-2 font-medium sticky top-0 bg-card z-10"
              onMouseDown={(e) => { e.preventDefault(); handleUseCustom(); }}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Use &quot;{query}&quot; as custom
            </button>
          )}
          {filtered.length === 0 && !showUseCustom && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No results. Type to add custom.
            </div>
          )}
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                ${value === option ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
            >
              {option}
              {value === option && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AddFreelanceModal({ userId, isOpen, onOpenChange, jobToEdit }: AddFreelanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // ↓ Separate state for "Other" custom text — does NOT touch formData directly
  const [customServiceType, setCustomServiceType] = useState("");
  const [customProduct, setCustomProduct] = useState("");

  const isEditMode = !!jobToEdit;

  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    serviceType: "",
    product: "",
    potentialPrice: "",
    actualPrice: "",
    status: "ongoing" as FreelanceJobStatus,
    startDate: "",
    endDate: "",
  });

  useState(() => {
    if (jobToEdit) {
      setFormData({
        clientName: jobToEdit.clientName,
        clientContact: jobToEdit.clientContact,
        serviceType: jobToEdit.serviceType,
        product: jobToEdit.product,
        potentialPrice: jobToEdit.potentialPrice?.toString() || "",
        actualPrice: jobToEdit.actualPrice?.toString() || "",
        status: jobToEdit.status,
        startDate: jobToEdit.startDate || "",
        endDate: jobToEdit.endDate || "",
      });
    }
  });

  const sanitizeNumber = (value: string) => value.replace(/[^0-9]/g, "");

  // Resolve the actual values (swap "Other" with the custom text if filled)
  const resolvedServiceType =
    formData.serviceType === "Other" && customServiceType.trim()
      ? customServiceType.trim()
      : formData.serviceType;

  const resolvedProduct =
    formData.product === "Other" && customProduct.trim()
      ? customProduct.trim()
      : formData.product;

  // Step 1 can proceed only if both resolved values are non-empty
  // (if "Other" is selected but custom box is empty → block)
  const canProceedStep1 =
    formData.clientName.trim() !== "" &&
    resolvedServiceType !== "" &&
    resolvedServiceType !== "Other" &&
    resolvedProduct !== "" &&
    resolvedProduct !== "Other";

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Submit:", {
      ...formData,
      serviceType: resolvedServiceType,
      product: resolvedProduct,
      userId,
      potentialPrice: Number(formData.potentialPrice),
      actualPrice: Number(formData.actualPrice) || undefined,
      durationDays:
        formData.startDate && formData.endDate
          ? Math.ceil(
              (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : undefined,
    });
    setLoading(false);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientContact: "",
      serviceType: "",
      product: "",
      potentialPrice: "",
      actualPrice: "",
      status: "ongoing",
      startDate: "",
      endDate: "",
    });
    setCustomServiceType("");
    setCustomProduct("");
    setStep(1);
  };

  const renderStep1 = () => (
    <>
      <div className="grid gap-4 py-2">
        {/* Client Name */}
        <div className="grid gap-1.5">
          <Label htmlFor="clientName" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Client Name *
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
            <Input
              id="clientName"
              required
              placeholder="e.g., Tokopedia, Gojek"
              className="pl-10 h-10 text-sm bg-background border-border text-foreground"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>
        </div>

        {/* Client Contact */}
        <div className="grid gap-1.5">
          <Label htmlFor="clientContact" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Client Contact
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
            <Input
              id="clientContact"
              placeholder="Email or phone number"
              className="pl-10 h-10 text-sm bg-background border-border text-foreground"
              value={formData.clientContact}
              onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
            />
          </div>
        </div>

        {/* Service Type */}
        <div className="grid gap-1.5">
          <Label htmlFor="serviceType" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Service Type *
          </Label>
          <SearchableSelect
            id="serviceType"
            options={SERVICE_TYPES}
            value={formData.serviceType}
            onChange={(val) => {
              setFormData({ ...formData, serviceType: val });
              // Reset custom text when switching away from Other
              if (val !== "Other") setCustomServiceType("");
            }}
            placeholder="Search or select service type"
            icon={<Briefcase className="w-4 h-4" />}
          />
          {formData.serviceType === "Other" && (
            <Input
              placeholder="e.g., Interior Design, AR/VR Development..."
              className="h-10 text-sm bg-background border-border text-foreground"
              autoFocus
              value={customServiceType}
              onChange={(e) => setCustomServiceType(e.target.value)}
            />
          )}
        </div>

        {/* Product */}
        <div className="grid gap-1.5">
          <Label htmlFor="product" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Product / Deliverable *
          </Label>
          <SearchableSelect
            id="product"
            options={PRODUCTS}
            value={formData.product}
            onChange={(val) => {
              setFormData({ ...formData, product: val });
              if (val !== "Other") setCustomProduct("");
            }}
            placeholder="Search or select deliverable"
            icon={<Package className="w-4 h-4" />}
          />
          {formData.product === "Other" && (
            <Input
              placeholder="e.g., AR Filter, Physical Prototype..."
              className="h-10 text-sm bg-background border-border text-foreground"
              autoFocus
              value={customProduct}
              onChange={(e) => setCustomProduct(e.target.value)}
            />
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setStep(2)}
        disabled={!canProceedStep1}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 mt-2 shadow-md transition-all text-sm flex items-center justify-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="grid gap-4 py-2">
        {/* Potential Price */}
        <div className="grid gap-1.5">
          <Label htmlFor="potentialPrice" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Potential Price (IDR)
          </Label>
          <div className="relative">
            <Wallet className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
            <Input
              id="potentialPrice"
              type="text"
              inputMode="numeric"
              placeholder="e.g., 25000000"
              className="pl-10 h-10 text-sm bg-background border-border text-foreground"
              value={formData.potentialPrice}
              onChange={(e) => setFormData({ ...formData, potentialPrice: sanitizeNumber(e.target.value) })}
            />
          </div>
        </div>

        {/* Actual Price */}
        <div className="grid gap-1.5">
          <Label htmlFor="actualPrice" className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Actual Price (IDR)
          </Label>
          <div className="relative">
            <Wallet className="absolute left-3 top-3 h-4 w-4 text-green-500/50" />
            <Input
              id="actualPrice"
              type="text"
              inputMode="numeric"
              placeholder="Final deal price (optional)"
              className="pl-10 h-10 text-sm bg-background border-border text-foreground"
              value={formData.actualPrice}
              onChange={(e) => setFormData({ ...formData, actualPrice: sanitizeNumber(e.target.value) })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Fill when deal is closed</p>
        </div>

        {/* Status */}
        <div className="grid gap-1.5">
          <Label className="text-foreground font-semibold tracking-wide text-xs uppercase">
            Status
          </Label>
          <div className="flex gap-2">
            {(["ongoing", "completed", "cancelled"] as FreelanceJobStatus[]).map((status) => (
              <label
                key={status}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all border
                  ${formData.status === status
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FreelanceJobStatus })}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${
                  status === "ongoing" ? "bg-yellow-500" :
                  status === "completed" ? "bg-green-500" : "bg-red-500"
                }`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="startDate" className="text-foreground font-semibold tracking-wide text-xs uppercase">
              Start Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary/50 pointer-events-none" />
              <Input
                id="startDate"
                type="date"
                className="pl-10 h-10 text-sm bg-background border-border text-foreground"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="endDate" className="text-foreground font-semibold tracking-wide text-xs uppercase">
              End Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary/50 pointer-events-none" />
              <Input
                id="endDate"
                type="date"
                className="pl-10 h-10 text-sm bg-background border-border text-foreground"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 border-border text-foreground font-semibold py-3 shadow-sm transition-all text-sm flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 shadow-md transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isEditMode ? "Update Project" : "Add Project"}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[450px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-card text-foreground border-border shadow-lg">
        <DialogHeader className="space-y-2 pb-1">
          <div className="flex items-center gap-2 pr-8">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
                {isEditMode ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
              <span>{isEditMode ? "Edit Project" : "Add New Project"}</span>
            </DialogTitle>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
              {step}/2
            </span>
          </div>
          <div className="flex gap-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full bg-primary transition-all duration-300 ${step === 1 ? "w-1/2" : "w-full"}`} />
          </div>
        </DialogHeader>

        {step === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
    </Dialog>
  );
}