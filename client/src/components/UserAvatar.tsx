import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarUser {
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
  companyId?: string | null;
  role?: string;
}

export interface UserAvatarCompany {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface UserAvatarProps {
  user: UserAvatarUser;
  companies?: UserAvatarCompany[];
  companyLogoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  "data-testid"?: string;
}

const INNOVATR_LOGO = "/assets/logos/logo-innovatr.png";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const fallbackTextSize = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

function isInnovatrUser(email: string, role?: string): boolean {
  const adminEmails = ["hannah@innovatr.co.za", "richard@innovatr.co.za"];
  return (
    adminEmails.includes(email.toLowerCase()) ||
    email.toLowerCase().endsWith("@innovatr.co.za") ||
    role === "ADMIN"
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getCompanyLogo(
  companyId: string | null | undefined,
  companies?: UserAvatarCompany[]
): string | null {
  if (!companyId || !companies) return null;
  const company = companies.find((c) => c.id === companyId);
  return company?.logoUrl || null;
}

export function UserAvatar({
  user,
  companies,
  companyLogoUrl,
  size = "md",
  className,
  "data-testid": testId,
}: UserAvatarProps) {
  let logoUrl: string | null = null;

  if (user.avatarUrl) {
    logoUrl = user.avatarUrl;
  } else if (user.companyId) {
    logoUrl = companyLogoUrl ?? getCompanyLogo(user.companyId, companies);
  } else if (isInnovatrUser(user.email, user.role)) {
    logoUrl = INNOVATR_LOGO;
  }

  return (
    <Avatar
      className={cn(sizeClasses[size], className)}
      data-testid={testId}
    >
      {logoUrl ? (
        <AvatarImage
          src={logoUrl}
          alt={user.name || user.email}
          className="object-contain bg-white dark:bg-gray-100 p-0.5"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary font-medium",
          fallbackTextSize[size]
        )}
      >
        {logoUrl ? null : getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
