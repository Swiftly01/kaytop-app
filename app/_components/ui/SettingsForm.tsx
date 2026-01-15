"use client";
import { useUpdateProfile } from "@/app/dashboard/bm/queries/settings/useUpdateProfile";
import { ProfileResponse } from "@/app/types/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import AvatarUploadForm from "./AvatarUploadForm";
import Button from "./Button";
import Error from "./Error";
// import Input from "./Input";
import Spinner from "./Spinner";
import { Input } from "@/components/ui/input";

interface ProfileProps {
  data?: ProfileResponse;
}

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),
  // email: z.email("Invalid email format"),
  email: z.string().email("Invalid email format"),
dob: z.string(),
});

type UpdateData = z.infer<typeof schema>;

export default function SettingsForm({ data }: ProfileProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateData>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          mobileNumber: data.mobileNumber ?? "",
          email: data.email ?? "",
        }
      : undefined,
  });

  const { updateProfile, isPending: isSubmitting } = useUpdateProfile(
    setError,
    reset
  );

  const onSubmit = async (data: UpdateData) => {
    updateProfile(data);
  };

  return (
    <>
      <AvatarUploadForm data={data} />

      <form action="" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="font-semibold text-neutral-700" htmlFor="firstname">
            Firstname
          </label>

          <Input
            type="text"
            placeholder="Jackson Wallace"
            id="firstname"
            disabled={isSubmitting}
            {...register("firstName")}
          />
          {errors.firstName && <Error error={errors.firstName.message} />}
        </div>
        <div>
          <label className="font-semibold text-neutral-700" htmlFor="lastname">
            Lastname
          </label>

          <Input
            type="text"
            placeholder="Jackson Wallace"
            id="lastname"
            disabled={isSubmitting}
            {...register("lastName")}
          />
          {errors.lastName && <Error error={errors.lastName.message} />}
        </div>

        <div>
          <label className="font-semibold text-neutral-700" htmlFor="email">
            Phone Number
          </label>

          <Input
            type="text"
            placeholder="070 0000 0000"
            id="phone"
            disabled={isSubmitting}
            {...register("mobileNumber")}
          />

          {errors.mobileNumber && <Error error={errors.mobileNumber.message} />}
        </div>

        <div>
          <label className="font-semibold text-neutral-700" htmlFor="email">
            Email
          </label>

          <Input
            type="text"
            placeholder="hello@jackson5.com"
            id="email"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && <Error error={errors.email.message} />}
        </div>
        <div className="my-5">
          <Button fullWidth={true} variant="tertiary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Update"}
          </Button>
        </div>
      </form>
    </>
  );
}
