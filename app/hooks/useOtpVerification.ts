import { useEffect, useState } from "react";
import { useLocalStorageState } from "./useLocalStorage";
import { OTP_DURATION } from "@/lib/config";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ApiErrorResponse, OtpData, Purpose } from "../types/auth";
import { AuthService } from "../services/authService";
import { ROUTES } from "@/lib/utils";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/errorHandler";

type OtpPin = string;

export function useOtpVerification(){
  const [email] = useLocalStorageState<string | null>(null, "email");
  const [countDown, setCountDown] = useState<number>(OTP_DURATION);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const [otp, setOtp] = useLocalStorageState<string | null>(null, "otp");
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
      purpose: Purpose.Password_reset,
    };

    try {
      const response = await AuthService.verifyOtp(payload);
      toast.success(response.message);
      setOtp(pin);
      router.push(ROUTES.Bm.Auth.RESET_PASSWORD)
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
      purpose: Purpose.Password_reset,
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