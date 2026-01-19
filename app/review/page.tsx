"use client";

import Button from "@/app/_components/ui/Button";
import { ROUTES } from "@/lib/utils";
import { ShieldAlert, MapPin } from "lucide-react";

import { useRouter } from "next/navigation";

export default function AccountUnderReviewPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-violet-50 to-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">

        {/* Icon */}
        <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title */}
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Account Under Review
        </h1>

        {/* Message */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Your account is currently under review.
          <br />
          Kindly visit the nearest branch with a valid means of identification
          to complete your registration.
        </p>

        {/* Location hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>Visit any approved branch</span>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            fullWidth
            variant="tertiary"
            onClick={() => router.push(ROUTES.User.Auth.LOGIN)}
          >
            Back to Login
          </Button>

          {/* <button
            // onClick={() => router.push(ROUTES.User.SUPPORT)}
            className="text-sm text-violet-600 hover:underline"
          >
            Contact Support
          </button> */}
        </div>
      </div>
    </main>
  );
}
