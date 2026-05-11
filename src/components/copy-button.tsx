"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={label}
    >
      <Copy size={15} />
      {copied ? "Copied" : label}
    </Button>
  );
}
