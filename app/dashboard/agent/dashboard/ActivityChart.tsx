import { DashboardKpi } from "@/app/types/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ActivityChartProps {
  data?: DashboardKpi;
  isLoading?: boolean;
}

// Generate monthly bar chart data based on KPI
function generateBarData(kpi?: DashboardKpi) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Generate simulated monthly data based on totals
  const baseValue = kpi?.totalDisbursedValue ? kpi.totalDisbursedValue / 12 / 1000 : 100;
  
  return months.map((name, index) => {
    // Use deterministic values based on month index instead of Math.random()
    const monthVariation = 0.7 + (index % 3) * 0.2; // Creates variation: 0.7, 0.9, 1.1
    const seasonalFactor = 1 + Math.sin((index / 12) * 2 * Math.PI) * 0.3; // Seasonal variation
    
    return {
      name,
      disbursed: Math.round(baseValue * monthVariation * seasonalFactor),
      repaid: Math.round(baseValue * 0.6 * monthVariation * seasonalFactor),
      savings: Math.round(baseValue * 0.4 * monthVariation * seasonalFactor),
    };
  });
}

// Generate donut chart data
function generateDonutData(kpi?: DashboardKpi) {
  return [
    { name: "Active loans", value: kpi?.activeLoans ?? 60 },
    { name: "Missed payments", value: kpi?.overdueLoans ?? 25 },
    { name: "New users", value: kpi?.newSavingsAccountsThisPeriod ?? 15 },
  ];
}

const DONUT_COLORS = ["#6B21A8", "#C4B5FD", "#EDE9FE"];

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  const barData = generateBarData(data);
  const donutData = generateDonutData(data);

  if (isLoading) {
    return (
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-24 mb-4" />
        <div className="h-[260px] bg-muted rounded" />
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <h2 className="text-foreground font-medium mb-4">Activity</h2>
      <hr className="border-border pb-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Bar chart container */}
        <div className="flex-1 min-h-60">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -16, bottom: 10 }}>
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="savings" stackId="a" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repaid" stackId="a" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="disbursed" stackId="a" fill="#5B21B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
      formatter={(value: number, name: string) => [`${value}`, name]}
    />
                <Pie
                  data={donutData}
                  innerRadius="70%"
                  outerRadius="90%"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  cornerRadius={8}
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="px-3 pb-3">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-[#5B21B6]" /> Active loans
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-[#C4B5FD]" /> Missed payments
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-[#EDE9FE]" /> New users
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
