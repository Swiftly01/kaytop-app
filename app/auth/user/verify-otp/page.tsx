import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import VerifyOtpClient from "./VerifyOtpClient";

export const metadata = {
  title: "Verify OTP"
  
}

export default function page() { 
 <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <VerifyOtpClient />
        </Suspense>
}