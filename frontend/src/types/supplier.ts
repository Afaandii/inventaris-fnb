export type StatusSupplier = 'active' | 'inactive';

export interface Supplier {
  id_supplier: number;
  npwp: string;
  supplier_code: string;
  supplier_name: string;
  email: string;
  address: string;
  city: string;
  contact_person: string;
  bank_account: string;
  notes: string;
  status_supplier: StatusSupplier;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  npwp: string;
  supplier_name: string;
  email: string;
  address: string;
  city: string;
  contact_person: string;
  bank_account: string;
  notes: string;
  status_supplier: StatusSupplier;
}
