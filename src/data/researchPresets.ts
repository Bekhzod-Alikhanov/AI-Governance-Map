import type { ResearchPreset } from "../types";

export const RESEARCH_PRESETS: ResearchPreset[] = [
  {
    id: "binding-ai-laws",
    title: "Which countries have binding AI-specific rules?",
    description:
      "Shows countries where a binding AI-specific law or regulation is currently recorded. EU applicability is still labelled separately from national enactment.",
    lens: "geography",
    filterPatch: {
      hasBindingNationalLaw: "yes",
      frontierAIRelevant: "any",
    },
  },
  {
    id: "proposed-ai-laws",
    title: "Where are AI laws still proposed?",
    description:
      "Opens the timeline lane for proposed national AI laws so users can separate draft bills from in-force law.",
    lens: "timeline",
    timelineLane: "national_proposed",
    filterPatch: {
      hasAnyAIRule: "yes",
      hasBindingNationalLaw: "no",
    },
  },
  {
    id: "guidance-voluntary-only",
    title: "Which countries mostly have guidance or voluntary frameworks?",
    description:
      "Filters to countries with national AI entries but without binding national AI law, and emphasizes voluntary international effects.",
    lens: "layer",
    filterPatch: {
      hasAnyAIRule: "yes",
      hasBindingNationalLaw: "no",
      selectedBindingStatuses: ["voluntary", "non_binding", "political_guidance", "standard"],
    },
  },
  {
    id: "coe-signature-ratification",
    title: "Who signed or ratified the Council of Europe AI Convention?",
    description:
      "Compares signature and ratification for CETS No. 225. Signature alone is not ratification or entry into force.",
    lens: "geography",
    filterPatch: {
      selectedInstrumentIds: ["coe-ai-convention"],
      selectedParticipationTypes: ["signed", "ratified"],
      instrumentMatchMode: "OR",
    },
  },
  {
    id: "summit-participation",
    title: "Who joined the Bletchley, Seoul, and Paris summit outputs?",
    description:
      "Shows state participation in the main AI safety/action summit declarations and statements.",
    lens: "geography",
    filterPatch: {
      selectedInstrumentIds: [
        "bletchley-declaration",
        "seoul-declaration",
        "seoul-ministerial-statement",
        "paris-statement-2025",
      ],
      selectedParticipationTypes: ["endorsed"],
      selectedOrganizations: ["AI Safety Summit"],
      instrumentMatchMode: "OR",
    },
  },
  {
    id: "frontier-lab-exposure",
    title: "Which frontier labs are exposed to which governance layers?",
    description:
      "Uses the network lens to show how labs connect to national rules, international instruments, and infrastructure chokepoints.",
    lens: "network",
    selectedNetworkNodeId: "openai",
    networkPreset: "labs-laws",
    filterPatch: {
      frontierAIRelevant: "yes",
    },
  },
  {
    id: "eu-applicability-vs-national",
    title: "Where does the EU AI Act apply, and where is there national enactment?",
    description:
      "Highlights EU AI Act applicability via EU membership. This is not the same as a member state enacting a separate national AI law.",
    lens: "layer",
    selectedIso3: "EUU",
    filterPatch: {
      selectedInstrumentIds: ["eu-ai-act"],
      selectedParticipationTypes: ["applicable_via_eu", "member"],
      selectedBindingStatuses: ["binding_regulation"],
      instrumentMatchMode: "OR",
    },
  },
  {
    id: "standards-soft-law",
    title: "Which instruments are standards, guidance, or soft law?",
    description:
      "Focuses on standards and non-binding governance so users do not mistake soft-law instruments for binding obligations.",
    lens: "table",
    networkPreset: "standards-layer",
    timelineLane: "standards",
    filterPatch: {
      selectedBindingStatuses: ["standard", "voluntary", "non_binding", "political_guidance"],
      selectedOrganizations: ["ISO/IEC", "OECD", "G7", "AI Safety Summit", "Other"],
    },
  },
];

export const PRESET_BY_ID: Record<string, ResearchPreset> = RESEARCH_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<string, ResearchPreset>
);
