import type { InternationalInstrument } from "../types";

const OFFICIAL_VERIFIED = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
} as const;

const OFFICIAL_LIKELY = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
} as const;

export const INTERNATIONAL_INSTRUMENTS: InternationalInstrument[] = [
  // UN & UNESCO
  {
    id: "unesco-ethics-rec-2021",
    name: "UNESCO Recommendation on the Ethics of Artificial Intelligence",
    issuer: "UNESCO General Conference",
    organizationType: "UNESCO",
    date: "2021-11-23",
    instrumentType: "recommendation",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "The first global standard-setting instrument on AI ethics. Sets universal principles on human rights, dignity, fairness, transparency, accountability, privacy, oversight, and sustainability. Adopted by UNESCO's General Conference on 23 November 2021; broadly cited by national regulators and regional bodies.",
    sourceName: "UNESCO — UNESCO adopts first global standard on the ethics of AI",
    sourceUrl:
      "https://www.unesco.org/en/articles/unesco-adopts-first-global-standard-ethics-artificial-intelligence",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official UNESCO source confirms adoption on 23 November 2021. Avoid hard-coding a member-state count because UNESCO membership differs from the map's UN-country coverage.",
    powerScore: 5,
  },
  {
    id: "unga-78-265",
    name: 'UN General Assembly Resolution 78/265 "Safe, secure and trustworthy AI systems for sustainable development"',
    issuer: "UN General Assembly",
    organizationType: "UN",
    date: "2024-03-21",
    instrumentType: "recommendation",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "First broad UNGA resolution focused on safe, secure and trustworthy AI, reaffirming international law and framing AI through sustainable development and human rights. Adopted by consensus.",
    sourceName: "UN — A/RES/78/265",
    sourceUrl: "https://digitallibrary.un.org/record/4043244",
    ...OFFICIAL_VERIFIED,
    verificationNotes: "UN Digital Library record confirms A/RES/78/265 and date 2024-03-21.",
    powerScore: 4,
  },
  {
    id: "unga-78-311",
    name: 'UN General Assembly Resolution 78/311 "Enhancing international cooperation on capacity-building of AI"',
    issuer: "UN General Assembly",
    organizationType: "UN",
    date: "2024-07-01",
    instrumentType: "recommendation",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Focuses on AI capacity-building, digital divides, infrastructure, skills, and developing-country participation in AI governance.",
    sourceName: "UN — A/RES/78/311",
    sourceUrl: "https://digitallibrary.un.org/record/4055330",
    ...OFFICIAL_VERIFIED,
    verificationNotes: "UN Digital Library record confirms A/RES/78/311 and date 2024-07-01.",
    powerScore: 3,
  },
  {
    id: "global-digital-compact",
    name: "Global Digital Compact (Pact for the Future)",
    issuer: "UN Summit of the Future",
    organizationType: "UN",
    date: "2024-09-22",
    instrumentType: "compact",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "First UN comprehensive framework for digital cooperation and AI governance. Commits states to UN-level mechanisms for AI governance dialogue, risk mitigation, human oversight, and capacity-building. Negotiated by 193 UN member states.",
    sourceName: "UN — Global Digital Compact",
    sourceUrl: "https://www.un.org/global-digital-compact/en",
    ...OFFICIAL_LIKELY,
    verificationNotes:
      "Official UN Global Digital Compact page. Participation remains represented via UN membership coverage, not individual signature.",
    powerScore: 4,
  },
  {
    id: "unga-79-325",
    name: "UN General Assembly Resolution 79/325 — Independent International Scientific Panel on AI and Global Dialogue on AI Governance",
    issuer: "UN General Assembly",
    organizationType: "UN",
    date: "2025-08-26",
    instrumentType: "recommendation",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Formally establishes a 40-member independent scientific panel and a global dialogue process on AI governance. Most concrete institutional step the UN has taken toward standing AI governance machinery.",
    sourceName: "UN — A/RES/79/325",
    sourceUrl: "https://digitallibrary.un.org/record/4087699",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "UN sources confirm A/RES/79/325 was adopted on 2025-08-26.",
    powerScore: 4,
  },

  // OECD & G20
  {
    id: "oecd-ai-principles",
    name: "OECD Recommendation on AI / OECD AI Principles",
    issuer: "OECD Council",
    organizationType: "OECD",
    date: "2019-05-22",
    instrumentType: "principles",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Most influential intergovernmental AI policy instrument, setting principles on inclusive growth, human rights, transparency, robustness, and accountability. Revised in May 2024 to reflect generative AI. Adhered to by 38 OECD members + EU + 8 non-member adherents.",
    sourceName: "OECD Legal Instruments — OECD/LEGAL/0449",
    sourceUrl: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449",
    notes: "Revised on 3 May 2024.",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "OECD Legal Instruments record confirms adoption on 22 May 2019 and revisions including 3 May 2024.",
    powerScore: 5,
  },
  {
    id: "g20-ai-principles-2019",
    name: "G20 AI Principles",
    issuer: "G20 Trade and Digital Economy Ministers / G20 Leaders",
    organizationType: "G20",
    date: "2019-06-09",
    instrumentType: "principles",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "G20 AI-principles annex to the Ministerial Statement on Trade and Digital Economy. Effectively internationalized the OECD approach across major economies.",
    sourceName: "OECD.AI — G20 AI Principles annex",
    sourceUrl: "https://wp.oecd.ai/app/uploads/2021/06/G20-AI-Principles.pdf",
    ...OFFICIAL_LIKELY,
    verificationNotes:
      "OECD source confirms the G20 AI Principles drew from the OECD Recommendation; original G20 host should be checked in a later pass.",
    powerScore: 4,
  },

  // G7 Hiroshima
  {
    id: "g7-hiroshima-statement",
    name: "G7 Leaders' Statement on the Hiroshima AI Process",
    issuer: "G7 Leaders",
    organizationType: "G7",
    date: "2023-10-30",
    instrumentType: "summit_statement",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Political umbrella for the G7 frontier-AI governance package. Explicitly addresses advanced AI systems including foundation models and generative AI, and endorses the follow-on Guiding Principles and Code of Conduct.",
    sourceName: "Japan MOFA — Hiroshima AI Process Statement",
    sourceUrl: "https://www.mofa.go.jp/ecm/ec/page5e_000076.html",
    ...OFFICIAL_LIKELY,
    powerScore: 4,
  },
  {
    id: "hiroshima-guiding-principles",
    name: "Hiroshima Process International Guiding Principles for Organizations Developing Advanced AI Systems",
    issuer: "G7 Hiroshima AI Process",
    organizationType: "G7",
    date: "2023-10-30",
    instrumentType: "principles",
    bindingStatus: "voluntary",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "One of the clearest international texts aimed directly at frontier-model developers. Covers risk identification, red-teaming, incident reporting, cybersecurity, watermarking/authentication, public reporting, and post-deployment monitoring.",
    sourceName: "Japan MOFA — Guiding Principles",
    sourceUrl: "https://www.mofa.go.jp/files/100573471.pdf",
    ...OFFICIAL_LIKELY,
    powerScore: 4,
  },
  {
    id: "hiroshima-code-of-conduct",
    name: "Hiroshima Process International Code of Conduct for Organizations Developing Advanced AI Systems",
    issuer: "G7 Hiroshima AI Process",
    organizationType: "G7",
    date: "2023-10-30",
    instrumentType: "code_of_conduct",
    bindingStatus: "voluntary",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Translates the Hiroshima principles into concrete organizational actions on governance, safety testing, incident handling, transparency, model-weight security, content provenance, and information-sharing.",
    sourceName: "Japan MOFA — Code of Conduct",
    sourceUrl: "https://www.mofa.go.jp/files/100573473.pdf",
    ...OFFICIAL_LIKELY,
    powerScore: 4,
  },
  {
    id: "hiroshima-reporting-framework",
    name: "Hiroshima AI Process Reporting Framework",
    issuer: "OECD (on behalf of the G7)",
    organizationType: "G7",
    date: "2025-02-07",
    instrumentType: "reporting_framework",
    bindingStatus: "voluntary",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Operationalizes the Hiroshima Code by giving companies a structured way to disclose governance, risk-management, incident handling, and safety practices for advanced AI systems.",
    sourceName: "OECD.AI — HAIP framework",
    sourceUrl:
      "https://oecd.ai/en/wonk/hiroshima-ai-process-reporting-framework",
    ...OFFICIAL_LIKELY,
    powerScore: 4,
  },

  // EU & Council of Europe
  {
    id: "eu-ai-act",
    name: "EU AI Act (Regulation (EU) 2024/1689)",
    issuer: "European Parliament and Council of the EU",
    organizationType: "EU",
    date: "2024-08-01",
    instrumentType: "regulation",
    bindingStatus: "binding_regulation",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "First binding, risk-based AI law including provisions on general-purpose AI models. In force from 1 August 2024 with a phased implementation timeline. Has extraterritorial commercial effect.",
    sourceName: "EUR-Lex — Regulation 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    notes:
      "Applies to all 27 EU member states via 'applicable_via_eu' participation type, plus the EU itself as the regulating authority.",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "European Commission and EUR-Lex sources confirm Regulation (EU) 2024/1689 entered into force on 2024-08-01 with phased application.",
    powerScore: 5,
  },
  {
    id: "coe-ai-convention",
    name: "Council of Europe Framework Convention on AI and Human Rights, Democracy and the Rule of Law",
    issuer: "Council of Europe",
    organizationType: "Council of Europe",
    date: "2024-05-17",
    instrumentType: "treaty",
    bindingStatus: "binding_on_parties",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "First international legally binding treaty on AI. Requires that the AI lifecycle be compatible with human rights, democracy and the rule of law; mandates risk and impact assessments, remedies, transparency, and a follow-up mechanism. Adopted 17 May 2024; opened for signature 5 September 2024. As of 19 May 2026, not yet in force (needs five ratifications including at least three Council of Europe member states). The EU ratified on 15 May 2026.",
    sourceName: "Council of Europe — Framework Convention / Treaty Office",
    sourceUrl:
      "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Council of Europe Treaty Office/news confirms EU ratification on 2026-05-15. Treaty Office summaries confirm entry into force requires five ratifications including at least three Council of Europe member states.",
    powerScore: 5,
  },
  {
    id: "council-eu-ai-conclusions-2024",
    name: "Council of the EU conclusions on strengthening the EU's ambitions in AI",
    issuer: "Council of the European Union",
    organizationType: "EU",
    date: "2024-11-05",
    instrumentType: "ministerial_statement",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Council conclusions calling for stronger EU leadership in trustworthy and human-centric AI, international standards work, talent, innovation, and global governance outreach. Soft law / political guidance.",
    sourceName: "Council of the EU — conclusions",
    sourceUrl:
      "https://www.consilium.europa.eu/en/press/press-releases/2024/11/05/artificial-intelligence-ai-council-approves-conclusions-to-strengthen-eu-s-ambitions/",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Council press release confirms approval of conclusions on 2024-11-05; this is political guidance, not binding law.",
    powerScore: 2,
  },

  // ISO/IEC
  {
    id: "iso-iec-42001-2023",
    name: "ISO/IEC 42001:2023 — Artificial intelligence — Management system",
    issuer: "ISO/IEC JTC 1/SC 42",
    organizationType: "ISO/IEC",
    date: "2023-12-01",
    instrumentType: "standard",
    bindingStatus: "standard",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "World's first AI management-system standard. Establishes requirements for organizations to govern AI across the lifecycle. Widely used in audits, procurement, and enterprise assurance.",
    sourceName: "ISO — ISO/IEC 42001:2023",
    sourceUrl: "https://www.iso.org/standard/81230.html",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official ISO page confirms ISO/IEC 42001:2023, publication 2023-12, and management-system scope.",
    powerScore: 4,
  },
  {
    id: "iso-iec-23894-2023",
    name: "ISO/IEC 23894:2023 — AI — Guidance on risk management",
    issuer: "ISO/IEC JTC 1/SC 42",
    organizationType: "ISO/IEC",
    date: "2023-02-01",
    instrumentType: "standard",
    bindingStatus: "standard",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Voluntary international standard giving organizations a structured way to manage AI-specific risks across development, deployment, and use.",
    sourceName: "ISO — ISO/IEC 23894:2023",
    sourceUrl: "https://www.iso.org/standard/77304.html",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official ISO page confirms ISO/IEC 23894:2023 and publication 2023-02.",
    powerScore: 4,
  },
  {
    id: "iso-iec-38507-2022",
    name: "ISO/IEC 38507:2022 — Governance implications of the use of AI by organizations",
    issuer: "ISO/IEC JTC 1/SC 40",
    organizationType: "ISO/IEC",
    date: "2022-04-01",
    instrumentType: "standard",
    bindingStatus: "standard",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Board-level governance standard explaining the governance implications of AI use by organizations.",
    sourceName: "ISO — ISO/IEC 38507:2022",
    sourceUrl: "https://www.iso.org/standard/56641.html",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "iso-iec-22989-2022",
    name: "ISO/IEC 22989:2022 — AI concepts and terminology",
    issuer: "ISO/IEC JTC 1/SC 42",
    organizationType: "ISO/IEC",
    date: "2022-07-01",
    instrumentType: "standard",
    bindingStatus: "standard",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Foundational terminology standard for AI. Shapes interoperability of subsequent standards, procurement language, and policy drafting.",
    sourceName: "ISO — ISO/IEC 22989:2022",
    sourceUrl: "https://www.iso.org/standard/74296.html",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official ISO page confirms ISO/IEC 22989:2022 and publication 2022-07.",
    powerScore: 3,
  },
  {
    id: "iso-iec-42005-2025",
    name: "ISO/IEC 42005:2025 — AI system impact assessment",
    issuer: "ISO/IEC JTC 1/SC 42",
    organizationType: "ISO/IEC",
    date: "2025-05-28",
    instrumentType: "standard",
    bindingStatus: "standard",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Standard focused on identifying and documenting AI system impacts on individuals, groups, and society.",
    sourceName: "ISO — ISO/IEC 42005:2025",
    sourceUrl: "https://www.iso.org/standard/44545.html",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official ISO page confirms ISO/IEC 42005:2025 and International Standard publication on 2025-05-28.",
    powerScore: 3,
  },

  // AI Safety Summit process
  {
    id: "bletchley-declaration",
    name: "Bletchley Declaration",
    issuer: "AI Safety Summit (UK)",
    organizationType: "AI Safety Summit",
    date: "2023-11-01",
    instrumentType: "declaration",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "First major international declaration centred on frontier-AI safety risks. Legitimised frontier-AI risk as an object of international coordination and triggered the State of the Science work and AI Safety Institute track. New Zealand later joined the participants.",
    sourceName: "GOV.UK — Bletchley Declaration",
    sourceUrl:
      "https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "GOV.UK page lists represented countries and states that New Zealand joined the commitment on 2024-10-23.",
    powerScore: 4,
  },
  {
    id: "seoul-declaration",
    name: "Seoul Declaration for safe, innovative and inclusive AI",
    issuer: "AI Seoul Summit",
    organizationType: "AI Safety Summit",
    date: "2024-05-21",
    instrumentType: "declaration",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Continues the Bletchley process and broadens it beyond safety to include innovation and inclusivity. Links frontier-model safety to democratic values, privacy, human rights, and bridging AI divides.",
    sourceName: "GOV.UK — Seoul Declaration",
    sourceUrl:
      "https://www.gov.uk/government/publications/seoul-declaration-for-safe-innovative-and-inclusive-ai-ai-seoul-summit-2024",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "GOV.UK leaders-session page confirms participating governments for the Seoul Declaration.",
    powerScore: 4,
  },
  {
    id: "seoul-statement-of-intent",
    name: "Seoul Statement of Intent toward International Cooperation on AI Safety Science",
    issuer: "AI Seoul Summit",
    organizationType: "AI Safety Summit",
    date: "2024-05-21",
    instrumentType: "summit_statement",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Annex to the Seoul Declaration that formalises cooperation on AI safety science and acknowledges the role of state-supported AI Safety Institutes.",
    sourceName: "GOV.UK — Seoul Statement of Intent",
    sourceUrl:
      "https://www.gov.uk/government/publications/seoul-declaration-for-safe-innovative-and-inclusive-ai-ai-seoul-summit-2024",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "GOV.UK page publishes the statement of intent as part of the AI Seoul Summit 2024 materials.",
    powerScore: 3,
  },
  {
    id: "seoul-ministerial-statement",
    name: "Seoul Ministerial Statement for advancing AI safety, innovation and inclusivity",
    issuer: "AI Seoul Summit (ministerial)",
    organizationType: "AI Safety Summit",
    date: "2024-05-22",
    instrumentType: "ministerial_statement",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "More operational than the leaders' Seoul Declaration. Translates the summit vision into practical steps on governance, collaboration, safety, and sustainable development. Broader geographic participation.",
    sourceName: "GOV.UK — Seoul Ministerial Statement",
    sourceUrl:
      "https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-innovation-and-inclusivity-ai-seoul-summit-2024",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "GOV.UK ministerial-statement page confirms signatories and date 2024-05-22.",
    powerScore: 4,
  },
  {
    id: "paris-statement-2025",
    name: "Statement on Inclusive and Sustainable AI for People and the Planet",
    issuer: "AI Action Summit (Paris)",
    organizationType: "AI Safety Summit",
    date: "2025-02-11",
    instrumentType: "declaration",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Adopted at the Paris AI Action Summit. Shifts focus from pure safety to public-interest AI — access, openness, sustainability, labour, and environment. The official signatory list includes 63 countries plus the African Union Commission and the EU; the United States and United Kingdom do not appear on that list.",
    sourceName: "Élysée — Statement on Inclusive and Sustainable AI",
    sourceUrl:
      "https://www.elysee.fr/en/emmanuel-macron/2025/02/11/statement-on-inclusive-and-sustainable-artificial-intelligence-for-people-and-the-planet",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "Official Élysée page provides the signatory list. The app maps the EU but not the African Union Commission as a separate country row.",
    powerScore: 4,
  },
  {
    id: "intl-network-aisi",
    name: "International Network of AI Safety Institutes (now International Network for Advanced AI Measurement, Evaluation and Science)",
    issuer: "Governments participating in the Seoul process",
    organizationType: "AI Safety Summit",
    date: "2024-05-21",
    instrumentType: "network",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Intergovernmental network for AI safety science, evaluation methods, and joint research. Launched by 10 countries plus the EU; refocused and renamed on 9 December 2025.",
    sourceName: "NIST — Mission Statement of the International Network of AISIs",
    sourceUrl:
      "https://www.nist.gov/system/files/documents/2024/11/20/Mission%20Statement%20-%20International%20Network%20of%20AISIs.pdf",
    ...OFFICIAL_VERIFIED,
    verificationNotes:
      "GOV.UK source confirms launch members; NIST source confirms the mission statement. Participation rows use the GOV.UK launch-member source.",
    powerScore: 3,
  },

  // Regional
  {
    id: "asean-ai-guide-2024",
    name: "ASEAN Guide on AI Governance and Ethics",
    issuer: "ASEAN Secretariat",
    organizationType: "ASEAN",
    date: "2024-02-02",
    instrumentType: "guidance",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Regional, interoperability-oriented governance toolkit for trustworthy commercial AI in non-military settings. Risk-based governance, human oversight, explainability, incident management, and internal governance structures.",
    sourceName: "ASEAN — Guide on AI Governance and Ethics",
    sourceUrl: "https://asean.org/book/asean-guide-on-ai-governance-and-ethics/",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "asean-genai-guide-2025",
    name: "Expanded ASEAN Guide on AI Governance and Ethics — Generative AI",
    issuer: "ASEAN Secretariat",
    organizationType: "ASEAN",
    date: "2025-01-01",
    instrumentType: "guidance",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Extends the 2024 ASEAN guide to generative AI. Covers synthetic content, model risk, misuse, transparency, copyright, bias, privacy, and operational governance.",
    sourceName: "ASEAN — Expanded Guide on GenAI",
    sourceUrl:
      "https://asean.org/book/expanded-asean-guide-on-ai-governance-and-ethics-generative-ai/",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "au-ai-strategy-2024",
    name: "African Union Continental AI Strategy",
    issuer: "African Union",
    organizationType: "African Union",
    date: "2024-07-19",
    instrumentType: "strategy",
    bindingStatus: "political_guidance",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Continental, development-focused AI strategy emphasising digital sovereignty, infrastructure, data, skills, innovation ecosystems, inclusive growth, and African representation in global AI governance.",
    sourceName: "African Union — Continental AI Strategy",
    sourceUrl:
      "https://au.int/en/documents/20240809/continental-artificial-intelligence-strategy",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "apec-digital-ai-ministerial-2025",
    name: "APEC Digital and AI Ministerial Statement",
    issuer: "APEC Digital and AI Ministers",
    organizationType: "APEC",
    date: "2025-01-01",
    instrumentType: "ministerial_statement",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: false,
    summary:
      "Links AI governance to digital trade, interoperability, standards, capability-building, and safe AI use across the Asia-Pacific.",
    sourceName: "APEC — Digital and AI Ministerial Statement",
    sourceUrl:
      "https://www.apec.org/meeting-papers/sectoral-ministerial-meetings/telecommunicationsandinformation/2025-apec-digital-and-ai-ministerial-statement",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "apec-ai-initiative-2026-2030",
    name: "APEC AI Initiative 2026–2030",
    issuer: "APEC Economic Leaders",
    organizationType: "APEC",
    date: "2025-11-01",
    instrumentType: "strategy",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Five-year regional framework on AI innovation, governance, talent, interoperability, and diffusion. Connects AI governance to infrastructure and economic competitiveness.",
    sourceName: "APEC — AI Initiative 2026–2030",
    sourceUrl:
      "https://www.apec.org/meeting-papers/leaders-declarations/2025/2025-apec-leaders--gyeongju-declaration/apec-artificial-intelligence-%28ai%29-initiative-%282026-2030%29",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },

  // Bilateral AI-specific
  {
    id: "eu-us-trustworthy-ai-roadmap",
    name: "EU–U.S. Joint Roadmap on Evaluation and Measurement Tools for Trustworthy AI and Risk Management",
    issuer: "EU–U.S. Trade and Technology Council",
    organizationType: "Bilateral",
    date: "2022-12-05",
    instrumentType: "roadmap",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Bilateral roadmap to align EU and U.S. work on AI evaluation and measurement tools, terminology, taxonomies, and risk management approaches.",
    sourceName: "European Commission — TTC Joint AI Roadmap",
    sourceUrl:
      "https://ec.europa.eu/commission/presscorner/detail/en/IP_22_7468",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },
  {
    id: "uk-us-aisi-mou",
    name: "UK–U.S. Memorandum of Understanding on AI safety",
    issuer: "UK Department for Science, Innovation and Technology / U.S. Department of Commerce",
    organizationType: "Bilateral",
    date: "2024-04-01",
    instrumentType: "summit_statement",
    bindingStatus: "non_binding",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Bilateral MoU between the UK and U.S. AI Safety Institutes (AISI / CAISI) on cooperation, joint evaluations, methods, personnel exchanges, and information-sharing.",
    sourceName: "GOV.UK — UK–US AI Safety MoU",
    sourceUrl:
      "https://www.gov.uk/government/publications/memorandum-of-understanding-between-the-government-of-the-united-states-of-america-and-the-government-of-the-united-kingdom-of-great-britain-and-northern",
    ...OFFICIAL_LIKELY,
    powerScore: 3,
  },

  // Non-state but AI-specific frontier governance
  {
    id: "frontier-model-forum",
    name: "Frontier Model Forum",
    issuer: "Founding companies: Anthropic, Google, Microsoft, OpenAI",
    organizationType: "Other",
    date: "2023-07-26",
    instrumentType: "network",
    bindingStatus: "voluntary",
    aiSpecific: true,
    frontierAIRelevant: true,
    summary:
      "Industry forum coordinating frontier AI safety, security, thresholds, evaluations, and information-sharing among leading frontier-model companies. Not an intergovernmental instrument — included here to make the corporate-governance layer visible.",
    sourceName: "Frontier Model Forum — Membership",
    sourceUrl: "https://www.frontiermodelforum.org/membership/",
    sourceKind: "official",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "Issuer-controlled non-state source. Treat as industry-governance context, not intergovernmental law.",
    notes:
      "Non-state / industry governance. No per-country participation rows are included on the map because the Forum is not signed by states.",
    powerScore: 3,
  },
];

export const INSTRUMENT_BY_ID: Record<string, InternationalInstrument> =
  INTERNATIONAL_INSTRUMENTS.reduce((acc, inst) => {
    acc[inst.id] = inst;
    return acc;
  }, {} as Record<string, InternationalInstrument>);
