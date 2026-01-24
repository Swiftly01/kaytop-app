"use client";
import Button from "@/app/_components/ui/Button";
import { Checkbox } from "@/app/_components/ui/Checkbox";
// import Input from "@/app/_components/ui/Input";
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
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8).max(32),
  // .refine((val) => /[A-Z]/.test(val), {
  //   message: "Password must contain at least one uppercase letter",
  // }

  // ),
});

type LoginData = z.infer<typeof schema>;

export default function LoginForm() {
  const [isSubmitting, setisSubmitting] = useState(false);
  const { login: auth, setCookie } = useAuth();
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
    setisSubmitting(true);

    try {
      const response = await AuthService.login(data);

      const accessToken = response.access_token;
      const role = response.role;
      console.log("role", role);
      auth(accessToken, role);
      setCookie(accessToken, role);
      toast.success("You have logged in successfully");
      
      // Redirect based on user role
      switch (role) {
        case 'system_admin':
          router.push('/dashboard/system-admin');
          break;
        case 'account_manager':
          router.push('/dashboard/am');
          break;
        case 'branch_manager':
          router.push(ROUTES.Bm.DASHBOARD);
          break;
        case 'credit_officer':
          router.push('/dashboard/agent');
          break;
        case 'customer':
          router.push('/dashboard/customer');
          break;
        default:
          // Fallback to BM dashboard for unknown roles
          router.push(ROUTES.Bm.DASHBOARD);
          break;
      }
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;

      handleAxiosError(err, setError);
    } finally {
      setisSubmitting(false);
    }
  };
  return (
    <form className="my-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="my-3">
        <label htmlFor="email" >Email</label>
        <Input
          type="email"
          placeholder="Enter your email"
          id="email"
          autoComplete="email"
          disabled={isSubmitting}
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
          autoComplete="current-password"
          disabled={isSubmitting}
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
          href={ROUTES.Auth.FORGOT_PASSWORD}
          className="text-sm text-accent"
        >
          Forgot password?
        </Link>
      </div>

      <Button fullWidth={true} variant="tertiary" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : "Sign in"}
      </Button>
    </form>
  );
}
