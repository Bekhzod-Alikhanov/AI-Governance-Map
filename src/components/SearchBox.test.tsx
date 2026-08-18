import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { humanizeSearchMetadata, SearchBox } from "./SearchBox";

const mounted: Array<{ container: HTMLDivElement; root: Root }> = [];

afterEach(() => {
  for (const view of mounted.splice(0)) {
    act(() => view.root.unmount());
    view.container.remove();
  }
});

function mount(element: React.ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(element));
  const view = { container, root };
  mounted.push(view);
  return view;
}

function SearchHarness({
  initialQuery,
  onSelectCountry = vi.fn(),
}: {
  initialQuery: string;
  onSelectCountry?: (iso3: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  return (
    <SearchBox
      query={query}
      onQueryChange={setQuery}
      onSelectCountry={onSelectCountry}
      onSelectInstrument={vi.fn()}
    />
  );
}

async function settleSearch(container: HTMLElement) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const options = container.querySelectorAll<HTMLElement>('[role="option"]');
    if (options.length) return options;
  }
  throw new Error("Search results did not load");
}

function focus(input: HTMLInputElement) {
  act(() => input.focus());
}

function press(input: HTMLInputElement, key: string) {
  act(() => input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })));
}

function change(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  act(() => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("SearchBox metadata", () => {
  it("sentence-cases enum metadata without flattening acronyms", () => {
    expect(humanizeSearchMetadata("INSTITUTIONAL_FRAMEWORK")).toBe("Institutional framework");
    expect(humanizeSearchMetadata("EU_OECD")).toBe("EU OECD");
  });

  it("separates the title from humanized kind and jurisdiction metadata", async () => {
    const { container } = mount(<SearchHarness initialQuery="European AI Office" />);
    const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    focus(input);

    const option = Array.from(await settleSearch(container)).find((item) =>
      item.textContent?.includes("European AI Office")
    )!;
    const [title, metadata] = option.querySelectorAll("span");
    expect(title).toHaveTextContent("European AI Office");
    expect(metadata).toHaveTextContent("Regulation · European Union • Institutional framework");
    expect(metadata?.textContent).not.toMatch(/[_-]/);
    expect(option.closest("[role=listbox]")).toHaveClass("sm:w-96");
  });
});

describe("SearchBox keyboard combobox", () => {
  it("moves the active descendant, selects with Enter, and closes with Escape", async () => {
    const onSelectCountry = vi.fn();
    const { container } = mount(
      <SearchHarness initialQuery="Australia" onSelectCountry={onSelectCountry} />
    );
    const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    focus(input);
    const options = await settleSearch(container);
    const option = options[0];
    expect(input).toHaveAttribute("aria-activedescendant", option.id);

    press(input, "ArrowDown");
    expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
    press(input, "ArrowUp");
    expect(input).toHaveAttribute("aria-activedescendant", option.id);
    press(input, "Enter");
    expect(onSelectCountry).toHaveBeenCalledWith("AUS");
    expect(input).toHaveAttribute("aria-expanded", "false");

    change(input, "Australia");
    focus(input);
    await settleSearch(container);
    press(input, "Escape");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("resets an out-of-range active descendant when results shrink", async () => {
    const props = {
      onQueryChange: vi.fn(),
      onSelectCountry: vi.fn(),
      onSelectInstrument: vi.fn(),
    };
    const view = mount(<SearchBox query="a" {...props} />);
    const input = view.container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    focus(input);
    const broadResults = await settleSearch(view.container);
    expect(broadResults.length).toBeGreaterThan(5);
    for (let index = 0; index < 8; index += 1) press(input, "ArrowDown");

    act(() => view.root.render(<SearchBox query="Australia" {...props} />));
    const australia = (await settleSearch(view.container))[0];
    expect(australia).toHaveTextContent("Australia");
    expect(input).toHaveAttribute("aria-activedescendant", australia.id);
  });

  it("resets a remembered index when an external controlled query returns", async () => {
    const onSelectCountry = vi.fn();
    const props = {
      onQueryChange: vi.fn(),
      onSelectCountry,
      onSelectInstrument: vi.fn(),
    };
    const view = mount(<SearchBox query="Australia" {...props} />);
    const input = view.container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    focus(input);
    const australiaResults = await settleSearch(view.container);
    expect(australiaResults.length).toBeGreaterThan(2);
    press(input, "ArrowDown");
    press(input, "ArrowDown");
    expect(input).toHaveAttribute("aria-activedescendant", australiaResults[2].id);

    act(() => view.root.render(<SearchBox query="European AI Office" {...props} />));
    const officeResult = (await settleSearch(view.container))[0];
    expect(input).toHaveAttribute("aria-activedescendant", officeResult.id);

    act(() => view.root.render(<SearchBox query="Australia" {...props} />));
    const returnedResults = await settleSearch(view.container);
    expect(input).toHaveAttribute("aria-activedescendant", returnedResults[0].id);
    press(input, "Enter");
    expect(onSelectCountry).toHaveBeenCalledWith("AUS");
  });
});
