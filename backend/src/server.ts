import { env } from "./config/env";
import { app } from "./app";
import { prisma } from "./lib/prisma";

async function start() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
}

start().catch(async (error) => {
  console.error("Failed to start backend", error);
  await prisma.$disconnect();
  process.exit(1);
});
