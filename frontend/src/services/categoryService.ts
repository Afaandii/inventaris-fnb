import type { Category, CategoryFormData } from "@/types/category";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

interface BackendResponse<T> {
  status: string;
  message: string;
  datas?: T;
  data?: T;
  error?: unknown;
}

/**
 * Fetch wrapper with configurable timeout via AbortController
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 3000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const categoryService = {
  /**
   * Fetch all categories dynamically from Golang backend.
   * If backend is not available, times out, or fails, marks isLive: false.
   */
  async getAll(): Promise<{ data: Category[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        3000,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Category[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list,
        isLive: true,
      };
    } catch {
      return {
        data: [],
        isLive: false,
      };
    }
  },

  /**
   * Fetch single category by ID
   */
  async getById(
    id: number,
  ): Promise<{ data: Category | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/categories/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        3000,
      );
      if (!response.ok) return { data: null, isLive: false };
      const resJson: BackendResponse<Category> = await response.json();
      return {
        data: resJson.datas ?? resJson.data ?? null,
        isLive: true,
      };
    } catch {
      return { data: null, isLive: false };
    }
  },

  /**
   * Create a new category in Golang backend
   */
  async create(payload: CategoryFormData): Promise<Category> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: payload.parent_id ?? 0,
          category_name: payload.category_name,
          type: payload.type,
          description: payload.description,
          status: payload.status,
        }),
      },
      5000,
    );

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    const resJson: BackendResponse<Category> = await response.json();
    const result = resJson.datas ?? resJson.data;
    if (!result) {
      throw new Error("No category data returned by backend");
    }

    return result;
  },

  /**
   * Update category in Golang backend
   */
  async update(id: number, payload: CategoryFormData): Promise<Category> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/categories/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: payload.parent_id ?? 0,
          category_name: payload.category_name,
          type: payload.type,
          description: payload.description,
          status: payload.status,
        }),
      },
      5000,
    );

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`);
    }

    const resJson: BackendResponse<Category> = await response.json();
    const result = resJson.datas ?? resJson.data;
    if (!result) {
      throw new Error("No category data returned by backend");
    }

    return result;
  },

  /**
   * Delete category from Golang backend
   */
  async delete(id: number): Promise<boolean> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/categories/${id}`,
      {
        method: "DELETE",
      },
      5000,
    );

    return response.ok;
  },
};
