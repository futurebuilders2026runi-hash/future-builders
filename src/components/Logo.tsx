import Image from "next/image";
import logoDark from "@/assets/brand/logo.png";
import logoLight from "@/assets/brand/logo-light.png";
import mark from "@/assets/brand/mark.png";
import reichman from "@/assets/brand/reichman.png";
import reichmanLight from "@/assets/brand/reichman-light.png";

type Props = {
  /** "dark" is the navy wordmark for light backgrounds; "light" for dark ones. */
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
};

/** The official Future Builders lockup. */
export function Logo({ variant = "dark", className = "", priority }: Props) {
  return (
    <Image
      src={variant === "light" ? logoLight : logoDark}
      alt="Future Builders"
      priority={priority}
      className={`h-8 w-auto md:h-9 ${className}`}
      sizes="180px"
    />
  );
}

/** Reichman University's own logo, used alongside ours. */
export function ReichmanLogo({
  variant = "dark",
  className = "",
  alt,
}: {
  variant?: "dark" | "light";
  className?: string;
  alt: string;
}) {
  return (
    <Image
      src={variant === "light" ? reichmanLight : reichman}
      alt={alt}
      className={`w-auto ${className}`}
      sizes="120px"
    />
  );
}

/** The brain-and-circuit mark on its own, for tight spots. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden
      className={`h-8 w-8 ${className}`}
      sizes="48px"
    />
  );
}
