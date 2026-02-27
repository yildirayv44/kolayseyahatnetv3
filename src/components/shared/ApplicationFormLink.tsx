"use client";

import { useApplicationFormType, getApplicationFormLink } from "@/hooks/useApplicationFormType";

interface ApplicationFormLinkProps {
  children: React.ReactNode;
  className?: string;
  queryParams?: Record<string, string | number>;
  onClick?: () => void;
}

export function ApplicationFormLink({ children, className, queryParams, onClick }: ApplicationFormLinkProps) {
  const formType = useApplicationFormType();
  const { href, target } = getApplicationFormLink(formType, queryParams);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    if (formType === "standalone") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={formType === "standalone" ? "noopener noreferrer" : undefined}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
