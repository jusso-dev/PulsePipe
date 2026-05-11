"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "./ui";

export function DestinationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1.6fr_auto] sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/destinations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            url: form.get("url"),
            enabled: true
          })
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setError(payload.error ?? "Destination could not be created.");
          return;
        }
        setError(null);
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      <Field label="Name">
        <Input name="name" placeholder="Billing service" required />
      </Field>
      <Field label="Endpoint URL">
        <Input name="url" type="url" placeholder="https://example.com/webhooks/pulsepipe" required />
      </Field>
      <Button type="submit">
        <Plus size={16} />
        Add
      </Button>
      {error ? <p className="text-sm text-danger sm:col-span-3">{error}</p> : null}
    </form>
  );
}
