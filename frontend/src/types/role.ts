export interface Role {
  id_role: number;
  role_name: string;
  display_name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormData {
  role_name: string;
  display_name: string;
  description: string;
}
