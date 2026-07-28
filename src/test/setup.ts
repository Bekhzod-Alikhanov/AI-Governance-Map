import "@testing-library/jest-dom/vitest";

// React only treats act() as configured when this flag is set. Without it every
// component test prints "The current testing environment is not configured to
// support act(...)" to stderr — noise that trains you to ignore test output,
// which is where a real warning would eventually hide.
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
