"use client";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import type { Command, Input } from "@/lib/demo/types";
import { FormModal, type FormField } from "./ui";
const moneyFields = [
  "amount",
  "contract",
  "advance",
  "budget",
  "spend",
  "rate",
  "cost",
];
export function useActionForm() {
  const [config, setConfig] = useState<{
    command: Command;
    title: string;
    fields: FormField[];
    base: Input;
    after?: (id?: string) => void;
    description?: string;
  } | null>(null);
  const execute = useDemo((s) => s.execute);
  return {
    open: (
      command: Command,
      title: string,
      fields: FormField[],
      base: Input = {},
      after?: (id?: string) => void,
      description?: string,
    ) => setConfig({ command, title, fields, base, after, description }),
    modal: config ? (
      <FormModal
        key={config.title}
        title={config.title}
        description={config.description}
        fields={config.fields}
        onClose={() => setConfig(null)}
        onSubmit={(values) => {
          const data = { ...config.base, ...values };
          for (const key of moneyFields)
            if (
              config.fields.some((f) => f.name === key && f.type === "number")
            )
              data[key] = Math.round(Number(data[key]) * 100);
          const result = execute(config.command, data);
          if (result.ok) config.after?.(result.id);
          return result.ok;
        }}
      />
    ) : null,
  };
}
export const amountField = (value = 25000): FormField => ({
  name: "amount",
  label: "Amount (₹)",
  type: "number",
  value,
  min: 1,
  required: true,
});
export const referenceField = (sequence: number): FormField => ({
  name: "reference",
  label: "Reference",
  value: `DEMO-${sequence + 1}`,
  required: true,
});
export const methodField: FormField = {
  name: "method",
  label: "Payment method",
  type: "select",
  options: ["UPI", "Bank transfer", "Cash"],
  value: "UPI",
};
