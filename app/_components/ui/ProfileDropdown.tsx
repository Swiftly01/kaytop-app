"use client";

import { useAuth } from "@/app/context/AuthContext";
import { ProfileResponse } from "@/app/types/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import SpinnerLg from "./SpinnerLg";
import Link from "next/link";

interface ProfileProps {
  data?: ProfileResponse;
}

export default function ProfileDropdown({ data }: ProfileProps) {
 
  const [open, setOpen] = useState(false);
  const { logOut } = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    logOut();
    toast.success("You have successfully logged out");
    router.push(ROUTES.Auth.LOGIN);
  };

  const src =
    data && data.profilePicture !== null ? data.profilePicture : "/avatar.svg";

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
        <span className="font-medium">{data?.firstName}</span>

        <Avatar className="h-7 w-7">
          <AvatarImage src={src} alt="avatar" />
          <AvatarFallback>
            <SpinnerLg />
          </AvatarFallback>
        </Avatar>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <Link href={ROUTES.Bm.SETTING}>
          <DropdownMenuItem className="cursor-pointer">
            Settings
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}