"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/features/shared/components/Logo";

export function MarketingTopbar({
  variant = "supply",
}: {
  variant?: "supply" | "demand";
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Close on Escape and lock body scroll while the menu sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinks = [
    { href: "/#paths", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/marketplace?public", label: "Marketplace" },
    variant === "supply"
      ? { href: "/#orgs", label: "For Orgs" }
      : { href: "/", label: "For People" },
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/70 px-5 backdrop-blur-md sm:px-9"
      style={{ background: "color-mix(in srgb, var(--bg-page) 86%, transparent)" }}
    >
      <Logo height={28} />

      {/* Desktop nav */}
      <nav className="hidden items-center gap-7 text-[13.5px] font-medium text-gray-2 md:flex">
        {navLinks.map((l) => (
          <Link key={l.label} href={l.href} className="transition-colors hover:text-dark">
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden px-2.5 text-[13.5px] font-medium text-gray-2 transition-colors hover:text-dark md:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href="/onboarding"
          className="inline-flex h-9 items-center rounded-btn bg-violet px-[18px] text-[13px] font-semibold text-white transition-colors hover:bg-violet-h sm:text-[13.5px]"
        >
          Create your twyn
        </Link>
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-[10px] text-gray-2 transition-colors hover:bg-black/5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu sheet */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="fixed inset-0 top-16 z-40 bg-dark/20 md:hidden"
          />
          <nav className="absolute inset-x-0 top-16 z-50 flex flex-col gap-1 border-b border-border bg-bg-page px-5 pb-5 pt-2 shadow-[0_16px_40px_rgba(15,15,30,0.10)] md:hidden">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={close}
                className="rounded-[10px] px-3 py-3 text-[15px] font-semibold text-dark transition-colors hover:bg-bg-input"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={close}
              className="mt-1 rounded-[10px] border border-border px-3 py-3 text-center text-[14px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
            >
              Sign in
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
