import VerifyOtpForm from "@/app/_components/ui/auth/VerifyOtpForm";

export const metadata = {
  title: "Verify OTP"
  
}
export default function page() {
  
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Verify your email
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter the OTP sent to your email for verification
      </p>

      <VerifyOtpForm/>
     
    </div>
  );
}
