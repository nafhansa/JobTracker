"use client";

import { FreelanceJob } from "@/types";
import { Building, Calendar, DollarSign, Pencil, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/language/context";

interface FreelanceJobCardProps {
  job: FreelanceJob;
  onEdit?: (job: FreelanceJob) => void;
  onDelete?: (job: FreelanceJob) => void;
}

export default function FreelanceJobCard({ job, onEdit, onDelete }: FreelanceJobCardProps) {
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}K`;
    }
    return `Rp ${value}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusConfig = () => {
    switch (job.status) {
      case "ongoing":
        return {
          icon: Clock,
          label: "Ongoing",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          textColor: "text-yellow-700 dark:text-yellow-400",
          dotColor: "bg-yellow-500",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Completed",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-400",
          dotColor: "bg-green-500",
        };
      case "cancelled":
        return {
          icon: XCircle,
          label: "Cancelled",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-400",
          dotColor: "bg-red-500",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg truncate">{job.clientName}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground font-medium">
              {job.serviceType}
            </span>
            <span className="text-xs px-2.5 py-1 bg-primary/10 rounded-full text-primary font-medium">
              {job.product}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
              {statusConfig.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold text-foreground">
                {formatCurrency(job.actualPrice || job.potentialPrice)}
              </span>
              {job.actualPrice && job.actualPrice !== job.potentialPrice && (
                <span className="text-xs line-through text-muted-foreground/60">
                  {formatCurrency(job.potentialPrice)}
                </span>
              )}
            </div>
            {(job.startDate || job.endDate) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(job.startDate)} - {formatDate(job.endDate)}
                </span>
              </div>
            )}
            {job.durationDays && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded">
                {job.durationDays} days
              </span>
            )}
          </div>

          {job.clientContact && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              Contact: {job.clientContact}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(job)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">{t("client.delete.title")}</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    {t("client.delete.description")} <span className="font-semibold text-foreground">{job.clientName}</span>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border-border">
                    {t("common.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(job)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}