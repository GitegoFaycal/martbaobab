const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "The server returned an invalid response",
    };
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "The request could not be completed"
    );

    error.status = response.status;
    error.errors = data.errors || [];
    error.data = data;

    throw error;
  }

  return data;
}