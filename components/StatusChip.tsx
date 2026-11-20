import { STATUS_META, type SheetStatus, type StatusIcon } from "@/lib/types";

/** Small inline SVG icons (no icon library needed). */
function Icon({ name }: { name: StatusIcon }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...common} className="animate-spin">
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
  }
}

/** Status chip: icon + name, coloured from STATUS_META. Tooltip shows the status name. */
export default function StatusChip({ status }: { status: SheetStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      title={meta.label}
      aria-label={`Status: ${meta.label}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.chipClass}`}
    >
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}
