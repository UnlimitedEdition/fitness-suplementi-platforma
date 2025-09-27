import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  product_image_url?: string
}

interface CartStore {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const items = get().items
        const existingItem = items.find(i => i.product_id === item.product_id)
        
        if (existingItem) {
          set({
            items: items.map(i => 
              i.product_id === item.product_id 
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            )
          })
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }]
          })
        }
      },
      
      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.product_id !== productId)
        })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set({
          items: get().items.map(item => 
            item.product_id === productId 
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)