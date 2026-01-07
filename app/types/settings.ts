export interface ProfileResponse {
  address?: string | null;
  branch: string;
  dob?: string | null;
  email: string;
  firstName: string;
  id: number;
  isVerified: boolean;
  lastName: string;
  mobileNumber: string;
  profilePicture?: string | null;
  role: string;
  state: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

export interface AvatarFormData {
  file: FileList;
}

export interface UploadAvatarResponse {
  message: string;
  url: string;
}

