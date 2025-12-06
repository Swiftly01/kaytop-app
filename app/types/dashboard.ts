export interface MetricProps {
  title: string;
  value: string;
  change: string;
  changeColor: "green" | "red";
  border: boolean;
}

export interface Routes {
  Bm: {
    DASHBOARD: string;
    CREDIT: string;
    CUSTOMERS: string;
    LOAN: string;
    REPORT: string;
    SETTING: string;
  };
}
