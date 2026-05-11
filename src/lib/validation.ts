import { z } from "zod";

export const eventIngestSchema = z.object({
  event: z.string().min(1).max(160).regex(/^[a-zA-Z0-9_.:-]+$/),
  userId: z.string().max(200).optional(),
  timestamp: z.string().datetime().optional(),
  properties: z.record(z.unknown()).default({})
});

export const workspaceSchema = z.object({
  name: z.string().min(2).max(80)
});

export const apiKeySchema = z.object({
  name: z.string().min(2).max(80)
});

export const destinationSchema = z.object({
  name: z.string().min(2).max(80),
  url: z.string().url(),
  enabled: z.boolean().default(true)
});
