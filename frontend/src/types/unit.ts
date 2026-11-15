export type TypeUnit = 'weight' | 'volume' | 'count' | 'package';
export type StatusUnit = 'active' | 'inactive';

export interface Unit {
  id_unit: number;
  unit_code: string;
  unit_name: string;
  type: TypeUnit;
  short_name: string;
  status?: StatusUnit;
  status_unit?: StatusUnit;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitFormData {
  unit_name: string;
  type: TypeUnit;
  short_name: string;
  is_active: boolean;
}
