"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = "__empty__";

export function FormSelect({
  name,
  defaultValue = "",
  placeholder,
  options,
  className,
  required,
  onValueChange,
}: {
  name: string;
  defaultValue?: string;
  placeholder: string;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue || EMPTY);

  return (
    <>
      <input type="hidden" name={name} value={value === EMPTY ? "" : value} required={required} />
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValueChange?.(v === EMPTY ? "" : v);
        }}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value || EMPTY} value={o.value || EMPTY} disabled={o.disabled}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
