import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CustomerAgentClient from "./CustomerAgentClient";



export default function CustomersPage() {
 

  return (
  <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <CustomerAgentClient />
        </Suspense>
  );
}


