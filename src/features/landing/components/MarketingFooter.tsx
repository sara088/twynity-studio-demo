import Link from "next/link";
import { Logo } from "@/features/shared/components/Logo";

const COLUMNS = [
  {
    title: "Product",
    items: [
      { label: "What's new", href: "/whats-new" },
      { label: "Changelog", href: "/changelog" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "How it works", href: "/#paths" },
      { label: "Marketplace", href: "/marketplace?public" },
      { label: "For Orgs", href: "/#orgs" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "info@4th-ir.com", href: "mailto:info@4th-ir.com" },
      { label: "Alpenstrasse 10" },
      { label: "6300 Zug, Switzerland" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms and Conditions", href: "#" },
      { label: "Security Overview", href: "#" },
      { label: "Subprocessor List", href: "#" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-white">
      <div className="mx-auto max-w-[1120px] px-7 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_3fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Logo height={28} />
            <p className="mt-4 text-[12.5px] text-gray-4">
              © <span className="font-sans">2026</span> — All rights reserved
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.18em] text-gray-5">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="text-[13px] text-gray-2 transition-colors hover:text-violet"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-gray-3">
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
