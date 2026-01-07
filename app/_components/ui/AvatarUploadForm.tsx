import { AvatarFormData, ProfileResponse } from "@/app/types/settings";
import { useForm } from "react-hook-form";
import Button from "./Button";
import { useUploadAvatar } from "@/app/dashboard/bm/queries/settings/useUploadAvatar";
import Spinner from "./Spinner";
import Error from "./Error";

interface AvatarProps {
  data?: ProfileResponse;
}

export default function AvatarUploadForm({ data }: AvatarProps) {
  
  let src =
    data && data.profilePicture ? data.profilePicture : "/profile-picture.svg";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<AvatarFormData>();

  const file = watch("file")?.[0];
  if (file) {
    src = URL.createObjectURL(file);
  }

  const { uploadAvatar, isPending: isSubmitting } = useUploadAvatar(
    setError,
    reset
  );

  const onSubmit = (data: AvatarFormData) => {
    const file = data.file?.[0];

    if (!file) return;

    uploadAvatar(file);
  };

  return (
    <>
      <img src={src} alt="profile picture" className="w-20 h-20 rounded-full" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap items-center lg:flex-nowrap">
          <input
            type="file"
            accept="image/*"
            className="py-4"
            {...register("file", {
              required: "Please select an image to upload",
            })}
          />
          <Button
            fullWidth={true}
            variant="tertiary"
            size="sm"
            disabled={isSubmitting || !file}
          >
            {isSubmitting ? <Spinner /> : "Upload avatar"}
          </Button>
        </div>
        {errors.file && <Error error={errors.file.message} />}
      </form>
    </>
  );
}
