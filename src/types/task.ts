export interface Task {
  id: string;
  customer_id: string;
  title: string;
  description?: string;
  due_date: Date;
  completed: boolean;
  created_by: string;
  created_at: Date;
}