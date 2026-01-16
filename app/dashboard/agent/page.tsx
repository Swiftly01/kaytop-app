import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import AgentDashboardClient from "./AgentDashboardClient";


export default function AgentDashboardPage() {

  return (
    <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <AgentDashboardClient />
        </Suspense>
  );
}

