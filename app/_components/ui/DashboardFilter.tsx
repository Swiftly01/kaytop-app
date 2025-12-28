import Filter from "./Filter";

interface DashboardFilterProps {
  isLoading: boolean;
}

export default function DashboardFilter({ isLoading }: DashboardFilterProps) {
  return (
    <Filter
      isLoading={isLoading}
      filterField="last"
      options={[
        { value: "custom", label: "12 months" },
        { value: "last_30_days", label: "30 days" },
        { value: "last_7_days", label: "7 days" },
        { value: "last_24_hours", label: "24 hours" },
      ]}
    />
  );
}
