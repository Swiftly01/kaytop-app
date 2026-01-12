"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Select";
// import { Label } from "../_components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import z from "zod";
import { UserService } from "@/app/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Error from "@/app/_components/ui/Error";
import { Label } from "../../label";



 const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  mobileNumber: z
    .string()
    .regex(/^0[789][01]\d{8}$/, "Invalid Nigerian phone number"),
  branch: z.string().min(1, "Select a branch"),
  state: z.string().min(1, "Select a state"),
  dob: z.string().optional(),
});

export type SignupData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [states, setStates] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    UserService.getStates().then(setStates);
    UserService.getBranches().then(setBranches);
  }, []);

  const onSubmit = (data: SignupData) => {
    sessionStorage.setItem("register_data", JSON.stringify(data));
    router.push("/auth/user/register/password");
  };

  return (

<form onSubmit={handleSubmit(onSubmit)}>

      {/* FIRST & LAST NAME */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>First Name</Label>
          <Input placeholder="Enter First name" {...register("firstName")} />
          {errors.firstName && <Error error={errors.firstName.message} />}
        </div>

        <div>
          <Label>Last Name</Label>
           <Input placeholder="Last name" {...register("lastName")} />
          {errors.lastName && <Error error={errors.lastName.message} />}
        </div>
      </div>

      {/* DOB & PHONE */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Date of Birth</Label>
          <Input type="date" {...register("dob")} />
      {errors.dob && <Error error={errors.dob.message} />}
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input placeholder="08012345678" {...register("mobileNumber")} />
      {errors.mobileNumber && <Error error={errors.mobileNumber.message} />}
        </div>
      </div>

      {/* EMAIL */}
      <div className="mb-4">
        <Label>Email Address</Label>
         <Input placeholder="Email" {...register("email")} />
      {errors.email && <Error error={errors.email.message} />}
      </div>

      {/* BRANCH & STATE */}
      <div className="grid grid-cols-2 gap-4 mb-6">
  <div>
    <Label>Branch</Label>
    <Controller
      name="branch"
      control={control}
      defaultValue=""
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {errors.branch && <Error error={errors.branch.message} />}
  </div>

  <div>
    <Label>State</Label>
    <Controller
      name="state"
      control={control}
      defaultValue=""
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {errors.state && <Error error={errors.state.message} />}
  </div>
</div>


      {/* SUBMIT */}
      <Button
      type="submit"
        variant="tertiary"
        fullWidth
        size="lg"
      >
        Continue
      </Button>
      </form>

  );
}
