import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { PasswordCard } from "./PasswordCard";

// Account settings detail — edit profile (name, photo, email with verification)
// and change password. Reached from the account hub (/account).
export function AccountSettingsView() {
  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Account
      </Link>

      <header className="mb-7">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          Account settings
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">
          Manage your profile and the password you sign in with.
        </p>
      </header>

      <div className="space-y-5">
        <ProfileCard />
        <PasswordCard />
      </div>
    </div>
  );
}
