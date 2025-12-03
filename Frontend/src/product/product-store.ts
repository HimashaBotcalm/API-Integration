import { create } from 'zustand'
import { productApi, Product, ProductData } from '../apis/product'

interface ProductStore {
  products: Product[]
  loading: boolean
  pagination: any
  fetchProducts: (page?: number) => Promise<void>
  addProduct: (data: ProductData) => Promise<void>
  updateProduct: (id: string, data: Partial<ProductData>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  pagination: null,

  fetchProducts: async (page = 1) => {
    set({ loading: true })
    try {
      const response = await productApi.getProducts(page)
      set({ 
        products: response.data.products, 
        pagination: response.data.pagination,
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      set({ loading: false })
    }
  },

  addProduct: async (data: ProductData) => {
    try {
      console.log('Store: Adding product with data:', data)
      const response = await productApi.createProduct(data)
      console.log('Store: Product created successfully:', response.data)
      // Refresh the products list
      const { fetchProducts } = get()
      await fetchProducts()
    } catch (error: any) {
      console.error('Store: Error adding product:', error)
      throw error // Re-throw to be handled by the component
    }
  },

  updateProduct: async (id: string, data: Partial<ProductData>) => {
    try {
      console.log('Store: Updating product with data:', data)
      const response = await productApi.updateProduct(id, data)
      console.log('Store: Product updated successfully:', response.data)
      // Refresh the products list
      const { fetchProducts } = get()
      await fetchProducts()
    } catch (error: any) {
      console.error('Store: Error updating product:', error)
      throw error // Re-throw to be handled by the component
    }
  },

  deleteProduct: async (id: string) => {
    await productApi.deleteProduct(id)
    // Refresh the products list
    const { fetchProducts } = get()
    await fetchProducts()
  }
}))

export type { Product }