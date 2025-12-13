"use client";
import Link from "next/link";
import Button from "../Button";
import Input from "../Input";
import { ROUTES } from "@/lib/utils";
import z, { email } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AxiosError } from "axios";
import { AuthService } from "@/app/services/authService";
import { handleAxiosError } from "@/lib/errorHandler";
import Spinner from "../Spinner";
import Error from "../Error";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocalStorageState } from "@/app/hooks/useLocalStorage";

const schema = z.object({
  email: z.email("Invalid email format"),
});

type Email = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [isSubmitting, setSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Email>({
    resolver: zodResolver(schema),
  });
  const [email, setEmail] = useLocalStorageState<string | null>(null, "email");

  const onSubmit = async (data: Email) => {
    setSubmitting(true);

    try {
      const response = await AuthService.forgotPassword(data);
      setEmail(data.email)
      toast.success(response.message);
      console.log(response);
      router.push(ROUTES.Bm.Auth.VERIFY_OTP);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log(err);
      handleAxiosError(err, setError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-5">
        <label htmlFor="email text-md text-neutral-700">Email</label>

        <Input
          type="email"
          placeholder="Enter your email"
          id="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && <Error error={errors.email.message} />}
      </div>

      <div className="mt-6">
        <Button fullWidth={true} variant="tertiary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : "Submit"}
        </Button>
        <Link
          className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
          href={ROUTES.Bm.Auth.LOGIN}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
