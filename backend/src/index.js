import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`MartBaobab API running at http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing MartBaobab API.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));