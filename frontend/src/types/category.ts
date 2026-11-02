export type CategoryType = 'ingredient' | 'product' | 'menu';
export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id_category: number;
  parent_id: number | null;
  category_name: string;
  slug: string;
  type: CategoryType;
  description: string;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  parent_id: number | null;
  category_name: string;
  slug: string;
  type: CategoryType;
  description: string;
  status: CategoryStatus;
}
