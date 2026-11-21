import type { User, UserFormData } from "@/types/user";
import { initialUsers } from "@/data/mockUsers";

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

export const userService = {
  /**
   * Health/Ping check for Golang backend server
   */
  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        3000,
      );
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch all users dynamically from Golang backend API.
   * If server is unreachable or timeout > 3000ms, marks isLive: false.
   */
  async getAll(): Promise<{ data: User[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users`,
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

      const resJson: BackendResponse<User[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list.length > 0 ? list : initialUsers,
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
   * Fetch single user by ID from Golang backend API
   */
  async getById(
    id: number,
  ): Promise<{ data: User | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users/${id}`,
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

      const resJson: BackendResponse<User> = await response.json();
      const userItem = resJson.datas ?? resJson.data ?? null;

      return {
        data: userItem,
        isLive: true,
      };
    } catch {
      return {
        data: null,
        isLive: false,
      };
    }
  },

  /**
   * Create new user in Golang backend API
   */
  async create(
    formData: UserFormData,
  ): Promise<{ data: User | null; isLive: boolean }> {
    try {
      const payload = {
        role_id: Number(formData.role_id),
        outlet_id: Number(formData.outlet_id),
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password || "password123",
        phone_number: formData.phone_number,
        last_login: new Date().toISOString(),
        avatar: formData.avatar || "",
        status: formData.status,
        is_active: formData.is_active,
      };

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        3000,
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(
          errorJson?.message || `HTTP error! status: ${response.status}`,
        );
      }

      const resJson: BackendResponse<User> = await response.json();
      const createdUser = resJson.datas ?? resJson.data ?? null;

      return {
        data: createdUser,
        isLive: true,
      };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, isLive: false };
      }
      if (err instanceof TypeError && err.message.includes("fetch")) {
        return { data: null, isLive: false };
      }
      throw err;
    }
  },

  /**
   * Update existing user in Golang backend API
   */
  async update(
    id: number,
    formData: UserFormData,
  ): Promise<{ data: User | null; isLive: boolean }> {
    try {
      const payload = {
        role_id: Number(formData.role_id),
        outlet_id: Number(formData.outlet_id),
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password || "password123",
        phone_number: formData.phone_number,
        last_login: new Date().toISOString(),
        avatar: formData.avatar || "",
        status: formData.status,
        is_active: formData.is_active,
      };

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        3000,
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(
          errorJson?.message || `HTTP error! status: ${response.status}`,
        );
      }

      const resJson: BackendResponse<User> = await response.json();
      const updatedUser = resJson.datas ?? resJson.data ?? null;

      return {
        data: updatedUser,
        isLive: true,
      };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, isLive: false };
      }
      if (err instanceof TypeError && err.message.includes("fetch")) {
        return { data: null, isLive: false };
      }
      throw err;
    }
  },

  /**
   * Delete user by ID
   */
  async delete(id: number): Promise<{ isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
        3000,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { isLive: true };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { isLive: false };
      }
      if (err instanceof TypeError && err.message.includes("fetch")) {
        return { isLive: false };
      }
      throw err;
    }
  },
};
