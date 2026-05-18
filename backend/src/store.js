import { ObjectId } from "mongodb";
import { getTasksCollection } from "./db.js";

function toTask(document) {
  return {
    id: document._id.toString(),
    title: document.title,
    description: document.description || "",
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

export async function listTasks() {
  const collection = await getTasksCollection();
  const documents = await collection.find().sort({ createdAt: -1 }).toArray();
  return documents.map(toTask);
}

export async function createTask(title) {
  const now = new Date().toISOString();
  const collection = await getTasksCollection();
  const result = await collection.insertOne({
    title,
    description: "",
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.insertedId.toString(),
    title,
    description: "",
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTask(id, title, description) {
  const objectId = toObjectId(id);

  if (!objectId) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  const collection = await getTasksCollection();

  const setDoc = { title, updatedAt };
  if (typeof description === "string") setDoc.description = description;

  const result = await collection.updateOne(
    { _id: objectId },
    { $set: setDoc },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  const document = await collection.findOne({ _id: objectId });
  return document ? toTask(document) : null;
}

export async function deleteTask(id) {
  const objectId = toObjectId(id);

  if (!objectId) {
    return false;
  }

  const collection = await getTasksCollection();
  const result = await collection.deleteOne({ _id: objectId });
  return result.deletedCount === 1;
}
