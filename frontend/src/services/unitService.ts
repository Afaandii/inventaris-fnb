import type { Unit, UnitFormData } from '@/types/unit';
import { initialUnits } from '@/data/mockUnits';

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

export const unitService = {
  /**
   * Health/Ping check for Golang backend server
   */
  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units`,
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
   * Fetch all units dynamically from Golang backend API.
   * If server is unreachable or timeout > 3000ms, marks isLive: false.
   */
  async getAll(): Promise<{ data: Unit[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units`,
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

      const resJson: BackendResponse<Unit[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list.length > 0 ? list : initialUnits,
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
   * Fetch single unit by ID from Golang backend API
   */
  async getById(
    id: number,
  ): Promise<{ data: Unit | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units/${id}`,
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

      const resJson: BackendResponse<Unit> = await response.json();
      const item = resJson.datas ?? resJson.data ?? null;

      return {
        data: item,
        isLive: true,
      };
    } catch {
      // Fallback to local mock data if offline
      const fallback = initialUnits.find((u) => u.id_unit === id) ?? null;
      return {
        data: fallback,
        isLive: false,
      };
    }
  },

  /**
   * Create new unit via Golang backend API
   */
  async create(
    data: UnitFormData,
  ): Promise<{ data: Unit | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units`,
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
        throw new Error(`Failed to create unit: ${errorBody}`);
      }

      const resJson: BackendResponse<Unit> = await response.json();
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
   * Update existing unit via Golang backend API
   */
  async update(
    id: number,
    data: UnitFormData,
  ): Promise<{ data: Unit | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units/${id}`,
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
        throw new Error(`Failed to update unit: ${errorBody}`);
      }

      const resJson: BackendResponse<Unit> = await response.json();
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
   * Delete unit by ID via Golang backend API
   */
  async delete(id: number): Promise<{ success: boolean; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units/${id}`,
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
        throw new Error(`Failed to delete unit: ${errorBody}`);
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
