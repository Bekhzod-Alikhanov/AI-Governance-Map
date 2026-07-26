import { describe, expect, it } from "vitest";
import {
  NATIONAL_IMPLEMENTATION_RULES,
  SUBNATIONAL_AI_RULES,
  SUBNATIONAL_ONLY_RULES,
  jurisdictionLevel,
} from "./subnationalRules";

describe("jurisdiction level", () => {
  it("does not count sovereign states as subnational jurisdictions", () => {
    // France and Germany are EU member states implementing the AI Act. Filing
    // them beside California and New York City misstates what they are, and
    // inflates the headline subnational count.
    for (const rule of SUBNATIONAL_ONLY_RULES) {
      expect(rule.jurisdictionType).not.toBe("eu_member");
    }

    const countries = NATIONAL_IMPLEMENTATION_RULES.map((rule) => rule.countryIso3).sort();
    expect(countries).toEqual(["DEU", "FRA"]);
  });

  it("partitions every rule into exactly one level", () => {
    expect(SUBNATIONAL_ONLY_RULES.length + NATIONAL_IMPLEMENTATION_RULES.length).toBe(
      SUBNATIONAL_AI_RULES.length
    );
    expect(SUBNATIONAL_ONLY_RULES).toHaveLength(5);
    expect(NATIONAL_IMPLEMENTATION_RULES).toHaveLength(2);
  });

  it("classifies by jurisdiction type", () => {
    expect(jurisdictionLevel("us_state")).toBe("subnational");
    expect(jurisdictionLevel("us_city")).toBe("subnational");
    expect(jurisdictionLevel("province")).toBe("subnational");
    expect(jurisdictionLevel("eu_member")).toBe("national_implementation");
  });
});
