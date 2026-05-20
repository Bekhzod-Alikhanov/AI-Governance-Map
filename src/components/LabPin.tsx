import { Marker } from "react-simple-maps";
import clsx from "clsx";
import type { FrontierLab } from "../types";
import { activateOnKeyboard } from "../utils/keyboardActivation";

// HQ city coordinates [longitude, latitude] for each frontier lab.
// US lab cluster gets per-lab city coords; multi-lab cities are jittered slightly.
export const LAB_COORDINATES: Record<string, [number, number]> = {
  openai: [-122.42, 37.78],          // San Francisco
  anthropic: [-122.41, 37.77],       // San Francisco
  "google-deepmind": [-122.08, 37.42], // Mountain View
  meta: [-122.15, 37.48],            // Menlo Park
  microsoft: [-122.13, 47.66],       // Redmond
  amazon: [-122.33, 47.60],          // Seattle
  xai: [-122.40, 37.79],             // San Francisco
  mistral: [2.35, 48.86],            // Paris
  cohere: [-79.39, 43.65],           // Toronto
  deepseek: [120.15, 30.27],         // Hangzhou
  baidu: [116.40, 39.91],            // Beijing
  alibaba: [120.16, 30.29],          // Hangzhou
  tencent: [114.06, 22.54],          // Shenzhen
};

const LAB_PIN_OFFSETS: Record<string, [number, number]> = {
  openai: [-20, -10],
  anthropic: [0, 16],
  xai: [20, -12],
  meta: [18, 12],
  "google-deepmind": [-12, 18],
  deepseek: [-16, 10],
  alibaba: [16, -10],
};

interface Props {
  lab: FrontierLab;
  selected: boolean;
  dimmed?: boolean;
  onClick: (id: string) => void;
  onHover?: (lab: FrontierLab | null, e?: React.MouseEvent) => void;
}

export function LabPin({ lab, selected, dimmed, onClick, onHover }: Props) {
  const coords = LAB_COORDINATES[lab.id];
  if (!coords) return null;

  // Size by power score: 3 -> r=5, 4 -> r=7, 5 -> r=9
  const r = 3 + lab.powerScore * 1.2;
  const [dx, dy] = LAB_PIN_OFFSETS[lab.id] ?? [0, 0];

  return (
    <Marker coordinates={coords}>
      <g
        transform={`translate(${dx} ${dy})`}
        style={{ cursor: "pointer", opacity: dimmed ? 0.35 : 1, transition: "opacity 120ms" }}
        onMouseEnter={(e) => onHover?.(lab, e)}
        onMouseMove={(e) => onHover?.(lab, e)}
        onMouseLeave={() => onHover?.(null)}
      >
        <circle
          r={r + 7}
          fill="transparent"
          onClick={() => onClick(lab.id)}
          onKeyDown={(event) => activateOnKeyboard(event, () => onClick(lab.id))}
          role="button"
          tabIndex={0}
          aria-label={`${lab.name} headquarters in ${lab.hqCountryName} - open lab details`}
        />
        <circle
          r={r + 3}
          className="pointer-events-none"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeOpacity={selected ? 1 : 0}
          strokeWidth={1.5}
        />
        <circle
          r={r}
          className={clsx("pointer-events-none transition-colors")}
          fill={selected ? "#0F172A" : lab.isFMFMember ? "#B45309" : "#1E40AF"}
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />
      </g>
    </Marker>
  );
}
