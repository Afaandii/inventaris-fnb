export type TypeWirehouse = 'main' | 'kitchen' | 'bar' | 'storage';
export type StatusWirehouse = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface ManagerUser {
  id_user: number;
  name: string;
  username: string;
  email: string;
  phone_number?: string;
  role_id?: number;
}

export interface WirehouseOutlet {
  id_outlet: number;
  outlet_code: string;
  outlet_name: string;
  address?: string;
  city?: string;
  phone_number?: string;
}

export interface Wirehouse {
  id_wirehouse: number;
  outlet_id: number;
  manager_id: number | null;
  wirehouse_code: string;
  wirehouse_name: string;
  address: string;
  city: string;
  phone_number: string | null;
  type: TypeWirehouse;
  status: StatusWirehouse;
  created_at: string;
  updated_at: string;
  Outlet?: WirehouseOutlet;
  User?: ManagerUser;
}

export interface WirehouseFormData {
  outlet_id: number;
  manager_id: number;
  wirehouse_name: string;
  address: string;
  city: string;
  phone_number: string;
  type: TypeWirehouse;
  status: StatusWirehouse;
}
