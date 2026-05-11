import { Worker } from "bullmq";
import { deliverWebhook } from "@/lib/delivery";
import { log } from "@/lib/logger";
import { DELIVERY_QUEUE_NAME, getQueueConnection } from "@/lib/queue";

const worker = new Worker(
  DELIVERY_QUEUE_NAME,
  async (job) => {
    const attemptNumber = job.attemptsMade + 1;
    await deliverWebhook(job.data.eventId, job.data.destinationId, attemptNumber);
  },
  {
    connection: getQueueConnection(),
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 10)
  }
);

worker.on("completed", (job) => {
  log("info", "delivery.completed", { jobId: job.id, eventId: job.data.eventId, destinationId: job.data.destinationId });
});

worker.on("failed", (job, error) => {
  log("warn", "delivery.failed", {
    jobId: job?.id,
    eventId: job?.data.eventId,
    destinationId: job?.data.destinationId,
    error: error.message,
    attemptsMade: job?.attemptsMade
  });
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
