import { useEffect, useState } from "react";
import { useLocalStorageState } from "./useLocalStorage";
import { OTP_DURATION } from "@/lib/config";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ApiErrorResponse, OtpData, Purpose } from "../types/auth";
import { AuthService } from "../services/authService";
import { ROUTES } from "@/lib/utils";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/errorHandler";

type OtpPin = string;

export function useUserOtpVerification(){
    const searchParams = useSearchParams();
  const [email] = useLocalStorageState<string | null>(null, "email");

  // Detect purpose from query param or default to email verification
  const queryPurpose = searchParams?.get("purpose") as Purpose | null;
  const [purpose] = useState<Purpose>(
    queryPurpose === Purpose.Password_reset
      ? Purpose.Password_reset
      : Purpose.Email_verification
  );


  const [countDown, setCountDown] = useState<number>(OTP_DURATION);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const router = useRouter();

  const disabled = isLoading || isResending;

  

  useEffect(() => {
    if (countDown === 0) return;

    const timer = setInterval(() => {
      setCountDown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countDown]);

  async function handleOtp(pin: OtpPin) {
    if (!email) return toast.error("Email does not exist");
    setIsLoading(true);

    const payload: OtpData = {
      email,
      code: pin,
      purpose,
    };

    try {
      const response = await AuthService.verifyOtp(payload);
      toast.success(response.message);
      // Redirect based on purpose
      if (purpose === Purpose.Email_verification) {
        router.push(ROUTES.User.Auth.LOGIN); // after email verification go to login
      } else if (purpose === Purpose.Password_reset) {
        router.push(ROUTES.User.Auth.RESET_PASSWORD); // password reset flow
        //  router.push(`/auth/user/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError<ApiErrorResponse>;
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  }

  const resendOtp = async () => {
    if (!email) return toast.error("Email does not exist");
    setIsResending(true);
    setCountDown(OTP_DURATION);
    const payload: OtpData = {
      email,
      purpose,
    };

    try {
      const response = await AuthService.sendOtp(payload);
      toast.success(response.message);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError<ApiErrorResponse>;
      handleAxiosError(err);
    } finally {
      setIsResending(false);
    }
  };

    return {
    email,
    countDown,
    disabled,
    isLoading,
    resendOtp,
    handleOtp,
  };

}