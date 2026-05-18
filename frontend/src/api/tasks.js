const API_BASE = "/api/tasks";

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export async function getTasks() {
  const response = await fetch(API_BASE);
  return readResponse(response);
}

export async function createTask(title, description = "") {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description }),
  });

  return readResponse(response);
}

export async function updateTask(id, title, description) {
  const body = { title };
  if (typeof description === "string") body.description = description;

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  return readResponse(response);
}
