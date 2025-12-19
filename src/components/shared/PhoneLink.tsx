"use client";

import { trackPhoneClick } from "@/lib/gtag";
import { PhoneCall } from "lucide-react";

interface PhoneLinkProps {
  children?: React.ReactNode;
  className?: string;
  phoneNumber?: string;
  showIcon?: boolean;
  iconClassName?: string;
}

export function PhoneLink({ 
  children, 
  className = "",
  phoneNumber = "+902129099971",
  showIcon = true,
  iconClassName = "h-5 w-5"
}: PhoneLinkProps) {
  return (
    <a 
      href={`tel:${phoneNumber}`}
      onClick={trackPhoneClick}
      className={className}
    >
      {showIcon && <PhoneCall className={iconClassName} />}
      {children}
    </a>
  );
}
