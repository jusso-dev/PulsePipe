import { Queue } from "bullmq";
import { env } from "./env";

export const DELIVERY_QUEUE_NAME = "webhook-deliveries";

export type DeliveryJob = {
  eventId: string;
  destinationId: string;
  replayOfAttemptId?: string;
};

export function getQueueConnection() {
  const url = new URL(env.redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    maxRetriesPerRequest: null
  };
}

const globalForQueue = globalThis as unknown as { deliveryQueue?: Queue<DeliveryJob> };

export function getDeliveryQueue() {
  if (!globalForQueue.deliveryQueue) {
    globalForQueue.deliveryQueue = new Queue<DeliveryJob>(DELIVERY_QUEUE_NAME, {
      connection: getQueueConnection(),
      defaultJobOptions: {
        attempts: 4,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 500,
        removeOnFail: 1000
      }
    });
  }

  return globalForQueue.deliveryQueue;
}
