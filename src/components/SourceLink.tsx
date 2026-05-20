interface Props {
  name: string;
  url: string;
}

export function SourceLink({ name, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open source: ${name}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 underline-offset-2 hover:underline transition-colors"
    >
      <span>Source: {name}</span>
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </svg>
    </a>
  );
}
