import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";

beforeEach(() => {
  window.localStorage.clear();
});

function renderWithProvider() {
  return render(
    <LanguageProvider>
      <LanguageSwitcher />
      <Footer />
    </LanguageProvider>,
  );
}

describe("LanguageSwitcher", () => {
  it("defaults to Arabic", () => {
    renderWithProvider();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("switches the active language and translated text", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "en");

    expect(select.value).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getByText(/Work\. Verified\. Trusted\./)).not.toBeNull();
  });

  it("persists the selected language to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "en");

    expect(window.localStorage.getItem("locale")).toBe("en");
  });

  it("restores a previously selected language on mount", () => {
    window.localStorage.setItem("locale", "en");
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("falls back to Arabic when used without a provider", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("ar");
  });
});
