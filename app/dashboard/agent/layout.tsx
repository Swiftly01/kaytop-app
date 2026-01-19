import DashboardShell from "./DashboardShell";
import { ProfileResponse } from "@/app/types/settings";
import { UserProfileService } from "@/app/services/userProfileService";
import { AuthProvider } from "@/app/context/AuthContext";

export default async function AgentDashboardLayout({
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


