import { useState } from "react";
import { ReportStatus, ReportType } from "@/app/types/report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/Select";


interface Props {
  status?: ReportStatus;
  type?: ReportType;
  onStatusChange: (status: ReportStatus | undefined) => void;
  onTypeChange: (type: ReportType | undefined) => void;
}

const statusOptions: { value: ReportStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: ReportStatus.DRAFT, label: "Draft" },
  { value: ReportStatus.SUBMITTED, label: "Submitted" },
  { value: ReportStatus.FORWARDED, label: "Forwarded" },
  { value: ReportStatus.APPROVED, label: "Approved" },
  { value: ReportStatus.DECLINED, label: "Declined" },
];


const typeOptions: { value: ReportType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

export default function ReportFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Status Filter */}
      <Select
        value={status || "all"}
        onValueChange={(v) => onStatusChange(v === "all" ? undefined : (v as ReportStatus))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={type || "all"}
        onValueChange={(v) => onTypeChange(v === "all" ? undefined : (v as ReportType))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
