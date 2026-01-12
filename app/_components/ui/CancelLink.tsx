import Link from "next/link";
import { JSX, PropsWithChildren } from "react";

export default function CancelLink({
  children,
}: PropsWithChildren): JSX.Element {
  return (
    <Link
      className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
      href="/"
    >
      {children}
    </Link>
  );
}
