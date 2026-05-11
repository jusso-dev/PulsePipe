"use client";

import { KeyRound, Play, Plus, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "./copy-button";
import { Button, Field, Input } from "./ui";

export function ApiKeyCreator() {
  const router = useRouter();
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const curl = rawKey
    ? `curl -X POST ${typeof window === "undefined" ? "http://localhost:3002" : window.location.origin}/api/v1/events \\
  -H "Authorization: Bearer ${rawKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"demo.checkout.completed","userId":"demo_user_42","timestamp":"${new Date().toISOString()}","properties":{"plan":"pro","amount":4900}}'`
    : "";

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/api-keys", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: form.get("name") })
        });
        const payload = await response.json();
        if (!response.ok) {
          setError("API key could not be created.");
          return;
        }
        setRawKey(payload.apiKey.rawKey);
        setTestResult(null);
        setError(null);
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Field label="Key name">
          <Input name="name" placeholder="Production ingestion" required />
        </Field>
        <Button type="submit">
          <Plus size={16} />
          Create
        </Button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {rawKey ? (
        <div className="space-y-4 rounded-md border border-accent/30 bg-accent/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <KeyRound size={16} />
            Save this API key now. It will not be shown again.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 overflow-x-auto rounded bg-paper px-3 py-2 text-xs">{rawKey}</code>
            <CopyButton value={rawKey} />
          </div>
          <div className="rounded-md border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                <Terminal size={14} />
                Ingest test event
              </p>
              <CopyButton value={curl} label="Copy curl" />
            </div>
            <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-ink">{curl}</pre>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="secondary"
              disabled={sending}
              onClick={async () => {
                setSending(true);
                setTestResult(null);
                const response = await fetch("/api/v1/events", {
                  method: "POST",
                  headers: {
                    authorization: `Bearer ${rawKey}`,
                    "content-type": "application/json"
                  },
                  body: JSON.stringify({
                    event: "demo.checkout.completed",
                    userId: "demo_user_42",
                    timestamp: new Date().toISOString(),
                    properties: { plan: "pro", amount: 4900 }
                  })
                });
                const payload = await response.json().catch(() => ({}));
                setSending(false);
                if (!response.ok) {
                  setTestResult(payload.error ?? "Test event failed.");
                  return;
                }
                setTestResult(`Event accepted: ${payload.eventId}`);
                router.refresh();
              }}
            >
              <Play size={15} />
              {sending ? "Sending" : "Send test event"}
            </Button>
            {testResult ? <p className="text-sm font-medium text-ink">{testResult}</p> : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
