import type { Category, CategoryFormData } from '@/types/category';
import { initialCategories } from '@/data/mockCategories';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface BackendResponse<T> {
  status: string;
  message: string;
  datas?: T;
  error?: unknown;
}

export const categoryService = {
  /**
   * Fetch all categories dynamically from Golang backend.
   * If backend is not available or fails, falls back gracefully to initial mock data.
   */
  async getAll(): Promise<{ data: Category[]; isLive: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson: BackendResponse<Category[]> = await response.json();
      const list = resJson.datas ?? [];

      return {
        data: list.length > 0 ? list : initialCategories,
        isLive: true,
      };
    } catch {
      // Backend server is offline or unreachable - use fallback
      return {
        data: initialCategories,
        isLive: false,
      };
    }
  },

  /**
   * Fetch single category by ID
   */
  async getById(id: number): Promise<Category | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`);
      if (!response.ok) return null;
      const resJson: BackendResponse<Category> = await response.json();
      return resJson.datas ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Create a new category in Golang backend
   */
  async create(payload: CategoryFormData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id: payload.parent_id ?? 0,
        category_name: payload.category_name,
        type: payload.type,
        description: payload.description,
        status: payload.status,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    const resJson: BackendResponse<Category> = await response.json();
    if (!resJson.datas) {
      throw new Error('No category data returned by backend');
    }

    return resJson.datas;
  },

  /**
   * Update category in Golang backend
   */
  async update(id: number, payload: CategoryFormData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id: payload.parent_id ?? 0,
        category_name: payload.category_name,
        type: payload.type,
        description: payload.description,
        status: payload.status,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`);
    }

    const resJson: BackendResponse<Category> = await response.json();
    if (!resJson.datas) {
      throw new Error('No category data returned by backend');
    }

    return resJson.datas;
  },

  /**
   * Delete category from Golang backend
   */
  async delete(id: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  },
};
