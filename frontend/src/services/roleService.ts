import type { Role, RoleFormData } from '@/types/role';
import { initialRoles } from '@/data/mockRoles';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

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

export const roleService = {
  /**
   * Health/Ping check for Golang backend server
   */
  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        3000,
      );
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch all roles dynamically from Golang backend API.
   * If server is unreachable or timeout > 3000ms, marks isLive: false.
   */
  async getAll(): Promise<{ data: Role[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        3000,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Role[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list.length > 0 ? list : initialRoles,
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
   * Fetch single role by ID from Golang backend API
   */
  async getById(
    id: number,
  ): Promise<{ data: Role | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        3000,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Role> = await response.json();
      const item = resJson.datas ?? resJson.data ?? null;

      return {
        data: item,
        isLive: true,
      };
    } catch {
      // Fallback to local mock data if offline
      const fallback = initialRoles.find((r) => r.id_role === id) ?? null;
      return {
        data: fallback,
        isLive: false,
      };
    }
  },

  /**
   * Create new role via Golang backend API
   */
  async create(
    data: RoleFormData,
  ): Promise<{ data: Role | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        3000,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to create role: ${errorBody}`);
      }

      const resJson: BackendResponse<Role> = await response.json();
      return {
        data: resJson.datas ?? resJson.data ?? null,
        isLive: true,
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { data: null, isLive: false };
      }
      throw err;
    }
  },

  /**
   * Update existing role via Golang backend API
   */
  async update(
    id: number,
    data: RoleFormData,
  ): Promise<{ data: Role | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        3000,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update role: ${errorBody}`);
      }

      const resJson: BackendResponse<Role> = await response.json();
      return {
        data: resJson.datas ?? resJson.data ?? null,
        isLive: true,
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { data: null, isLive: false };
      }
      throw err;
    }
  },

  /**
   * Delete role by ID via Golang backend API
   */
  async delete(id: number): Promise<{ success: boolean; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/roles/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        3000,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete role: ${errorBody}`);
      }

      return {
        success: true,
        isLive: true,
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, isLive: false };
      }
      throw err;
    }
  },
};
