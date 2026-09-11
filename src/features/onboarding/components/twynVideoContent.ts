// Shared copy for the twyn-video capture (consent + training). Kept in one place
// so the recording dialog and the upload card always show the same script/rules.

// Read on camera for the CONSENT clip.
export const CONSENT_SCRIPT =
  "“I, (your name), am currently speaking and give consent to create an AI clone of me by using the audio and video samples I provide. I understand that this AI clone can be used to create videos that look and sound like me.”";

// Read on camera for the first minute of the TRAINING clip (the "talking" half).
// Placeholder copy — swap for the final approved training script.
export const TRAINING_SCRIPT =
  "“Hi — I'm recording this so my twyn can learn how I look, move, and sound. I'll talk for about a minute and change my tone as I go. Right now I'm relaxed, chatting the way I would with a friend. Here's me a little more upbeat and energetic, the way I sound when something excites me. And here's me slowing down — calm and clear, like I'm explaining something that matters. I'll let my face move naturally: a smile, a raised eyebrow, a pause to think. When the timer switches over, I'll stop talking and simply hold still and stay quiet for the last minute.”";

export const RECORDING_RULES = [
  "Use a quiet, well-lit room with a simple, static background.",
  "Place the camera at eye level; your face should fill roughly a quarter of the frame or more.",
  "Export as MP4 or WebM (max 750 MB per file).",
  "Training video: 2 minutes total — 1 minute reading the training script aloud, then 1 minute holding still and silent (like listening on a call).",
];

// A sample training clip creators can watch before recording their own.
export const SAMPLE_TRAINING_SRC = "/assets/avatar.mp4";

// Read aloud for the VOICE clip (~15s of natural speech to sample the voice).
export const VOICE_SCRIPT =
  "“Hi, I'm here. I help people think clearly, build things that last, and keep my word. I get sharper under pressure, ask the questions others don't, and care more about being useful than impressive. I move fast without cutting corners, I listen before I speak, and I follow through on every promise I make — that's just who I am.”";
export const VOICE_SECS = 15;

// DEMO ONLY: run the recording countdowns this many times faster than real
// seconds so the flow can be witnessed quickly. The timer still SHOWS real
// seconds counting down (1:00, 0:20, …) — it just advances faster.
export const RECORD_TIME_SCALE = 12;
