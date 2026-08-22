import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { startReconcilePaymentsWorker } from "./workers/reconcilePayments.js";

async function main() {
  const app = await buildApp();

  startReconcilePaymentsWorker(app.log);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
