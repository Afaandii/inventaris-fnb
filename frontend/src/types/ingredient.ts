export interface Ingredient {
  id_ingredient: number;
  category_id: number;
  unit_id: number;
  supplier_id: number | null;
  ingre_code: string;
  ingre_name: string;
  sku: string | null;
  barcode: string | null;
  min_stok: number;
  max_stok: number | null;
  cost_price: number;
  average_cost: number;
  is_perishable: boolean;
  shelf_life_day: number | null;
  status_ingredient: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relational display helper fields
  category_name?: string;
  unit_name?: string;
  unit_symbol?: string;
  supplier_name?: string;
}

export interface IngredientFormData {
  category_id: number;
  unit_id: number;
  supplier_id: number | null;
  ingre_name: string;
  sku: string;
  barcode: string;
  min_stok: number;
  max_stok: number;
  cost_price: number;
  average_cost: number;
  is_perishable: boolean;
  shelf_life_day: number;
  status_ingredient: string;
  is_active: boolean;
}

export interface Unit {
  id_unit: number;
  unit_code: string;
  unit_name: string;
  type: string;
  short_name: string;
  status: string;
  is_active: boolean;
}

export interface Supplier {
  id_supplier: number;
  supplier_code: string;
  supplier_name: string;
  email: string;
  address: string;
  city: string;
  contact_person: string | null;
  status_supplier: string;
}
