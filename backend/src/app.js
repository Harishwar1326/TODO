import express from "express";
import cors from "cors";
import { createTask, deleteTask, listTasks, updateTask } from "./store.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/tasks", async (_request, response) => {
  const tasks = await listTasks();
  response.json(tasks);
});

app.post("/api/tasks", async (request, response) => {
  const title =
    typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string"
      ? request.body.description.trim()
      : "";

  if (!title) {
    return response.status(400).json({ message: "Task title is required." });
  }

  const task = await createTask(title, description);
  return response.status(201).json(task);
});

app.put("/api/tasks/:id", async (request, response) => {
  const title =
    typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string"
      ? request.body.description.trim()
      : undefined;

  if (!title) {
    return response.status(400).json({ message: "Task title is required." });
  }

  const task = await updateTask(request.params.id, title, description);

  if (!task) {
    return response.status(404).json({ message: "Task not found." });
  }

  return response.json(task);
});

app.delete("/api/tasks/:id", async (request, response) => {
  const deleted = await deleteTask(request.params.id);

  if (!deleted) {
    return response.status(404).json({ message: "Task not found." });
  }

  return response.status(204).send();
});

export default app;
