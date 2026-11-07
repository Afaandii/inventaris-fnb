import type {
  Ingredient,
  IngredientFormData,
  Unit,
  Supplier,
} from '@/types/ingredient';
import {
  initialIngredients,
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

export const ingredientService = {
  /**
   * Fetch all ingredients dynamically from Golang backend API.
   * If backend is not available, falls back gracefully to initial mock data.
   */
  async getAll(): Promise<{ data: Ingredient[]; isLive: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Ingredient[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];

      return {
        data: list.length > 0 ? list : initialIngredients,
        isLive: true,
      };
    } catch {
      return {
        data: initialIngredients,
        isLive: false,
      };
    }
  },

  /**
   * Fetch single ingredient by ID
   */
  async getById(id: number): Promise<Ingredient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Ingredient> = await response.json();
      return resJson.datas ?? resJson.data ?? null;
    } catch {
      const found = initialIngredients.find((i) => i.id_ingredient === id);
      return found ?? null;
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

    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
   * Update existing ingredient
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

    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal menghapus bahan baku (${response.status})`);
    }

    return true;
  },

  /**
   * Fetch units for dropdown options
   */
  async getUnits(): Promise<Unit[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/units`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error();
      const resJson: BackendResponse<Unit[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];
      return list.length > 0 ? list : initialUnits;
    } catch {
      return initialUnits;
    }
  },

  /**
   * Fetch suppliers for dropdown options
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error();
      const resJson: BackendResponse<Supplier[]> = await response.json();
      const list = resJson.datas ?? resJson.data ?? [];
      return list.length > 0 ? list : initialSuppliers;
    } catch {
      return initialSuppliers;
    }
  },
};
