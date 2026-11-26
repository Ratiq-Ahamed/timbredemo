// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FinanceContent } from "../features/finance";
import { useDemo } from "../lib/demo/store";
import { createSeed } from "../lib/demo/seed";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
beforeEach(() => {
  localStorage.clear();
  useDemo.setState({
    data: createSeed(),
    hydrated: true,
    error: "",
    notice: "",
  });
});
afterEach(cleanup);
describe("Collection form and shared ledger", () => {
  it("retains an invalid form, explains overpayment and leaves the ledger unchanged", () => {
    render(<FinanceContent bookingId="EVT-0124" />);
    fireEvent.click(screen.getByRole("button", { name: "Record collection" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Amount (₹)"), {
      target: { value: "100001" },
    });
    fireEvent.submit(
      within(dialog)
        .getByRole("button", { name: "Save changes" })
        .closest("form")!,
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "exceeds the outstanding balance",
    );
    expect(useDemo.getState().data.transactions).toHaveLength(12);
  });
  it("records the entered rupee amount in paise and updates the visible balance", () => {
    render(<FinanceContent bookingId="EVT-0124" />);
    fireEvent.click(screen.getByRole("button", { name: "Record collection" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Amount (₹)"), {
      target: { value: "25000" },
    });
    fireEvent.submit(
      within(dialog)
        .getByRole("button", { name: "Save changes" })
        .closest("form")!,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useDemo.getState().data.transactions[0].amount).toBe(2500000);
    expect(screen.getAllByText("₹75,000").length).toBeGreaterThan(0);
  });
});
