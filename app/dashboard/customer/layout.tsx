import { ProfileResponse } from "@/app/types/settings";
import { UserProfileService } from "@/app/services/userProfileService";
import DashboardShell from "./DashboardShell";
import { AuthProvider } from "@/app/context/AuthContext";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: ProfileResponse | null = null;

  try {
    profile = await UserProfileService.getProfile();
  } catch (error) {
    console.error("Failed to load profile");
  }

  return (
    <AuthProvider>
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
    </AuthProvider>
  );
}
