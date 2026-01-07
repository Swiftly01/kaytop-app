"use client";

import { useAuth } from "@/app/context/AuthContext";
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

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { logOut } = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    console.log("logging out");
    logOut();
    toast.success("You have successfully logged out");
    router.push(ROUTES.Bm.Auth.LOGIN);
  };

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
        <span className="font-medium">Lanre Okedele</span>

        <Avatar className="h-7 w-7">
          <AvatarImage src="/avatar.svg" alt="avatar" />
          <AvatarFallback>LO</AvatarFallback>
        </Avatar>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>

        <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>

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
