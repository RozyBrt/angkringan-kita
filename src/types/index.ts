export type Category = 'Minuman' | 'Cemilan' | 'Makanan';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  is_track_stock: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  note: string | null;
  total_price: number;
  status: 'pending' | 'done';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  subtotal: number;
  menu_items?: MenuItem;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_items: MenuItem })[];
}

// Cart types (client-side only)
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}
