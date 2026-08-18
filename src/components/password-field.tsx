"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";

export function PasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup className="h-auto rounded-input">
      <InputGroupAddon>
        <Lock className="text-text-muted" strokeWidth={1.75} />
      </InputGroupAddon>
      <InputGroupInput
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        required
        placeholder="Enter your password"
        className="py-2.5 text-base placeholder:text-text-muted"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="text-text-muted hover:text-text"
        >
          {visible ? <EyeOff strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
