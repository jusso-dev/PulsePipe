declare module "autocannon" {
  type AutocannonResult = {
    requests: { average: number };
    latency: { average: number };
    throughput: { average: number };
    non2xx: number;
  };

  type AutocannonInstance = {
    on(event: "done", callback: (result: AutocannonResult) => void): void;
  };

  type AutocannonOptions = {
    url: string;
    method: string;
    connections: number;
    duration: number;
    headers: Record<string, string>;
    body: string;
  };

  type Autocannon = {
    (options: AutocannonOptions): AutocannonInstance;
    track(instance: AutocannonInstance, options?: { renderProgressBar?: boolean }): void;
  };

  const autocannon: Autocannon;
  export default autocannon;
}
