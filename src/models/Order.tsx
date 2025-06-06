
export interface Order {
  id: number;
  date_order: Date;
  date_start: Date;
  date_end: Date;
  vendor: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  content: string;
  total?: number;
}