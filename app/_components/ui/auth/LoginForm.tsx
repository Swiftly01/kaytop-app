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
import toast from "react-hot-toast";
import { authenticationManager } from "@/lib/api/authManager";

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
  const { login: auth, setCookie, isLoading } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(schema),
  });

  // Don't render form until auth context is loaded
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  const onSubmit = async (data: LoginData) => {
    setisSubmitting(true);

    try {
      const response = await AuthService.login(data);

      const accessToken = response.access_token;
      const role = response.role;
      
      // Update AuthContext (legacy)
      auth(accessToken, role);
      
      // Set cookies with proper role conversion
      setCookie(accessToken, role);
      
      // Update authManager with user data
      const userData = {
        id: 'unknown', // LoginResponse doesn't include user details
        firstName: 'User',
        lastName: '',
        email: '',
        role: role,
      };
      
      authenticationManager.setAuth(
        {
          accessToken: accessToken,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        },
        userData
      );
      
      toast.success("You have logged in successfully");
      
      // Role-based routing after login
      const convertRoleForRouting = (apiRole: string): string => {
        const roleMap: Record<string, string> = {
          'system_admin': 'ADMIN',
          'branch_manager': 'BRANCH_MANAGER',
          'account_manager': 'ACCOUNT_MANAGER',
          'hq_manager': 'ADMIN',
          'credit_officer': 'CREDIT_OFFICER',
          'customer': 'USER',
        };
        return roleMap[apiRole] || 'BRANCH_MANAGER';
      };
      
      const roleDashboardRoutes: Record<string, string> = {
        BRANCH_MANAGER: ROUTES.Bm.DASHBOARD,
        ADMIN: "/dashboard/system-admin",
        ACCOUNT_MANAGER: "/dashboard/am",
        CREDIT_OFFICER: "/dashboard/co",
        USER: "/dashboard/customer",
      };
      
      const middlewareRole = convertRoleForRouting(role);
      const targetDashboard = roleDashboardRoutes[middlewareRole] || ROUTES.Bm.DASHBOARD;
      
      console.log('🔍 LoginForm - API Role:', role);
      console.log('🔍 LoginForm - Middleware Role:', middlewareRole);
      console.log('🔍 LoginForm - Target Dashboard:', targetDashboard);
      
      router.push(targetDashboard);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;

      handleAxiosError(err, setError);
    } finally {
      setisSubmitting(false);
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
          href={ROUTES.Bm.Auth.FORGOT_PASSWORD}
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
