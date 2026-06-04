// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import type { AuthUser } from "../types/auth.types";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface NavUserInfoProps {
  user: AuthUser;
}

export default function NavUserInfo({ user }: NavUserInfoProps) {
  return (
    <Link to="/profile" title="Profile">
      <div className="flex cursor-pointer items-center gap-3 rounded-sm border border-border p-1 transition-colors duration-100 hover:border-accent-foreground hover:bg-primary/5">
        {/* Text info */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">{user.username}</p>
          <p className="text-xs" style={{ color: "var(--gold)" }}>
            {user.elo} ELO
          </p>
        </div>

        {/* Avatar */}
        <Avatar
          className="h-9 w-9 border"
          style={{ borderColor: "var(--border-gold)" }}
        >
          <AvatarFallback
            className="text-sm font-semibold"
            style={{
              background: "var(--gold-subtle)",
              color: "var(--gold)",
            }}
          >
            {user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
}
