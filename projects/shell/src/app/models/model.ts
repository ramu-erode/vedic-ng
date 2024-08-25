export interface Profile {
  id: number;
  name: string;
  whats_app_no: string;
  role_id: 1 | 2;
  is_active: 0 | 1;
}

export interface Student {
  id: number;
  profile_id: number;
  name: string;
  date_of_birth: Date;
  class: string;
  class_in_year: string;
  is_active:  0 | 1;
}