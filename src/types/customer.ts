export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  month_decision?: Date;
  next_action_date?: Date;
  status: string;
  created_at: Date;
  created_by: string;
}