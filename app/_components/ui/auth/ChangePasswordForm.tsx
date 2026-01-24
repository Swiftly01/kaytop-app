"use client";
import { useChangePassword } from "@/app/dashboard/bm/queries/auth/useChangePassword";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import Button from "../Button";
import Error from "../Error";
// import Input from "../Input";

import Spinner from "../Spinner";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    currentPassword: z.string().min(8).max(32),
    newPassword: z.string().min(8).max(32),
    confirmNewPassword: z.string().min(8).max(32),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(schema),
  });

  const { changePassword, isPending: isSubmitting } = useChangePassword(
    setError,
    reset
  );

  const onSubmit = async (data: ChangePasswordData) => {
    changePassword(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          className="font-semibold text-gray-400"
          htmlFor="current_password"
        >
          Current password
        </label>

        <Input
          type="password"
          placeholder="*********"
          id="current_password"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <Error error={String(errors.currentPassword.message)} />
        )}
      </div>

      <div>
        <label className="font-semibold text-gray-400" htmlFor="new_password">
          New password
        </label>
        <Input
          type="password"
          placeholder="*********"
          id="new_password"
          autoComplete="new-password"
          disabled={isSubmitting}
          {...register("newPassword")}
        />{" "}
        {errors.newPassword && <Error error={errors.newPassword.message} />}
      </div>

      <div>
        <label
          className="font-semibold text-gray-400"
          htmlFor="confirm_password"
        >
          Confirm New password
        </label>
        <Input
          type="password"
          placeholder="*********"
          id="confirm_password"
          autoComplete="new-password"
          disabled={isSubmitting}
          {...register("confirmNewPassword")}
        />{" "}
        {errors.confirmNewPassword && (
          <Error error={errors.confirmNewPassword.message} />
        )}
      </div>
      <div className="my-5">
        <Button fullWidth={true} variant="tertiary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : "Change Password"}
        </Button>
        <Link
          className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
          href="/"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
