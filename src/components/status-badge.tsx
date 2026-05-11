import { Badge } from "./ui";

export function EventStatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered" ? "success" : status === "failed" || status === "partially_failed" ? "danger" : status === "processing" ? "warning" : "neutral";
  return <Badge tone={tone}>{status.replace("_", " ")}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: string }) {
  const tone = status === "succeeded" ? "success" : status === "failed" || status === "dead_letter" ? "danger" : status === "delivering" ? "warning" : "neutral";
  return <Badge tone={tone}>{status.replace("_", " ")}</Badge>;
}
