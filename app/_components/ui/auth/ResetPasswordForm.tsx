"use client";
import React, { JSX, useEffect, useState } from "react";
import Button from "../Button";
// import Input from "../Input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Error from "../Error";
import { useLocalStorageState } from "@/app/hooks/useLocalStorage";
import { ApiErrorResponse, ResetPasswordData } from "@/app/types/auth";
import { AxiosError } from "axios";
import { AuthService } from "@/app/services/authService";
import { handleAxiosError } from "@/lib/errorHandler";
import Spinner from "../Spinner";
import Link from "next/link";
import { ROUTES } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email(),
  newPassword: z.string().min(8).max(32),
});

type ResetPasswordFormData = z.infer<typeof schema>;

export default function ResetPasswordForm(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => setMounted(true), []);

  const [email, , removeEmail] = useLocalStorageState<string | null>(
    null,
    "email"
  );
  const [otp, , removeOtp] = useLocalStorageState<string | null>(null, "otp");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: email ?? "",
    },
  });

  const [isReseting, setIsReseting] = useState<boolean>(false);

  const router = useRouter();

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !otp)
      return toast.error("You need to verify OTP before proceeding!!");

    setIsReseting(true);
    const payload: ResetPasswordData = {
      ...data,
      otp,
    };

    try {
      const response = await AuthService.resetPassword(payload);
      console.log(response);
      toast.success(response.message);

      removeEmail();
      removeOtp();

      router.push(ROUTES.Auth.LOGIN);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError<ApiErrorResponse>;
      handleAxiosError(err);
    } finally {
      setIsReseting(false);
    }
  };

  if (!mounted) return <p className="py-5 text-center">Loading.....</p>;

  return (
    <>
      {otp && email ? (
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="my-6">
            <div>
              <label className="text-md text-neutral-700" htmlFor="email">
                Email
              </label>
              <Input
                type="text"
                placeholder="Enter your email"
                id="email"
                disabled={isReseting}
                {...register("email")}
              />

              {errors && <Error error={errors.email?.message} />}
            </div>

            <div>
              <label
                className="text-md text-neutral-700"
                htmlFor="new_password"
              >
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                id="new_password"
                autoComplete="new-password"
                disabled={isReseting}
                {...register("newPassword")}
              />
              {errors && <Error error={errors.newPassword?.message} />}
            </div>
          </div>

          <Button fullWidth={true} variant="tertiary" disabled={isReseting}>
            {isReseting ? <Spinner /> : "Submit"}
          </Button>
        </form>
      ) : (
        <Link
          className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
          href={ROUTES.Auth.FORGOT_PASSWORD}
        >
          Forgot password
        </Link>
      )}
    </>
  );
}
