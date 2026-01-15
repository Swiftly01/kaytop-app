import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import LoanAgentClient from "./LoanAgentClient";




export default function LoansPage() {


  return (
    <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <LoanAgentClient />
        </Suspense>
  );
}
