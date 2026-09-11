"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/features/shared/components/Logo";
import { AvatarPanel } from "@/features/onboarding/components/AvatarPanel";
import { BuildStep, type Choice } from "@/features/onboarding/components/BuildStep";
import { AccountStep, type Account } from "@/features/onboarding/components/AccountStep";
import { VerifyStep } from "@/features/onboarding/components/VerifyStep";
import { startAvatarProcessing } from "@/features/shared/lib/avatar";
import { hasCustomAvatars, setTierId, TIERS, type TierId } from "@/features/shared/lib/tier";
import { setChosenAvatar } from "@/features/shared/lib/avatarChoice";

// New twyns land in this prototype twyn's studio.
const NEW_TWYN_ID = "sara";

type Step = 1 | 2 | 3;

const CAPTIONS: Record<string, string> = {
  "1": "Pick a look and a voice to get started — free for 15 days. You can make your avatar move anytime from your studio.",
  "2": "Create an account to save your twyn — then I'll bring it to life in the studio.",
  "3": "Almost there — confirm your email and your twyn goes live.",
};

// Logged-in "add another twyn" flow (from the my-twyns tile): no account or
// email step — just build and you're back in your twyns.
const ADD_CAPTION =
  "A new you for a new role. Add a photo and a short voice clip — I'll spin up another twyn.";

export default function OnboardingPage() {
  // useSearchParams requires a Suspense boundary during static rendering.
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}

function OnboardingFlow() {
  const addMode = useSearchParams().get("add") === "1";
  const [step, setStep] = useState<Step>(1);
  const [photo, setPhoto] = useState<string | null>(null);
  // Whether the user recorded their own video (avatar trains ~4–5h) vs picked a
  // ready-made one (instant). Drives whether the studio opens in processing mode.
  const [faceSource, setFaceSource] = useState<"own" | "ready" | null>(null);
  // Build selections live here (not in BuildStep) so they persist when the user
  // navigates back and forward between steps.
  const [face, setFace] = useState<Choice>(null);
  const [voice, setVoice] = useState<Choice>(null);
  const [ownVoiceReady, setOwnVoiceReady] = useState(false);
  // On-camera consent clip captured (paired with the training clip for own footage).
  const [consentVideoDone, setConsentVideoDone] = useState(false);
  const [consented, setConsented] = useState(false);
  const [account, setAccount] = useState<Account>({ name: "", email: "", password: "" });
  // Custom avatar gating. Read the tier on the client (effect, not the initial
  // render) to avoid a hydration mismatch; unlocked from the start if the tier
  // already includes custom (e.g. ?tier=paid). Onboarding NEVER charges — paid
  // upgrades happen later, in-app, as a normal logged-in purchase. The only way
  // custom unlocks here is a promo code, which comps instantly (no Stripe).
  const [customUnlocked, setCustomUnlocked] = useState(false);
  // The tier the user ends up with — free trial by default, persisted on entry
  // so the studio matches. A fresh signup is ALWAYS free unless the URL says
  // otherwise; we deliberately ignore any previously-stored tier here, so the
  // promo path stays visible even after testing a paid flow.
  const [grantedTier, setGrantedTier] = useState<TierId>("free-trial");
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("tier");
    const id: TierId | null =
      raw === "paid" ? "basic" : raw === "free" ? "free-trial" : raw && raw in TIERS ? (raw as TierId) : null;
    if (id) {
      setGrantedTier(id);
      if (hasCustomAvatars(id)) setCustomUnlocked(true);
    }
  }, []);
  const router = useRouter();

  const onPromoUnlock = (tier: TierId) => {
    setGrantedTier(tier); // comped — no charge
    setCustomUnlocked(true);
  };

  // New twyn → straight into its studio. Only custom-unlocked entries (a promo
  // comp, or ?tier=paid) process the captured video into an animated avatar.
  // Everyone else lands free with a still photo and upgrades later, in-app.
  const enterStudio = () => {
    setTierId(grantedTier); // studio reflects the tier they ended on (free → static)
    // Carry the chosen avatar (stock replica or captured still) into the studio,
    // recording whether it's the user's OWN footage — if so, the in-studio
    // upgrade can process it on payment without asking for a video again.
    if (photo) setChosenAvatar(NEW_TWYN_ID, photo, faceSource === "own");
    if (faceSource === "own" && customUnlocked) startAvatarProcessing(NEW_TWYN_ID);
    // Land on the tier-explicit URL so the studio clearly shows the right state:
    //   free trial → ?tier=free  (static photo + "Make it move")
    //   promo/Basic → ?tier=basic (avatar processing)
    const tierParam = grantedTier === "free-trial" ? "free" : grantedTier;
    router.push(`/talk/${NEW_TWYN_ID}?tier=${tierParam}`);
  };
  // Signup: build → account → verify → studio (always free; no paywall in the
  // path). Add-another (logged in) skips straight to the studio.
  const afterBuild = () => (addMode ? enterStudio() : setStep(2));
  const afterAccount = () => setStep(3);
  const afterVerify = () => enterStudio();

  const caption =
    addMode && step === 1
      ? ADD_CAPTION
      : step === 1 && customUnlocked
        ? "Record a short video and voice to make your twyn look and sound like you — or pick a ready-made one."
        : CAPTIONS[String(step)];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-page">
      {/* Minimal brand header (no product topbar / sidebar on onboarding) */}
      <header className="flex h-[60px] shrink-0 items-center border-b border-border bg-bg-page px-7">
        <Logo height={28} />
      </header>

      <main className="grid flex-1 overflow-hidden lg:grid-cols-2">
        <AvatarPanel caption={caption} photo={photo} />

        {/* Top-aligned on mobile (fills from the top, no empty centering gap);
            vertically centered beside the Sky panel at lg+. */}
        <section className="flex items-start justify-center overflow-y-auto bg-bg-page px-6 pb-10 pt-8 sm:px-14 lg:items-center lg:py-12">
          <div className="w-full max-w-[480px]">
            {addMode && step === 1 ? (
              <BuildStep
                onContinue={afterBuild}
                photo={photo}
                onPhotoChange={setPhoto}
                onFaceSourceChange={setFaceSource}
                customUnlocked={customUnlocked}
                onPromoUnlock={onPromoUnlock}
                tierLabel={customUnlocked ? TIERS[grantedTier].name : undefined}
                face={face}
                setFace={setFace}
                voice={voice}
                setVoice={setVoice}
                ownVoiceReady={ownVoiceReady}
                setOwnVoiceReady={setOwnVoiceReady}
                consentVideoDone={consentVideoDone}
                setConsentVideoDone={setConsentVideoDone}
                consented={consented}
                setConsented={setConsented}
                eyebrow="Add another twyn"
                heading="Build another you."
                cta="Create twyn"
              />
            ) : step === 1 ? (
              <BuildStep
                onContinue={afterBuild}
                photo={photo}
                onPhotoChange={setPhoto}
                onFaceSourceChange={setFaceSource}
                customUnlocked={customUnlocked}
                onPromoUnlock={onPromoUnlock}
                tierLabel={customUnlocked ? TIERS[grantedTier].name : undefined}
                face={face}
                setFace={setFace}
                voice={voice}
                setVoice={setVoice}
                ownVoiceReady={ownVoiceReady}
                setOwnVoiceReady={setOwnVoiceReady}
                consentVideoDone={consentVideoDone}
                setConsentVideoDone={setConsentVideoDone}
                consented={consented}
                setConsented={setConsented}
              />
            ) : step === 2 ? (
              <AccountStep
                value={account}
                onChange={setAccount}
                onBack={() => setStep(1)}
                onSubmit={afterAccount}
              />
            ) : (
              <VerifyStep
                email={account.email}
                onChangeEmail={() => setStep(2)}
                onVerified={afterVerify}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
