import { serve } from "https://deno.land/std/http/server.ts";

const DEFAULT_HTTP_PORT = 8080;

const port = Number(Deno.args[0]) || DEFAULT_HTTP_PORT;
const server = serve({ hostname: "0.0.0.0", port });
console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);

for await (const request of server) {
  let bodyContent = "Your user-agent is:\n\n";
  bodyContent += request.headers.get("user-agent") || "Unknown";

  request.respond({ status: 200, body: bodyContent });
}