export function JsonViewer({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[28rem] overflow-auto rounded-md border border-line bg-ink p-4 text-xs leading-relaxed text-paper">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
