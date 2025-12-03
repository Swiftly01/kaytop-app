import React, { JSX } from "react";
import MetricCard from "./MetricCard";

interface MetricProps {
  title: string;
  value: string;
  change: string;
  changeColor: "green" | "red";
  border: boolean;
}

const data: MetricProps[] = [
  {
    title: "All Customers",
    value: "42,094",
    change: "+6% this month",
    changeColor: "green",
    border: false,
  },
  {
    title: "All CO's",
    value: "15,350",
    change: "+6% this month",
    changeColor: "green",
    border: true,
  },
  {
    title: "Loans Processed",
    value: "28,350",
    change: "-26% this month",
    changeColor: "red",
    border: true,
  },
  {
    title: "Loan Amount",
    value: "₦50,350.00",
    change: "+40% this month",
    changeColor: "green",
    border: true,
  },
];



export default function Metric(): JSX.Element {
  return (
    <>
      {data.map((item: MetricProps, index: number) => {
        return <MetricCard key={index} item={item} index={index} />;
      })}
    </>
  );
}
