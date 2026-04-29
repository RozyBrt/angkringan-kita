export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'served' 
  | 'cancelled';

export interface Order {
  id: string | number;
  table_number: string | null;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  confirmed_at?: string | null;
  preparing_at?: string | null;
  ready_at?: string | null;
  served_at?: string | null;
  note?: string | null;
  total_price?: number;
  order_code?: string;
  payment_status: 'unpaid' | 'paid';
  payment_method?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: string | number;
  menu_item_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
  menu_items?: {
    id: string | number;
    name: string;
    price: number;
    image_url?: string | null;
    [key: string]: unknown;
  };
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
