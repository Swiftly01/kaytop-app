
import Link from "next/link";
import { Label } from "../../../_components/ui/label";
import Button from "../../../_components/ui/Button";
import ForgotPasswordForm from "@/app/_components/ui/auth/user/ForgotPasswordForm";
import { Input } from "@/components/ui/input";


export const metadata = {
  title: "Forgot Password",
};


export default function ForgotPasswordPage() {
  return (
    <div className=" flex flex-col justify-center items-center px-3">

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md">
        {/* Title + subtitle */}
        <h2 className="text-2xl font-bold text-primary">Forgot password?</h2>
        <p className="text-gray-500 text-sm mt-2 mb-8">
          Please enter your email, a reset OTP will be sent to you soon
        </p>

        <ForgotPasswordForm/>

     
      </div>
       {/* Footer */}
      <div className="text-xs text-gray-500 text-center mt-8">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">
          Terms & Conditions
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
