import type { GovernanceDomainId, ImplementationStatus, ObligationCategory, ObligationLegalEffect } from "../types";

export type CountryMapSourceConfidence = "none" | "high" | "medium" | "low";

export interface CountryMapSummary {
  nationalRuleCount: number;
  nationalRuleNames: string[];
  confirmedBindingNationalRuleCount: number;
  bindingRuleNames: string[];
  proposedNationalRuleCount: number;
  proposedRuleNames: string[];
  internationalParticipationCount: number;
  hqLabCount: number;
  hqLabNames: string[];
  hasAnyAIRule: boolean;
  hasFrontierAIRelevant: boolean;
  obligationSignals: Array<{
    category: ObligationCategory;
    legalEffect: ObligationLegalEffect;
    domains: GovernanceDomainId[];
  }>;
  implementationStatuses: ImplementationStatus[];
  hasNextImplementationDeadline: boolean;
  hasInForceImplementation: boolean;
  sourceConfidence: CountryMapSourceConfidence;
}

export const EMPTY_COUNTRY_MAP_SUMMARY: CountryMapSummary = {
  nationalRuleCount: 0,
  nationalRuleNames: [],
  confirmedBindingNationalRuleCount: 0,
  bindingRuleNames: [],
  proposedNationalRuleCount: 0,
  proposedRuleNames: [],
  internationalParticipationCount: 0,
  hqLabCount: 0,
  hqLabNames: [],
  hasAnyAIRule: false,
  hasFrontierAIRelevant: false,
  obligationSignals: [],
  implementationStatuses: [],
  hasNextImplementationDeadline: false,
  hasInForceImplementation: false,
  sourceConfidence: "none",
};

export const COUNTRY_MAP_SUMMARIES: Record<string, Partial<CountryMapSummary>> = {
  "ALB": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "AND": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "ARM": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "AUT": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "AIM AT 2030 — Artificial Intelligence Mission Austria 2030"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "BLR": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BEL": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "BIH": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "BGR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "HRV": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "CYP": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "CZE": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "DNK": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "EST": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "FIN": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Finland's Artificial Intelligence Programme"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "FRA": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "France — AI for Humanity Strategy"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 20,
    "hqLabCount": 1,
    "hqLabNames": [
      "Mistral"
    ],
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "implementing_rules_pending",
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "GEO": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "DEU": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Germany National AI Strategy (Strategie Künstliche Intelligenz)"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 20,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed",
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "GRC": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "HUN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "ISL": {
    "internationalParticipationCount": 8,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "IRL": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 11,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "ITA": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "EU AI Act",
      "Law No. 132/2025 — Provisions and delegations to the Government on artificial intelligence",
      "Italian Strategy for Artificial Intelligence 2024–2026"
    ],
    "confirmedBindingNationalRuleCount": 2,
    "bindingRuleNames": [
      "EU AI Act",
      "Law No. 132/2025 — Provisions and delegations to the Government on artificial intelligence"
    ],
    "internationalParticipationCount": 20,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "regulator_appointed",
      "phased_application",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "LVA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "LIE": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "LTU": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "LUX": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "MLT": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "MDA": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "MCO": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MNE": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "NLD": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Netherlands Strategic Action Plan for AI"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 12,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "MKD": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "NOR": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "Draft Norwegian AI Act (EU AI Act implementation)",
      "Norway National Strategy for Artificial Intelligence"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Draft Norwegian AI Act (EU AI Act implementation)"
    ],
    "internationalParticipationCount": 8,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed",
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "POL": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "EU AI Act",
      "Draft Act on AI Systems (Poland)",
      "Poland — Policy for AI Development from 2020"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Draft Act on AI Systems (Poland)"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "PRT": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "ROU": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "EU AI Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "RUS": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "Federal Law No. 123-FZ on the Experimental Legal Regime for AI in Moscow",
      "National Strategy for the Development of AI in Russia through 2030"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "Federal Law No. 123-FZ on the Experimental Legal Regime for AI in Moscow"
    ],
    "internationalParticipationCount": 8,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SMR": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "SRB": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SVK": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Slovakia National AI Strategy / Action Plan"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "SVN": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Law on the Implementation of the EU AI Act (Slovenia)"
    ],
    "confirmedBindingNationalRuleCount": 2,
    "bindingRuleNames": [
      "EU AI Act",
      "Law on the Implementation of the EU AI Act (Slovenia)"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "ESP": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "EU AI Act",
      "Draft Spanish AI Law (EU AI Act implementation)",
      "Spanish National AI Strategy (ENIA)"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Draft Spanish AI Law (EU AI Act implementation)"
    ],
    "internationalParticipationCount": 12,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed",
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "SWE": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "EU AI Act",
      "Sweden's AI Strategy"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "EU AI Act"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "biometric-identification",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "transparency_disclosure",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "conformity_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "biometric-identification",
          "healthcare",
          "education-children",
          "employment-hiring"
        ]
      },
      {
        "category": "prohibited_practices",
        "legalEffect": "binding",
        "domains": [
          "biometric-identification",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "phased_application",
      "regulator_appointed",
      "guidance_issued"
    ],
    "hasNextImplementationDeadline": true,
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "CHE": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Switzerland — AI Strategy / Federal Council guidelines on AI"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "TUR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Draft Law on Artificial Intelligence (Türkiye)"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Draft Law on Artificial Intelligence (Türkiye)"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "proposed",
        "domains": [
          "frontier-gpai",
          "healthcare",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed"
    ],
    "sourceConfidence": "medium"
  },
  "UKR": {
    "internationalParticipationCount": 10,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "GBR": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "AI regulation: a pro-innovation approach (white paper response)",
      "UK AI Security Institute (AISI)",
      "Artificial Intelligence (Regulation) Bill — relaunched by Lord Holmes"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Artificial Intelligence (Regulation) Bill — relaunched by Lord Holmes"
    ],
    "internationalParticipationCount": 18,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "guidance_issued",
      "proposed",
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "VAT": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CAN": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "Artificial Intelligence and Data Act (AIDA) — proposed in Bill C-27",
      "Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems",
      "Canadian AI Safety Institute (CAISI)"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Artificial Intelligence and Data Act (AIDA) — proposed in Bill C-27"
    ],
    "internationalParticipationCount": 20,
    "hqLabCount": 1,
    "hqLabNames": [
      "Cohere"
    ],
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "MEX": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Federal Law Regulating Artificial Intelligence (Mexico)"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Federal Law Regulating Artificial Intelligence (Mexico)"
    ],
    "internationalParticipationCount": 11,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "transparency_disclosure",
        "legalEffect": "proposed",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed"
    ],
    "sourceConfidence": "medium"
  },
  "USA": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "NIST AI Risk Management Framework (AI RMF 1.0)",
      "U.S. Center for AI Standards and Innovation (CAISI / U.S. AI Safety Institute)",
      "TAKE IT DOWN Act"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "TAKE IT DOWN Act"
    ],
    "internationalParticipationCount": 21,
    "hqLabCount": 7,
    "hqLabNames": [
      "OpenAI",
      "Anthropic",
      "Google DeepMind",
      "Meta",
      "Microsoft",
      "Amazon",
      "xAI"
    ],
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "watermarking_content_labeling",
        "legalEffect": "binding",
        "domains": [
          "synthetic-media"
        ]
      },
      {
        "category": "audit_bias_audit",
        "legalEffect": "binding",
        "domains": [
          "employment-hiring"
        ]
      },
      {
        "category": "safety_framework_publication",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai"
        ]
      },
      {
        "category": "incident_reporting",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "cybersecurity-critical-infrastructure"
        ]
      },
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      },
      {
        "category": "risk_assessment",
        "legalEffect": "conditional",
        "domains": [
          "frontier-gpai"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force",
      "adopted"
    ],
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "ARG": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Argentina National AI Strategy / Plan Nacional de Inteligencia Artificial"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BHS": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BRB": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BLZ": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BOL": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BRA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Bill 2338/2023 — Legal Framework for AI"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Bill 2338/2023 — Legal Framework for AI"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "proposed",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "employment-hiring"
        ]
      }
    ],
    "implementationStatuses": [
      "proposed"
    ],
    "sourceConfidence": "medium"
  },
  "CHL": {
    "internationalParticipationCount": 11,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "COL": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CRI": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Law for the Responsible Promotion of Artificial Intelligence in Costa Rica (Bill 23919)"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Law for the Responsible Promotion of Artificial Intelligence in Costa Rica (Bill 23919)"
    ],
    "internationalParticipationCount": 6,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CUB": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "DOM": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Bill regulating AI Systems and their Applications in the Dominican Republic"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Bill regulating AI Systems and their Applications in the Dominican Republic"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ECU": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SLV": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GTM": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GUY": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "HTI": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "HND": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "JAM": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Jamaica National AI Policy Recommendations"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NIC": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PAN": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PRY": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PER": {
    "internationalParticipationCount": 9,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SUR": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TTO": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "URY": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "VEN": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "DZA": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BHR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Proposed Law Regulating Artificial Intelligence Technologies and Their Uses"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Proposed Law Regulating Artificial Intelligence Technologies and Their Uses"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "EGY": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Egypt National AI Strategy"
    ],
    "internationalParticipationCount": 8,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "IRN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Seventh Five-Year Development Plan Law — Article 65(c) (AI provisions)"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "IRQ": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ISR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Israel National AI Program"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "JOR": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KWT": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LBN": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LBY": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MAR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Maroc IA 2030 (Morocco National AI Strategy)"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "OMN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Oman National AI Policy"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PSE": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "QAT": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SAU": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Saudi Arabia — National Strategy for Data & AI (NSDAI)"
    ],
    "internationalParticipationCount": 8,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SYR": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TUN": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ARE": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "UAE National Strategy for AI 2031"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "YEM": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "AGO": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BEN": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BWA": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BFA": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BDI": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CMR": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CPV": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CAF": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TCD": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "COM": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "COG": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "COD": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CIV": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "DJI": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GNQ": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ERI": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SWZ": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ETH": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GAB": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GMB": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GHA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Ghana National Artificial Intelligence Strategy 2025–2033"
    ],
    "internationalParticipationCount": 6,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GIN": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "GNB": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KEN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Kenya National AI Strategy 2025–2030"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LSO": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LBR": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MDG": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MWI": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MLI": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MRT": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MUS": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Mauritius National AI Strategy"
    ],
    "internationalParticipationCount": 6,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MOZ": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NAM": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NER": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NGA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Nigeria National AI Strategy"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "RWA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Rwanda National AI Policy"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "STP": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SEN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Senegal National AI Strategy"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SYC": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SLE": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SOM": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ZAF": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "South Africa National AI Policy Framework"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SSD": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SDN": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TZA": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TGO": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "UGA": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ZMB": {
    "internationalParticipationCount": 6,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "ZWE": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "CHN": {
    "nationalRuleCount": 4,
    "nationalRuleNames": [
      "Interim Measures for the Management of Generative Artificial Intelligence Services",
      "Provisions on the Administration of Deep Synthesis Internet Information Services",
      "Provisions on the Administration of Algorithmic Recommendation Services for Internet Information Services",
      "Measures for the Labeling of AI-Generated Synthetic Content"
    ],
    "confirmedBindingNationalRuleCount": 4,
    "bindingRuleNames": [
      "Interim Measures for the Management of Generative Artificial Intelligence Services",
      "Provisions on the Administration of Deep Synthesis Internet Information Services",
      "Provisions on the Administration of Algorithmic Recommendation Services for Internet Information Services",
      "Measures for the Labeling of AI-Generated Synthetic Content"
    ],
    "internationalParticipationCount": 10,
    "hqLabCount": 4,
    "hqLabNames": [
      "DeepSeek",
      "Baidu",
      "Alibaba",
      "Tencent"
    ],
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "registration_filing",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "synthetic-media",
          "public-sector"
        ]
      },
      {
        "category": "watermarking_content_labeling",
        "legalEffect": "binding",
        "domains": [
          "synthetic-media",
          "frontier-gpai"
        ]
      },
      {
        "category": "compute_infrastructure_reporting",
        "legalEffect": "indirect",
        "domains": [
          "compute-cloud-chips",
          "frontier-gpai"
        ]
      }
    ],
    "implementationStatuses": [
      "in_force"
    ],
    "hasInForceImplementation": true,
    "sourceConfidence": "medium"
  },
  "HKG": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "JPN": {
    "nationalRuleCount": 3,
    "nationalRuleNames": [
      "Act on the Promotion of Research, Development and Utilisation of AI-Related Technologies",
      "AI Guidelines for Business",
      "Japan AI Safety Institute"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "Act on the Promotion of Research, Development and Utilisation of AI-Related Technologies"
    ],
    "internationalParticipationCount": 20,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector"
        ]
      }
    ],
    "implementationStatuses": [
      "adopted"
    ],
    "sourceConfidence": "medium"
  },
  "MAC": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MNG": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PRK": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KOR": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "AI Basic Act (Framework Act on the Development of AI and Foundational Trust)"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "AI Basic Act (Framework Act on the Development of AI and Foundational Trust)"
    ],
    "internationalParticipationCount": 15,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "binding",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "cybersecurity-critical-infrastructure"
        ]
      }
    ],
    "implementationStatuses": [
      "phased_application"
    ],
    "hasNextImplementationDeadline": true,
    "sourceConfidence": "medium"
  },
  "TWN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Artificial Intelligence Basic Act (Taiwan)"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "Artificial Intelligence Basic Act (Taiwan)"
    ],
    "internationalParticipationCount": 7,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BRN": {
    "internationalParticipationCount": 9,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KHM": {
    "internationalParticipationCount": 8,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "IDN": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Indonesia National Strategy for Artificial Intelligence (Stranas KA)"
    ],
    "internationalParticipationCount": 13,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LAO": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MYS": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Malaysia National AI Roadmap (AI-Rmap) 2021–2025"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MMR": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PHL": {
    "internationalParticipationCount": 11,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SGP": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "Model AI Governance Framework for Generative AI",
      "AI Verify"
    ],
    "internationalParticipationCount": 16,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "THA": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Thailand National AI Strategy and Action Plan 2022–2027"
    ],
    "internationalParticipationCount": 10,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TLS": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "VNM": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "Law on Artificial Intelligence (Vietnam)",
      "Law on Digital Technology Industry"
    ],
    "confirmedBindingNationalRuleCount": 2,
    "bindingRuleNames": [
      "Law on Artificial Intelligence (Vietnam)",
      "Law on Digital Technology Industry"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "AFG": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BGD": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Bangladesh National AI Strategy / National AI Policy"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "BTN": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "IND": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "IndiaAI Mission"
    ],
    "internationalParticipationCount": 9,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MDV": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NPL": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PAK": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "LKA": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KAZ": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Law of the Republic of Kazakhstan On Artificial Intelligence"
    ],
    "confirmedBindingNationalRuleCount": 1,
    "bindingRuleNames": [
      "Law of the Republic of Kazakhstan On Artificial Intelligence"
    ],
    "internationalParticipationCount": 6,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KGZ": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TJK": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TKM": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "UZB": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "AZE": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "Azerbaijan Artificial Intelligence Strategy 2025–2028"
    ],
    "internationalParticipationCount": 5,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "AUS": {
    "nationalRuleCount": 2,
    "nationalRuleNames": [
      "Voluntary AI Safety Standard",
      "Proposed mandatory guardrails for AI in high-risk settings"
    ],
    "proposedNationalRuleCount": 1,
    "proposedRuleNames": [
      "Proposed mandatory guardrails for AI in high-risk settings"
    ],
    "internationalParticipationCount": 15,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "obligationSignals": [
      {
        "category": "risk_assessment",
        "legalEffect": "proposed",
        "domains": [
          "frontier-gpai",
          "public-sector",
          "employment-hiring",
          "healthcare"
        ]
      }
    ],
    "sourceConfidence": "medium"
  },
  "FJI": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "KIR": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "MHL": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "FSM": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NRU": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "NZL": {
    "nationalRuleCount": 1,
    "nationalRuleNames": [
      "New Zealand Algorithm Charter for Aotearoa"
    ],
    "internationalParticipationCount": 11,
    "hasAnyAIRule": true,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PLW": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "PNG": {
    "internationalParticipationCount": 7,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "WSM": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "SLB": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TON": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "TUV": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  },
  "VUT": {
    "internationalParticipationCount": 5,
    "hasFrontierAIRelevant": true,
    "sourceConfidence": "medium"
  }
};
