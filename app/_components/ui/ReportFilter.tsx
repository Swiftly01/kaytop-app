import { ReportStatus } from "@/app/types/report";
import Filter from "./Filter";

interface ReportFilterProps {
  isLoading: boolean;
}

export default function ReportFilter({ isLoading }: ReportFilterProps) {
  return (
    <Filter<ReportStatus>
      isLoading={isLoading}
      filterField= "status"
      options={[
        { value: ReportStatus.PENDING, label: "Pending" },
        { value:  ReportStatus.APPROVED, label: "Approved" },
        { value:  ReportStatus.DECLINED, label: "Declined" },
        
      ]}
    />
  );
}
