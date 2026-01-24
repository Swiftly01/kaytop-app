import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import ReportAgentClient from "./ReportAgentClient";




export default function ReportPage() {


  return (
    <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <ReportAgentClient />
        </Suspense>
  );
}


