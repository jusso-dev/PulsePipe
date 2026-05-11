import dns from "dns/promises";
import net from "net";
import { env } from "./env";

const BLOCKED_HOSTS = new Set(["localhost", "0.0.0.0"]);

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export async function assertSafeWebhookUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("Webhook URL must use http or https.");
  }
  if (env.allowLocalWebhooks) {
    return url.toString();
  }
  if (BLOCKED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("Webhook URL cannot target localhost.");
  }

  const directIpVersion = net.isIP(url.hostname);
  if (directIpVersion === 4 && isPrivateIpv4(url.hostname)) {
    throw new Error("Webhook URL cannot target private IPv4 ranges.");
  }
  if (directIpVersion === 6 && isPrivateIpv6(url.hostname)) {
    throw new Error("Webhook URL cannot target private IPv6 ranges.");
  }

  if (!directIpVersion) {
    const records = await dns.lookup(url.hostname, { all: true });
    for (const record of records) {
      if ((record.family === 4 && isPrivateIpv4(record.address)) || (record.family === 6 && isPrivateIpv6(record.address))) {
        throw new Error("Webhook URL resolves to a private network address.");
      }
    }
  }

  return url.toString();
}
