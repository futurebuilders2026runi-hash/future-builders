/**
 * Decorative brand graphics lifted from the Future Builders social artwork:
 * a field of flowing wave lines, circuit traces and molecule clusters.
 * All are purely decorative and hidden from assistive tech.
 */

type Tone = "light" | "dark";

const stroke = (tone: Tone) => (tone === "dark" ? "#8FC7FF" : "#1E6BE8");

/** Layered flowing lines — the signature motif along the bottom of the posts. */
export function Waves({
  tone = "light",
  className = "",
  lines = 20,
}: {
  tone?: Tone;
  className?: string;
  lines?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[26vw] max-h-72 w-full ${className}`}
    >
      <g fill="none" stroke={stroke(tone)} strokeWidth="1">
        {Array.from({ length: lines }, (_, i) => {
          const t = i / (lines - 1);
          const drop = i * 9;
          const sway = 1 - t * 0.35;
          return (
            <path
              key={i}
              d={`M-40,${150 + drop} C ${220 * sway},${60 + drop} ${420},${
                250 + drop * 0.6
              } 720,${170 + drop * 0.8} C ${1010},${100 + drop} ${1220},${
                255 + drop * 0.5
              } 1480,${150 + drop}`}
              opacity={(0.06 + t * 0.16).toFixed(3)}
            />
          );
        })}
      </g>
      <g fill="none" stroke={stroke(tone)} strokeWidth="1.4">
        <path
          d="M-40,196 C 240,96 420,286 720,206 C 1010,126 1220,286 1480,186"
          opacity="0.3"
        />
        <path
          d="M-40,232 C 260,142 440,312 740,236 C 1020,166 1240,306 1480,222"
          opacity="0.2"
        />
      </g>
    </svg>
  );
}

/** Orthogonal circuit traces with terminal nodes, as in the poster corners. */
export function CircuitCorner({
  tone = "light",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const c = stroke(tone);
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 180"
      className={`pointer-events-none absolute h-45 w-60 ${className}`}
      fill="none"
    >
      <g stroke={c} strokeWidth="1" opacity="0.35">
        <path d="M240 24H150l-18 18H60" />
        <path d="M240 56H176l-16 16H96l-14 14H24" />
        <path d="M240 92H196l-20 20h-52" />
        <path d="M188 0v34l-16 16v40" />
        <path d="M216 0v18l-24 24v52" />
        <path d="M140 42v46l-18 18v32" />
      </g>
      <g fill={c} opacity="0.55">
        <circle cx="60" cy="42" r="2.6" />
        <circle cx="24" cy="86" r="2.6" />
        <circle cx="124" cy="112" r="2.6" />
        <circle cx="172" cy="90" r="2.6" />
        <circle cx="192" cy="94" r="2.6" />
        <circle cx="122" cy="138" r="2.6" />
      </g>
    </svg>
  );
}

/** Molecule / node cluster used as a soft background texture. */
export function Molecules({
  tone = "light",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const c = stroke(tone);
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 220"
      className={`pointer-events-none absolute h-55 w-50 ${className}`}
      fill="none"
    >
      <g stroke={c} strokeWidth="1" opacity="0.3">
        <path d="M40 30 96 12 150 44 148 104 92 132 38 96Z" />
        <path d="M96 12 92 132" />
        <path d="M40 30 148 104" />
        <path d="M150 44 38 96" />
        <path d="M92 132 60 186 118 208 150 152 148 104" />
        <path d="M60 186 150 152" />
      </g>
      <g fill={c} opacity="0.45">
        <circle cx="40" cy="30" r="5" />
        <circle cx="96" cy="12" r="7" />
        <circle cx="150" cy="44" r="5" />
        <circle cx="148" cy="104" r="8" />
        <circle cx="92" cy="132" r="5" />
        <circle cx="38" cy="96" r="6" />
        <circle cx="60" cy="186" r="6" />
        <circle cx="118" cy="208" r="4" />
        <circle cx="150" cy="152" r="5" />
      </g>
    </svg>
  );
}
