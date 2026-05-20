import { env } from "./config/env";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { runOrganizationCleanup } from "./modules/organizations/organizations.cleanup";

async function start() {
  await prisma.$connect();
  await runOrganizationCleanup();

  setInterval(() => {
    void runOrganizationCleanup().catch((error) => {
      console.error("Organization cleanup failed", error);
    });
  }, env.ORGANIZATION_CLEANUP_INTERVAL_MINUTES * 60 * 1000);

  app.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
}

start().catch(async (error) => {
  console.error("Failed to start backend", error);
  await prisma.$disconnect();
  process.exit(1);
});
