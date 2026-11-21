export type StatusUser = "active" | "inactive" | "suspended" | "banned";

export interface User {
  id_user: number;
  role_id: number;
  outlet_id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone_number?: string | null;
  last_login?: string | null;
  avatar?: string | null;
  status: StatusUser;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;

  // Joined / Display Helper Relations
  role_name?: string;
  display_role_name?: string;
  outlet_name?: string;
}

export interface UserFormData {
  role_id: number;
  outlet_id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone_number: string;
  last_login?: string;
  avatar?: string;
  status: StatusUser;
  is_active: boolean;
}
