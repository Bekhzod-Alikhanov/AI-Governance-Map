import { useEffect, useState } from "react";

interface Props {
  text: string;
  label?: string;
  copiedLabel?: string;
  title?: string;
}

export function CopyTextButton({
  text,
  label = "Copy citation",
  copiedLabel = "Copied",
  title,
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title ?? label}
      className="inline-flex items-center gap-1 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
    >
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      {copied ? copiedLabel : label}
    </button>
  );
}
