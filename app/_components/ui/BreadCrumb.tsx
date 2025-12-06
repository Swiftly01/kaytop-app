import Link from "next/link";
import React, { JSX } from "react";

type breadCrumbProps = {
  title: string;
  link: string;
};

export default function BreadCrumb({ title, link }: breadCrumbProps): JSX.Element {
  return (
    <div className="mt-5 leading-4 text-neutral-700">
      <Link
        href={link}
        className="relative inline-flex items-center cursor-pointer group w-fit"
      >
        <img src="/back.svg" alt="Back" className="relative z-10" />

        <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-brand-purple transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <h1 className="text-2xl font-medium">{title}</h1>
    </div>
  );
}
