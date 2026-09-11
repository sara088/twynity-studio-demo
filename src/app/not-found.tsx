import Link from "next/link";
import { Logo } from "@/features/shared/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b border-border bg-white px-9">
        <Logo height={26} />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 font-heading text-[120px] font-bold leading-none tracking-[-3px] text-dark">
          404
        </div>
        <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.6px] text-dark">
          Lost in the twynstream
        </h1>
        <p className="mb-8 max-w-[420px] text-[14.5px] leading-[1.55] text-gray-3">
          The page you&apos;re looking for doesn&apos;t exist — or maybe it
          never did.
        </p>
        <Link
          href="/"
          className="inline-flex h-[44px] items-center rounded-[12px] bg-violet px-6 text-[14px] font-bold text-white hover:bg-violet-hover"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
