import { ProfileResponse, AvatarFormData } from "@/app/types/settings";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import { useUploadAvatar } from "@/app/dashboard/bm/queries/settings/useUploadAvatar";
import Spinner from "./Spinner";
import Error from "./Error";

import { API_CONFIG } from "@/lib/api/config";

interface AvatarProps {
  data?: ProfileResponse;
}

export default function AvatarUploadForm({ data }: AvatarProps) {
  const resolveImageUrl = (path: string | null | undefined) => {
    if (!path) return "/profile-picture.svg";
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/profile-picture.svg')) {
      return path;
    }
    return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialSrc = resolveImageUrl(data?.profilePicture);
  let src = previewUrl || initialSrc;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<AvatarFormData>();

  const file = watch("file")?.[0];

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

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
