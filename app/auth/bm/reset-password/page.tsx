import ResetPasswordForm from "@/app/_components/ui/auth/ResetPasswordForm";
import { JSX } from "react";

export const metadata = {
  title: "Reset password"
}

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Create new password
      </h1>
      <p className="text-md text-neutral-700">
        Create a new password for your Kaytop account.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
