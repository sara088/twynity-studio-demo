// Soft page washes — mint top-left, lavender right — for the landing's tinted
// ambiance. Exact positions/sizes/blur/opacity + colors from the prototype.
export function BgWash() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-[200px] -top-[200px] z-0 h-[700px] w-[700px] rounded-full opacity-55"
        style={{ background: "var(--mint)", filter: "blur(120px)" }}
      />
      <div
        className="pointer-events-none absolute -right-[250px] top-[100px] z-0 h-[800px] w-[800px] rounded-full opacity-55"
        style={{ background: "var(--lavender)", filter: "blur(120px)" }}
      />
      <div
        className="pointer-events-none absolute -left-[200px] top-[2400px] z-0 h-[700px] w-[700px] rounded-full opacity-40"
        style={{ background: "var(--lavender)", filter: "blur(140px)" }}
      />
      <div
        className="pointer-events-none absolute -right-[250px] top-[4100px] z-0 h-[700px] w-[700px] rounded-full opacity-[0.35]"
        style={{ background: "var(--mint)", filter: "blur(140px)" }}
      />
    </>
  );
}
