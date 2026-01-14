import DashboardShell from "./DashboardShell";
import { ProfileResponse } from "@/app/types/settings";
import { UserProfileService } from "@/app/services/userProfileService";

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
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  );
}


// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { ChevronDown, Menu, X } from "lucide-react";
// import { AddCustomerFlowProvider } from "./AddCustomerFlow/AddCustomerFlowProvider";
// import AddCustomerFlowModal from "./AddCustomerFlow/AddCustomerFlowModal";
// import { Toaster } from "react-hot-toast";
// import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
// import { profileService } from "@/app/services/profileService";
// import { AxiosError } from "axios";
// import Image from "next/image";
// import logo from "@/public/logo.png";
// import ProfileDropdown from "@/app/_components/ui/ProfileDropdown";
// import { AuthProvider, useAuth } from "@/app/context/AuthContext";
// import { ProfileResponse } from "@/app/types/settings";
// import { useRouter } from "next/router";
// import toast from "react-hot-toast";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import SpinnerLg from "@/app/_components/ui/SpinnerLg";


// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [profile, setProfile] = useState<ProfileResponse | null>(null);
//   const [loading, setLoading] = useState(true);


//   const { logOut } = useAuth();
//   const router = useRouter();

//   /* ---------------- Fetch Profile ---------------- */
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await profileService.getProfile();
//         setProfile(res);
//       } catch (err) {
//         console.error("Failed to fetch profile");
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleLogout = () => {
//     logOut();
//     toast.success("You have successfully logged out");
//     router.push("/auth/user/login");
//   };

//   /* ---------------- Layout ---------------- */
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* ================= HEADER ================= */}
//       <header className="sticky top-0 z-50 bg-[#3b0f6b] text-white shadow-md">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="h-16 flex items-center justify-between">
//             {/* Left */}
//             <div className="flex items-center gap-4">
//               <button
//                 className="md:hidden p-2 rounded hover:bg-white/10"
//                 onClick={() => setMobileOpen(true)}
//               >
//                 <Menu className="w-6 h-6" />
//               </button>

//               <div className="flex items-center gap-2">
//                 <Image src={logo} alt="Kaytop logo" height={36} />
//                 <span className="font-semibold">Kaytop MI</span>
//               </div>

//               {/* Desktop Nav */}
//               <nav className="hidden md:flex items-center gap-3 text-sm ml-6">
//                 <Link href="/dashboard" className="px-3 py-1 rounded-md bg-white/10">
//                   Dashboard
//                 </Link>
//                 <Link href="/dashboard/agent/customer" className="px-3 py-1 rounded-md hover:bg-white/5">
//                   Customers
//                 </Link>
//                 <Link href="/dashboard/agent/loans" className="px-3 py-1 rounded-md hover:bg-white/5">
//                   Loans
//                 </Link>
//               </nav>
//             </div>

//             {/* Right */}
//             <DropdownMenu onOpenChange={setOpenDrop}>
//       <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
//         <span className="font-medium">{data?.firstName}</span>

//         <Avatar className="h-7 w-7">
//           <AvatarImage src={src} alt="avatar" />
//           <AvatarFallback>
//             <SpinnerLg />
//           </AvatarFallback>
//         </Avatar>

//         <ChevronDown
//           size={18}
//           className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
//         />
//       </DropdownMenuTrigger>

//       <DropdownMenuContent align="end" className="w-48">
//         <DropdownMenuLabel>My Account</DropdownMenuLabel>
//         <Link href="/dashboard/agent/settings">
//           <DropdownMenuItem className="cursor-pointer">
//             Settings
//           </DropdownMenuItem>
//         </Link>

//         <DropdownMenuSeparator />
//         <DropdownMenuItem
//           className="text-red-600 cursor-pointer"
//           onClick={handleLogout}
//         >
//           Logout
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//           </div>
//         </div>
//       </header>

//       {/* ================= MOBILE OVERLAY ================= */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-40"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* ================= MOBILE SIDEBAR ================= */}
//       <aside
//         className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform
//         ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="p-4 flex items-center justify-between border-b">
//           <div className="flex items-center gap-2">
//             <Image src={logo} alt="logo" height={28} />
//             <span className="font-semibold text-[#3b0f6b]">Kaytop MI</span>
//           </div>

//           <button onClick={() => setMobileOpen(false)}>
//             <X className="w-6 h-6 text-gray-700" />
//           </button>
//         </div>

//         <nav className="flex flex-col p-4 text-sm">
//           <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
//             Dashboard
//           </Link>
//           <Link href="/dashboard/agent/customer" className="px-3 py-2 rounded hover:bg-gray-100">
//             Customers
//           </Link>
//           <Link href="/dashboard/agent/loans" className="px-3 py-2 rounded hover:bg-gray-100">
//             Loans
//           </Link>
//         </nav>
//       </aside>

//       {/* ================= MAIN CONTENT ================= */}
//       <main className="flex-1 w-full max-w-7xl mx-auto p-6">
//         <DashboardWrapper>
//           <AddCustomerFlowProvider>
//             {children}
//             <AddCustomerFlowModal />
//           </AddCustomerFlowProvider>
//         </DashboardWrapper>
//       </main>

//       {/* ================= FOOTER ================= */}
//       <footer className="py-4 text-center text-sm text-gray-500">
//         © 2025 Kaytop MI. All rights reserved.
//       </footer>
//     </div>
//   );
// }


// interface ProfileProps {
//   data?: ProfileResponse;
// }


// export default function DashboardLayout({
//   { data, children }: ProfileProps
// }: {
//   children: React.ReactNode;
// }) {
//   const [open, setOpen] = useState(false);
//   let profile = undefined;
//   const [openDrop, setOpenDrop] = useState(false);
//   const { logOut } = useAuth();
//   const router = useRouter();
//   const handleLogout = () => {
//     logOut();
//     toast.success("You have successfully logged out");
//     router.push("/auth/user/login");
//   };

//   const src =
//     data && data.profilePicture !== null ? data.profilePicture : "/avatar.svg";
  
//     try {
//       profile = await profileService.getProfile();
//     } catch (err: AxiosError | unknown) {
//       const error = err as AxiosError;
//       console.error("Failed to fetch profile:", error.message);
//     }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Top Navigation */}
//       <header className="w-full bg-[#3b0f6b] text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="h-16 flex items-center justify-between">
//             {/* Left section */}
//             <div className="flex items-center gap-4">
//               {/* Hamburger (Mobile Only) */}
//               <button
//                 className="md:hidden p-2 rounded hover:bg-white/10 transition"
//                 onClick={() => setOpen(true)}
//               >
//                 <Menu className="w-6 h-6" />
//               </button>

//               {/* Logo */}
//               <div className="flex items-center gap-2">
//                 <Image height="40" src={logo} alt="Kaytop logo" />
//                 <span className="font-semibold">Kaytop MI</span>
//               </div>

//               {/* Desktop Nav */}
//               <nav className="hidden md:flex items-center gap-3 text-sm ml-4">
//                 <Link href="/dashboard" className="px-3 py-1 rounded-md bg-white/10">
//                   Dashboard
//                 </Link>
//                 <Link href="/dashboard/agent/customer" className="px-3 py-1 rounded-md hover:bg-white/5">
//                   Customers
//                 </Link>
//                 <Link href="/dashboard/agent/loans" className="px-3 py-1 rounded-md hover:bg-white/5">
//                   Loans
//                 </Link>
//               </nav>
//             </div>

//             {/* Right section */}
//              <AuthProvider>
//           <ProfileDropdown data={profile} />
//         </AuthProvider>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Slide-In Navigation */}
//       <div
//         className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
//           open ? "opacity-100 visible" : "opacity-0 invisible"
//         }`}
//         onClick={() => setOpen(false)}
//       />

//       <aside
//         className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform
//           ${open ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="p-4 flex items-center justify-between border-b">
//           <div className="flex items-center gap-2">
//             <img src="/logo.png" alt="logo" className="h-6" />
//             <span className="font-semibold text-[#3b0f6b]">Kaytop MI</span>
//           </div>

//           <button
//             className="p-2 rounded hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             <X className="w-6 h-6 text-gray-700" />
//           </button>
//         </div>

//         <nav className="flex flex-col p-4 text-gray-800">
//           <Link
//             href="/dashboard"
//             className="px-3 py-2 rounded hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             Dashboard
//           </Link>
//           <Link
//             href="/customers"
//             className="px-3 py-2 rounded hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             Customers
//           </Link>
//           <Link
//             href="/loans"
//             className="px-3 py-2 rounded hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             Loans
//           </Link>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 w-full max-w-6xl mx-auto p-6">
//         {/* {children} */}
//         <DashboardWrapper>
//         <AddCustomerFlowProvider>
//           {children}
//           <AddCustomerFlowModal />
//         </AddCustomerFlowProvider>
//         </DashboardWrapper>
//         </main>

//       {/* Footer */}
//       <footer className="w-full py-4 text-center text-sm text-gray-500">
//         © 2025 Kaytop MI. All rights reserved.
//       </footer>
//        <Toaster position="top-right" />
//     </div>
//   );
// }
