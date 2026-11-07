import type {
  Ingredient,
  IngredientFormData,
  Unit,
  Supplier,
} from '@/types/ingredient';
import {
  initialUnits,
  initialSuppliers,
} from '@/data/mockIngredients';

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

export const ingredientService = {
  /**
   * Health/Ping check for Golang backend server
   */
  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/ingredients`,
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
   * Fetch all ingredients dynamically from Golang backend API.
   * If server is unreachable or timeout > 3000ms, marks isLive: false.
   */
  async getAll(): Promise<{ data: Ingredient[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/ingredients`,
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

      const resJson: BackendResponse<Ingredient[]> = await response.json();
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
   * Fetch single ingredient by ID from Golang backend API
   */
  async getById(
    id: number,
  ): Promise<{ data: Ingredient | null; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/ingredients/${id}`,
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

      const resJson: BackendResponse<Ingredient> = await response.json();
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
   * Create new ingredient in Golang backend
   */
  async create(data: IngredientFormData): Promise<Ingredient> {
    const payload = {
      category_id: Number(data.category_id),
      unit_id: Number(data.unit_id),
      supplier_id: Number(data.supplier_id || 1),
      ingre_name: data.ingre_name,
      sku: data.sku,
      barcode: data.barcode,
      min_stok: Number(data.min_stok),
      max_stok: Number(data.max_stok),
      cost_price: Number(data.cost_price),
      average_cost: Number(data.average_cost),
      is_perishable: Boolean(data.is_perishable),
      shelf_life_day: Number(data.shelf_life_day),
      status_ingredient: data.status_ingredient,
      is_active: Boolean(data.is_active),
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/ingredients`,
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
      let errMsg = `Gagal menyimpan bahan baku (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // use fallback errMsg
      }
      throw new Error(errMsg);
    }

    const resJson: BackendResponse<Ingredient> = await response.json();
    return resJson.datas ?? resJson.data ?? ({} as Ingredient);
  },

  /**
   * Update existing ingredient in Golang backend
   */
  async update(id: number, data: IngredientFormData): Promise<Ingredient> {
    const payload = {
      category_id: Number(data.category_id),
      unit_id: Number(data.unit_id),
      supplier_id: Number(data.supplier_id || 1),
      ingre_name: data.ingre_name,
      sku: data.sku,
      barcode: data.barcode,
      min_stok: Number(data.min_stok),
      max_stok: Number(data.max_stok),
      cost_price: Number(data.cost_price),
      average_cost: Number(data.average_cost),
      is_perishable: Boolean(data.is_perishable),
      shelf_life_day: Number(data.shelf_life_day),
      status_ingredient: data.status_ingredient,
      is_active: Boolean(data.is_active),
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/ingredients/${id}`,
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
      let errMsg = `Gagal memperbarui bahan baku (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    const resJson: BackendResponse<Ingredient> = await response.json();
    return resJson.datas ?? resJson.data ?? ({} as Ingredient);
  },

  /**
   * Delete ingredient by ID
   */
  async delete(id: number): Promise<boolean> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/ingredients/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      5000,
    );

    if (!response.ok) {
      throw new Error(`Gagal menghapus bahan baku (${response.status})`);
    }

    return true;
  },

  /**
   * Fetch units for dropdown options
   */
  async getUnits(): Promise<{ data: Unit[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/units`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        3000,
      );
      if (!response.ok) throw new Error();
      const resJson: BackendResponse<Unit[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];
      return { data: list.length > 0 ? list : initialUnits, isLive: true };
    } catch {
      return { data: [], isLive: false };
    }
  },

  /**
   * Fetch suppliers for dropdown options
   */
  async getSuppliers(): Promise<{ data: Supplier[]; isLive: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/suppliers`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        3000,
      );
      if (!response.ok) throw new Error();
      const resJson: BackendResponse<Supplier[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];
      return {
        data: list.length > 0 ? list : initialSuppliers,
        isLive: true,
      };
    } catch {
      return { data: [], isLive: false };
    }
  },
};
