import React, { JSX } from "react";
import MetricCard from "./MetricCard";
import { MetricProps } from "@/app/types/dashboard";


type AllowedCols = 1 | 2 | 3 | 4 

interface AppProps  {
  cols?: AllowedCols;
  item: MetricProps[];
  
}

const colMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
}



export default function Metric({ cols = 4, item }: AppProps): JSX.Element {
  const numcols = colMap[cols] ?? "md:grid-cols-4";
 
  return (
    <div
      className={`grid grid-cols-2 px-4 py-5 my-5 bg-white rounded-md ${numcols}  gap-y-4`}
    >
      {item.map((item: MetricProps, index: number) => {
        return <MetricCard key={index} item={item} index={index} />;
      })}
    </div>
  );
}
