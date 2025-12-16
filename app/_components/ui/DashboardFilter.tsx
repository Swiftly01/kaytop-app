import React, { JSX } from "react";
import Filter from "./Filter";

export default function DashboardFilter(): JSX.Element {
  return (
    <Filter
      filterField="last"
      options={[
        { value: "last_12_months", label: "12 months" },
        { value: "last_30_days", label: "30 days" },
        { value: "last_7_days", label: "7 days" },
        { value: "last_24_hours", label: "24 hours" },
      ]}
    />
  );
}
