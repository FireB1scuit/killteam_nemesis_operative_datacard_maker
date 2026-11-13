import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "../src/App";

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
});
beforeEach(() => localStorage.clear());

describe("App smoke", () => {
  it("renders the editor and updates the card from the form", () => {
    const { container } = render(<App />);
    expect(screen.getByText(/Fan-made tool, not affiliated/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Operative name/), { target: { value: "Screamer-Killer" } });
    expect((screen.getByLabelText(/Name keyword/) as HTMLInputElement).value).toBe("SCREAMER-KILLER");
    const card1 = container.querySelector('[data-card="1"]') as HTMLElement;
    expect(within(card1).getByRole("heading", { level: 1 }).textContent).toBe("Screamer-Killer");

    fireEvent.click(screen.getByRole("radio", { name: "Tyranid" }));
    expect(card1.querySelector(".kt-foot .fk")?.textContent).toBe("TYRANID");
    expect(within(card1).getByText("Will of the Hive Mind:")).toBeTruthy();
  });

  it("'Weapon rules on PDF' switch: on by default, saved in the build, remembered for new builds", () => {
    render(<App />);
    const sw = screen.getByRole("switch", { name: /Weapon rules on PDF/ });
    expect(sw.getAttribute("aria-checked")).toBe("true");
    expect(sw.getAttribute("title")).toMatch(/Lite Rules/);
    fireEvent.click(screen.getByRole("radio", { name: "Chaos" })); // Let the Galaxy Burn names Balanced
    expect(document.querySelector(".pdfline")?.textContent).toBe("PDF will include 1 weapon rule: Balanced.");
    fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("false");
    expect(sw.textContent).toMatch(/Off/);
    expect(screen.getByText("Weapon rules not included in the PDF.")).toBeTruthy();
    expect(localStorage.getItem("nemesis-datacard:pref:weaponRulesOnPdf")).toBe("0");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByRole("switch", { name: /Weapon rules on PDF/ }).getAttribute("aria-checked")).toBe("false");
  });

  it("adds a weapon through the searchable picker using an alternative name", () => {
    const { container } = render(<App />);
    const add = screen.getByRole("combobox", { name: "Add weapon" });
    fireEvent.focus(add);
    fireEvent.change(add, { target: { value: "deathspitter" } });
    fireEvent.keyDown(add, { key: "Enter" });
    const card1 = container.querySelector('[data-card="1"]') as HTMLElement;
    expect(within(card1).getByText("Autocannon")).toBeTruthy();
    expect(screen.getByText("1 of 2 used")).toBeTruthy();
  });
});
