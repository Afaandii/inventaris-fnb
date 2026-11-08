export type StatusOutlet = 'active' | 'inactive' | 'renovation' | 'closed';

export interface Outlet {
  id_outlet: number;
  outlet_code: string;
  outlet_name: string;
  address: string;
  city: string;
  opening_hours: string; // Format "15:04" e.g. "08:00"
  closing_hours: string; // Format "15:04" e.g. "22:00"
  phone_number: string;
  status_outlet: StatusOutlet;
  created_at: string;
  updated_at: string;
}

export interface OutletFormData {
  outlet_name: string;
  address: string;
  city: string;
  opening_hours: string;
  closing_hours: string;
  phone_number: string;
  status_outlet: StatusOutlet;
}
