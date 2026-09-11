"use client";

import { useRef, useState } from "react";
import { Camera, Check, MailCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/features/shared/components/Field";
import { PillButton } from "@/features/shared/components/PillButton";
import { BillingCard } from "@/features/top-up/components/BillingCard";
import { SARA } from "@/features/shared/data/personas";
import { cn } from "@/lib/utils";

const inputCls =
  "h-11 rounded-input border-border bg-white px-[14px] text-[14px] placeholder:text-gray-6";
const DEFAULT_EMAIL = "sara.gordic@gmail.com";
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Profile section of Account settings — first/last name, photo, and email.
// Changing the email never applies directly: it sends a confirmation link to the
// new address and the current one stays active until that link is clicked.
export function ProfileCard() {
  const [firstName, setFirstName] = useState("Sara");
  const [lastName, setLastName] = useState("Gordic");
  const [photo, setPhoto] = useState(SARA.avatar);
  const [email, setEmail] = useState(DEFAULT_EMAIL); // verified, active address
  const [emailInput, setEmailInput] = useState(DEFAULT_EMAIL);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const emailChanged = emailInput.trim() !== email;
  const emailInvalid = emailChanged && emailInput.trim().length > 0 && !isEmail(emailInput);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const save = () => {
    if (emailInvalid) return;
    // Name + photo apply immediately; the email change goes to verification.
    if (emailChanged && isEmail(emailInput)) {
      setPendingEmail(emailInput.trim());
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const cancelEmailChange = () => {
    setPendingEmail(null);
    setEmailInput(email);
  };

  return (
    <BillingCard title="Profile" description="Your name, photo, and email address.">
      {/* Photo */}
      <div className="mt-5 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          className="h-16 w-16 shrink-0 rounded-[16px] border border-border bg-violet-mid object-cover object-top"
        />
        <div className="flex flex-wrap items-center gap-2">
          <PillButton variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Camera size={14} /> Change photo
          </PillButton>
          {photo !== SARA.avatar && (
            <button
              type="button"
              onClick={() => setPhoto(SARA.avatar)}
              className="text-[12.5px] font-semibold text-gray-4 transition-colors hover:text-error"
            >
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
        </div>
      </div>

      {/* Name */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="ac-first">
          <Input id="ac-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Last name" htmlFor="ac-last">
          <Input id="ac-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
        </Field>
      </div>

      {/* Email */}
      <div className="mt-4">
        <Field
          label="Email"
          htmlFor="ac-email"
          hint={<span className="text-gray-4">Confirmed from the new address</span>}
        >
          <Input
            id="ac-email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            aria-invalid={emailInvalid}
            className={cn(inputCls, emailInvalid && "border-error focus-visible:border-error")}
          />
        </Field>
        {emailInvalid && (
          <p className="mt-1.5 text-[12px] font-medium text-error">Enter a valid email address.</p>
        )}

        {pendingEmail && (
          <div className="mt-3 flex items-start gap-2.5 rounded-input border border-violet-mid bg-violet-light px-3.5 py-3">
            <MailCheck size={16} className="mt-px shrink-0 text-violet" />
            <div className="min-w-0 flex-1 text-[12.5px] leading-[1.55] text-gray-2">
              We sent a confirmation link to <strong className="font-semibold text-dark">{pendingEmail}</strong>.
              Click it to finish the change — <strong className="font-semibold text-dark">{email}</strong> stays
              active until you do.
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingEmail(pendingEmail)}
                  className="font-semibold text-violet hover:underline"
                >
                  Resend link
                </button>
                <button
                  type="button"
                  onClick={cancelEmailChange}
                  className="inline-flex items-center gap-1 font-semibold text-gray-4 hover:text-error"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <PillButton size="sm" onClick={save} disabled={emailInvalid}>
          Save changes
        </PillButton>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
            <Check size={14} /> Changes saved
          </span>
        )}
      </div>
    </BillingCard>
  );
}
