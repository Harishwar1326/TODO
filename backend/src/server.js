import app from "./app.js";
import { closeDatabase, connectDatabase } from "./db.js";

const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(port, () => {
      console.log(`Todo API listening on http://localhost:${port}`);
      console.log(
        `Connected to MongoDB at ${process.env.MONGODB_URI || "mongodb://localhost:27017"}`,
      );
    });

    const shutdown = async () => {
      await closeDatabase();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
