const API_BASE_URL = "http://localhost:5001/api";

export async function uploadInvoice(file) {
  const formData = new FormData();
  formData.append("invoice", file);

  const response = await fetch(`${API_BASE_URL}/expenses/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Upload failed");
  }

  return response.json();
}

export async function fetchExpenses() {
  const response = await fetch(`${API_BASE_URL}/expenses`);

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return response.json();
}

export async function deleteExpense(id) {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Delete failed");
  }

  return response.json();
}
