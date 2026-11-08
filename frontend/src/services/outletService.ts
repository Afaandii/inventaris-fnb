import type { Outlet, OutletFormData } from '@/types/outlet';
import { initialOutlets } from '@/data/mockOutlets';

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

export const outletService = {
  /**
   * Health/Ping check for Golang backend server
   */
  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/outlets`,
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
   * Fetch all outlets dynamically from Golang backend API.
   * If server is unreachable or timeout > 3000ms, marks isLive: false.
   */
  async getAll(): Promise<{ data: Outlet[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/outlets`,
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

      const resJson: BackendResponse<Outlet[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list.length > 0 ? list : initialOutlets,
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
   * Fetch single outlet by ID from Golang backend API
   */
  async getById(
    id: number,
  ): Promise<{ data: Outlet | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/outlets/${id}`,
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

      const resJson: BackendResponse<Outlet> = await response.json();
      const item = resJson.datas ?? resJson.data ?? null;
      return {
        data: item,
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
   * Create new outlet in Golang backend
   */
  async create(data: OutletFormData): Promise<Outlet> {
    const payload = {
      outlet_name: data.outlet_name.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      opening_hours: data.opening_hours.trim(),
      closing_hours: data.closing_hours.trim(),
      phone_number: data.phone_number.trim(),
      status_outlet: data.status_outlet,
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/outlets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      5000,
    );

    if (!response.ok) {
      let errMsg = `Gagal menyimpan outlet (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    const resJson: BackendResponse<Outlet> = await response.json();
    return resJson.datas ?? resJson.data ?? ({} as Outlet);
  },

  /**
   * Update existing outlet in Golang backend
   */
  async update(id: number, data: OutletFormData): Promise<Outlet> {
    const payload = {
      outlet_name: data.outlet_name.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      opening_hours: data.opening_hours.trim(),
      closing_hours: data.closing_hours.trim(),
      phone_number: data.phone_number.trim(),
      status_outlet: data.status_outlet,
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/outlets/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      5000,
    );

    if (!response.ok) {
      let errMsg = `Gagal memperbarui outlet (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    const resJson: BackendResponse<Outlet> = await response.json();
    return resJson.datas ?? resJson.data ?? ({} as Outlet);
  },

  /**
   * Delete outlet by ID
   */
  async delete(id: number): Promise<boolean> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/outlets/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      5000,
    );

    if (!response.ok) {
      throw new Error(`Gagal menghapus outlet (${response.status})`);
    }

    return true;
  },
};
