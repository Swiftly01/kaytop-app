"use client";
import Button from "@/app/_components/ui/Button";
import { Checkbox } from "@/app/_components/ui/Checkbox";
import Input from "@/app/_components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import Error from "../Error";
import { useState } from "react";
import { AuthService } from "@/app/services/authService";
import { handleAxiosError } from "@/lib/errorHandler";
import { AxiosError } from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { ROUTES } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8).max(32),
  // .refine((val) => /[A-Z]/.test(val), {
  //   message: "Password must contain at least one uppercase letter",
  // }

  // ),
});

type LoginData = z.infer<typeof schema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login: auth } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);

    try {
      const response = await AuthService.login(data);
      //console.log(response);
      const accessToken = response.access_token;
      const role = response.role;
      auth(accessToken, role);
      router.push(ROUTES.Bm.DASHBOARD);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //  console.log(err);
      handleAxiosError(err, setError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="my-2" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          placeholder="Enter your email"
          id="email"
          {...register("email")}
        />
        {errors.email && <Error error={errors.email.message} />}
      </div>

      <div>
        <label htmlFor="password">password</label>
        <Input
          type="password"
          placeholder="Enter your password"
          id="password"
          {...register("password")}
        />
        {errors.password && <Error error={errors.password.message} />}
      </div>

      <div className="flex justify-between my-4">
        <div className="flex items-center gap-3">
          <Checkbox id="terms" />
          <label htmlFor="terms text-sm">Keep me signed in</label>
        </div>
        <Link
          href={ROUTES.Bm.Auth.FORGOT_PASSWORD}
          className="text-sm text-accent"
        >
          Forgot password?
        </Link>
      </div>

      <Button fullWidth={true} variant="tertiary" loading={loading}>
        {loading ? <Spinner /> : "Sign in"}
      </Button>
    </form>
  );
}
