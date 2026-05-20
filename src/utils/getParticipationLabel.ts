import type { ParticipationType, InstrumentBindingStatus, NationalBindingStatus } from "../types";

export const PARTICIPATION_LABELS: Record<ParticipationType, string> = {
  signed: "Signed",
  ratified: "Ratified",
  endorsed: "Endorsed",
  adopted: "Adopted",
  adherent: "Adherent",
  member: "Member",
  participant: "Participant",
  applicable_via_eu: "Applicable via EU membership",
  covered_by_membership: "Membership coverage (indirect)",
  unknown: "Unknown",
};

export const PARTICIPATION_DESCRIPTIONS: Record<ParticipationType, string> = {
  signed: "Country has signed the instrument; signature is not the same as ratification.",
  ratified: "Country has formally ratified the instrument; check entry-into-force and scope conditions.",
  endorsed: "Country has politically endorsed or adopted the instrument's positions.",
  adopted: "Country has adopted or accepted the instrument's text.",
  adherent: "Country has formally adhered to the instrument or its principles.",
  member: "Country is a member of the issuing organization or initiative.",
  participant: "Country participated in the negotiation or activity creating the instrument.",
  applicable_via_eu:
    "Instrument applies through EU membership; this is not a separate national AI law enacted by the member state.",
  covered_by_membership:
    "Country is included because it belongs to the issuing organization; this is not evidence of direct signature, ratification, or explicit endorsement.",
  unknown: "Participation status is not verified in this dataset.",
};

export const INSTRUMENT_BINDING_LABELS: Record<InstrumentBindingStatus, string> = {
  binding_on_parties: "Binding on parties",
  binding_regulation: "Binding regulation",
  non_binding: "Non-binding",
  voluntary: "Voluntary",
  standard: "Standard",
  political_guidance: "Political guidance",
};

export const INSTRUMENT_BINDING_DESCRIPTIONS: Record<InstrumentBindingStatus, string> = {
  binding_on_parties:
    "Treaty-style obligation for parties once the relevant signature, ratification, and entry-into-force conditions are satisfied.",
  binding_regulation:
    "Binding legal instrument in its issuing jurisdiction; territorial scope and application dates still matter.",
  non_binding: "Soft-law instrument, recommendation, declaration, or policy text without binding legal force by itself.",
  voluntary: "Voluntary framework or code; participation does not create binding legal duties by itself.",
  standard: "Technical or management standard; not a national law unless separately adopted or required.",
  political_guidance: "Political guidance or summit language; not binding law by itself.",
};

export const NATIONAL_BINDING_LABELS: Record<NationalBindingStatus, string> = {
  binding: "Binding",
  non_binding: "Non-binding",
  voluntary: "Voluntary",
  proposed: "Proposed",
  mixed: "Mixed",
};

export const NATIONAL_BINDING_DESCRIPTIONS: Record<NationalBindingStatus, string> = {
  binding: "Binding AI-specific legal requirement is in force or otherwise applies.",
  non_binding: "Guidance, strategy, institutional framework, or other non-binding public instrument.",
  voluntary: "Voluntary framework, standard, code, or commitment.",
  proposed: "Draft or proposed AI-specific legal instrument; not in force.",
  mixed: "Contains a mix of binding and non-binding elements, or depends on implementation phase.",
};

export function isBindingParticipation(type: ParticipationType): boolean {
  return type === "ratified" || type === "applicable_via_eu";
}
