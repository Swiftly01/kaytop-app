import ForgotPasswordForm from "@/app/_components/ui/auth/ForgotPasswordForm";
import { JSX } from "react";

export const metadata = {
  title: "Forgot Password",
};


export default function page(): JSX.Element {
  
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Forgot password?
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter your email, a reset OTP will be sent to you soon
      </p>
      <ForgotPasswordForm/>
      
    </div>
  );
}