import autocannon from "autocannon";

const url = process.env.PULSEPIPE_URL ?? "http://localhost:3000/api/v1/events";
const apiKey = process.env.PULSEPIPE_API_KEY;

if (!apiKey) {
  console.error("Set PULSEPIPE_API_KEY to run the load test.");
  process.exit(1);
}

const instance = autocannon({
  url,
  method: "POST",
  connections: Number(process.env.LOAD_CONNECTIONS ?? 25),
  duration: Number(process.env.LOAD_DURATION_SECONDS ?? 20),
  headers: {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    event: "load.test",
    userId: "load_user",
    timestamp: new Date().toISOString(),
    properties: { source: "autocannon" }
  })
});

autocannon.track(instance, { renderProgressBar: true });

instance.on("done", (result) => {
  console.log(
    JSON.stringify(
      {
        requestsPerSecond: result.requests.average,
        latencyMs: result.latency.average,
        throughputBytesPerSecond: result.throughput.average,
        non2xx: result.non2xx
      },
      null,
      2
    )
  );
});
