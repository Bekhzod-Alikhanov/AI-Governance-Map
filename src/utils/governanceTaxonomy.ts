import type {
  InternationalInstrument,
  NationalAIRegulation,
  ParticipationType,
  SourceKind,
  VerificationMetadata,
} from "../types";
import sourceHosts from "../data/sourceHosts.json";
import { RELEASE_METADATA } from "../data/releaseMetadata";

/**
 * Compatibility alias for the release-level status date. `lastVerified`
 * remains record-specific and must not be inferred from this release date.
 * Prefer `RELEASE_METADATA.statusAsOf` in new reader-facing code.
 */
export const DATA_SNAPSHOT_DATE = RELEASE_METADATA.statusAsOf;

export type NationalEntryClass =
  | "binding_ai_law"
  | "unverified_binding_claim"
  | "proposed_ai_law"
  | "guidance_or_framework"
  | "voluntary_standard_or_code"
  | "institutional_framework"
  | "mixed_or_phased";

export type InstrumentEffectClass =
  | "binding_treaty_or_regulation"
  | "soft_law_or_guidance"
  | "voluntary_framework"
  | "technical_standard";

export type ParticipationDirectness = "direct" | "indirect" | "membership" | "unknown";

export interface Classification {
  className: string;
  label: string;
  caveat: string;
}

export interface SourceAssessment {
  sourceKind: SourceKind;
  host: string | null;
  issues: string[];
}

const OFFICIAL_HOST_SUFFIXES = sourceHosts.officialHostSuffixes;
const OFFICIAL_HOSTS = new Set(sourceHosts.officialHosts);
const SECONDARY_HOSTS = new Set(sourceHosts.secondaryHosts);

export function classifyNationalEntry(entry: NationalAIRegulation): Classification & {
  className: NationalEntryClass;
} {
  if (entry.bindingStatus === "binding" && !isConfirmedBindingNationalRegulation(entry)) {
    return {
      className: "unverified_binding_claim",
      label: "Unverified binding claim",
      caveat:
        "This record is retained for review but is not counted as confirmed binding AI law until direct official verification is available.",
    };
  }
  if (entry.bindingStatus === "binding") {
    return {
      className: "binding_ai_law",
      label: "Binding AI-specific law applies",
      caveat:
        "Binding status still depends on jurisdictional scope, application dates, and implementation phase.",
    };
  }
  if (entry.bindingStatus === "proposed" || entry.type === "proposed_law") {
    return {
      className: "proposed_ai_law",
      label: "Proposed AI law",
      caveat: "Proposal is not in force and should not be counted as binding law.",
    };
  }
  if (entry.bindingStatus === "mixed") {
    return {
      className: "mixed_or_phased",
      label: "Mixed or phased legal effect",
      caveat: "The entry combines binding and non-binding elements or has staged application.",
    };
  }
  if (entry.type === "standard" || entry.type === "code" || entry.bindingStatus === "voluntary") {
    return {
      className: "voluntary_standard_or_code",
      label: "Voluntary standard or code",
      caveat: "Voluntary instruments are not binding law unless separately required or adopted.",
    };
  }
  if (entry.type === "institutional_framework") {
    return {
      className: "institutional_framework",
      label: "Institutional framework",
      caveat: "An institution, office, or governance body is not itself an AI law.",
    };
  }
  return {
    className: "guidance_or_framework",
    label: "Guidance, strategy, or framework",
    caveat: "Non-binding policy instruments should not be treated as enforceable AI law.",
  };
}

export function isConfirmedBindingNationalRegulation(entry: NationalAIRegulation): boolean {
  return (
    entry.bindingStatus === "binding" &&
    entry.verificationStatus !== "uncertain" &&
    entry.verificationStatus !== "needs_external_check" &&
    entry.confidence !== "low"
  );
}

export function classifyInternationalInstrument(instrument: InternationalInstrument): Classification & {
  className: InstrumentEffectClass;
} {
  if (
    instrument.bindingStatus === "binding_on_parties" ||
    instrument.bindingStatus === "binding_regulation"
  ) {
    return {
      className: "binding_treaty_or_regulation",
      label: "Binding treaty or regulation",
      caveat:
        "Binding effect can depend on ratification, entry into force, territorial scope, and application dates.",
    };
  }
  if (instrument.bindingStatus === "standard") {
    return {
      className: "technical_standard",
      label: "Technical standard",
      caveat: "A standard is not national law unless separately adopted, incorporated, or required.",
    };
  }
  if (instrument.bindingStatus === "voluntary") {
    return {
      className: "voluntary_framework",
      label: "Voluntary framework",
      caveat: "Voluntary frameworks do not create binding legal duties by themselves.",
    };
  }
  return {
    className: "soft_law_or_guidance",
    label: "Soft law or political guidance",
    caveat: "Soft-law instruments should not be presented as binding legal obligations.",
  };
}

export function classifyParticipation(type: ParticipationType): {
  directness: ParticipationDirectness;
  label: string;
  caveat: string;
  impliesBindingByItself: boolean;
} {
  switch (type) {
    case "ratified":
      return {
        directness: "direct",
        label: "Ratified",
        caveat: "Ratification is a stronger legal signal than signature; entry-into-force conditions still matter.",
        impliesBindingByItself: true,
      };
    case "signed":
      return {
        directness: "direct",
        label: "Signed",
        caveat: "Signature is not ratification and should not be shown as binding by itself.",
        impliesBindingByItself: false,
      };
    case "applicable_via_eu":
      return {
        directness: "indirect",
        label: "Applicable via EU membership",
        caveat:
          "EU applicability is not the same as the member state enacting a separate national AI law.",
        impliesBindingByItself: true,
      };
    case "covered_by_membership":
      return {
        directness: "membership",
        label: "Membership coverage",
        caveat:
          "Coverage follows membership in the issuing organization, not direct signature or explicit endorsement.",
        impliesBindingByItself: false,
      };
    case "endorsed":
    case "adopted":
    case "adherent":
    case "member":
    case "participant":
      return {
        directness: type === "member" ? "membership" : "direct",
        label: type.replace(/_/g, " "),
        caveat: "This participation signal should be read with the instrument's legal-effect classification.",
        impliesBindingByItself: false,
      };
    case "unknown":
      return {
        directness: "unknown",
        label: "Unknown",
        caveat: "Participation status is not verified in this dataset.",
        impliesBindingByItself: false,
      };
  }
}

/**
 * True when a record carries *any* verification field. This is a weak signal: a
 * record declaring only `sourceKind: "official"` satisfies it while telling the
 * reader nothing about whether anyone checked the claim. Kept for the existing
 * "has some metadata" report; use `hasCompleteVerificationMetadata` to ask
 * whether a record is actually accounted for.
 */
export function hasVerificationMetadata(item: VerificationMetadata): boolean {
  return Boolean(
    item.sourceKind ||
      item.verificationStatus ||
      item.confidence ||
      item.lastVerified ||
      item.verificationNotes
  );
}

/**
 * True when a record says who the source is, what its verification state is, and
 * when that was last established. Anything less cannot support a claim about
 * currency or reliability.
 */
export function hasCompleteVerificationMetadata(item: VerificationMetadata): boolean {
  return Boolean(item.sourceKind && item.verificationStatus && item.lastVerified);
}

export function assessSourceUrl(sourceUrl: string | undefined): SourceAssessment {
  const issues: string[] = [];
  if (!sourceUrl) return { sourceKind: "unknown", host: null, issues: ["missing source URL"] };

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return { sourceKind: "unknown", host: null, issues: ["invalid source URL"] };
  }

  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") issues.push("source URL is not HTTPS");
  if (SECONDARY_HOSTS.has(host)) {
    return { sourceKind: "secondary", host, issues };
  }
  if (OFFICIAL_HOSTS.has(host) || OFFICIAL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return { sourceKind: "official", host, issues };
  }
  return { sourceKind: "unknown", host, issues: [...issues, "source host is not classified"] };
}
