import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
}

interface POSState {
  inventory: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'barcode'>>) => void;
  addToCart: (barcode: string) => boolean; // returns true if found
  removeFromCart: (barcode: string) => void;
  updateQuantity: (barcode: string, delta: number) => void;
  checkout: () => void;
  clearCart: () => void;
}

// Initial mock data
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Leche 1L', price: 2.5, barcode: '7701234567890', stock: 10 },
  { id: '2', name: 'Pan Tajado', price: 1.8, barcode: '7709876543210', stock: 5 },
  { id: '3', name: 'Café 500g', price: 5.2, barcode: '7705554443332', stock: 20 },
];

export const useStore = create<POSState>()(
  persist(
    (set, get) => ({
      inventory: MOCK_PRODUCTS,
      cart: [],
      transactions: [],

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          inventory: [...state.inventory, newProduct],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          // Also update cart if the product is there
          cart: state.cart.map((item) => {
            const product = state.inventory.find(p => p.id === id);
            if (product && item.barcode === product.barcode) {
              return { ...item, ...updates };
            }
            return item;
          })
        }));
      },

      addToCart: (barcode) => {
        const product = get().inventory.find((p) => p.barcode === barcode);
        if (!product) return false;

        if ((product.stock ?? 0) <= 0) {
          toast.error('Producto sin stock', {
            description: product.name
          });
          return false;
        }

        const existingItem = get().cart.find((item) => item.barcode === barcode);
        if (existingItem && existingItem.quantity >= product.stock) {
          toast.error('No hay más stock disponible', {
            description: `Máximo: ${product.stock} unidades`
          });
          return false;
        }

        set((state) => {
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.barcode === barcode
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: 1 }],
          };
        });
        return true;
      },

      removeFromCart: (barcode) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.barcode !== barcode),
        }));
      },

      updateQuantity: (barcode, delta) => {
        const product = get().inventory.find((p) => p.barcode === barcode);
        
        set((state) => {
          const item = state.cart.find((i) => i.barcode === barcode);
          if (item && delta > 0 && product && item.quantity >= product.stock) {
            toast.error('No hay más stock disponible');
            return state;
          }

          return {
            cart: state.cart
              .map((item) =>
                item.barcode === barcode
                  ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                  : item
              )
              .filter((item) => item.quantity > 0),
          };
        });
      },

      checkout: () => {
        const { cart, inventory } = get();
        if (cart.length === 0) return;

        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          items: [...cart],
          total,
          timestamp: Date.now(),
        };

        // Update stock in inventory
        const newInventory = inventory.map(p => {
          const cartItem = cart.find(item => item.barcode === p.barcode);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          inventory: newInventory,
          cart: [],
        }));
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'pos-storage',
    }
  )
);
