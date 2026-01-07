import { badgeConfig } from "@/lib/badgeConfig";
import { JSX } from "react";

export type BadgeStatus = keyof typeof badgeConfig;

interface BadgeProps {
  badge: BadgeStatus;
}

export default function Badge({ badge }: BadgeProps): JSX.Element {
  const { label, icon, className } = badgeConfig[badge];

  return (
    <div
      className={`${className} text-center text-sm flex items-center w-fit gap-1 px-2 rounded-full`}
    >
      <img src={icon} alt={label} />
      {label}
    </div>
  );
}
