const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    const error = new Error(
      "Cannot reach the LOCO server. Check your internet connection and try again."
    );
    error.status = 0;
    error.errors = [];
    throw error;
  }

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

// Builds "?a=1&b=2" from an object, skipping empty values.
export function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

// Maps backend validation errors ({field, message}) to an object by field.
export function fieldErrorsFrom(error) {
  const result = {};

  error?.errors?.forEach((item) => {
    const field = item.field?.replace(/^body\./, "");

    if (field && !result[field]) {
      result[field] = item.message;
    }
  });

  return result;
}
