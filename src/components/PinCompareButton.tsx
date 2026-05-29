interface Props {
  pinned: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
}

export function PinCompareButton({ pinned, onToggle, label, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={pinned}
      title={pinned ? "Remove from comparison" : "Pin to comparison"}
      className={
        pinned
          ? "inline-flex items-center gap-1 rounded-md border border-accent bg-accent px-2 py-1 text-[11px] font-medium text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          : "inline-flex items-center gap-1 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={pinned ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 17v5" />
        <path d="M5 17h14" />
        <path d="m7 2 10 0-1 7 3 4v4H5v-4l3-4Z" />
      </svg>
      {label ?? (pinned ? "Pinned" : "Compare")}
    </button>
  );
}
