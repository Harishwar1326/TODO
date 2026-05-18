import { MongoClient } from "mongodb";

const isProductionDeployment = Boolean(process.env.VERCEL);
const uri =
  process.env.MONGODB_URI ||
  (isProductionDeployment ? "" : "mongodb://localhost:27017");
const databaseName = process.env.MONGODB_DB_NAME || "todo_app";

if (!uri) {
  throw new Error(
    "MONGODB_URI is required on Vercel. Set it in the project environment variables.",
  );
}

const client = new MongoClient(uri);

let database;

export async function connectDatabase() {
  if (!database) {
    await client.connect();
    database = client.db(databaseName);
  }

  return database;
}

export async function getTasksCollection() {
  const db = await connectDatabase();
  return ensureTasksCollection();
}

export async function ensureTasksCollection() {
  const db = await connectDatabase();
  const collName = "tasks";

  const validator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["title"],
      properties: {
        title: { bsonType: "string", description: "Task title (required)" },
        description: {
          bsonType: ["string", "null"],
          description: "Task description",
        },
        completed: { bsonType: "bool", description: "Completion flag" },
      },
    },
  };

  const existing = await db.listCollections({ name: collName }).toArray();
  if (existing.length === 0) {
    await db.createCollection(collName, {
      validator,
      validationLevel: "moderate",
    });
  } else {
    try {
      await db.command({
        collMod: collName,
        validator,
        validationLevel: "moderate",
      });
    } catch (err) {
      // If collMod not supported or fails, ignore — collection will still work without enforced validator.
    }
  }

  return db.collection(collName);
}

export async function closeDatabase() {
  await client.close();
  database = undefined;
}
