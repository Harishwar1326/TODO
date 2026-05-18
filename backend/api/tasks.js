import { listTasks, createTask, updateTask, deleteTask } from "../src/store.js";

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

function noContent(res) {
  res.statusCode = 204;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end();
}

function methodNotAllowed(res) {
  res.statusCode = 405;
  res.setHeader("Allow", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end();
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return noContent(res);
  }

  const url = req.url || "";
  // Match /api/tasks or /api/tasks/:id
  const match = url.match(/^\/api\/tasks(?:\/(.+))?/);
  const id = match && match[1] ? decodeURIComponent(match[1]) : undefined;

  try {
    if (req.method === "GET" && !id) {
      const tasks = await listTasks();
      return jsonResponse(res, 200, tasks);
    }

    if (req.method === "POST" && !id) {
      const body = await parseJsonBody(req);
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title)
        return jsonResponse(res, 400, { message: "Task title is required." });
      const task = await createTask(title);
      return jsonResponse(res, 201, task);
    }

    if (req.method === "PUT" && id) {
      const body = await parseJsonBody(req);
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : undefined;
      if (!title)
        return jsonResponse(res, 400, { message: "Task title is required." });
      const task = await updateTask(id, title, description);
      if (!task) return jsonResponse(res, 404, { message: "Task not found." });
      return jsonResponse(res, 200, task);
    }

    if (req.method === "DELETE" && id) {
      const deleted = await deleteTask(id);
      if (!deleted)
        return jsonResponse(res, 404, { message: "Task not found." });
      return noContent(res);
    }

    return methodNotAllowed(res);
  } catch (err) {
    console.error(err);
    return jsonResponse(res, 500, { message: "Internal server error" });
  }
}
