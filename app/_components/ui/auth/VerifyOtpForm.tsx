"use client";
import { useOtpVerification } from "@/app/hooks/useOtpVerification";
import Button from "../Button";
import OtpInput from "../OtpInput";
import Spinner from "../Spinner";

export default function VerifyOtpForm() {
  const { countDown, disabled, isLoading, resendOtp, handleOtp } =
    useOtpVerification();

  return (
    <form action="" className="my-2">
      {!isLoading && (
        <div className="my-6">
          <label htmlFor="OTP">Enter OTP</label>

          <OtpInput onComplete={handleOtp} />
          {countDown > 0 ? (
            <p className="text-center text-neutral-700">
              OTP will expires in {countDown} seconds
            </p>
          ) : (
            <h1
              onClick={resendOtp}
              className="text-center underline cursor-pointer text-neutral-700"
            >
              Resend OTP
            </h1>
          )}
        </div>
      )}

      <Button fullWidth={true} variant="tertiary" disabled={disabled}>
        {isLoading ? <Spinner /> : "Submit"}
      </Button>
    </form>
  );
}
