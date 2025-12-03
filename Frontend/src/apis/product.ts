import api from '../libs/axios'

export interface Product {
  _id?: string
  name: string
  description?: string
  price: number
  category?: string
  image?: string
  stock: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductData {
  name: string
  description?: string
  price: number
  category?: string
  image?: string
  stock: number
}

export const productApi = {
  getProducts: (page = 1, limit = 10) => 
    api.get<{ products: Product[]; pagination: any }>(`/products?page=${page}&limit=${limit}`),
  
  createProduct: (data: ProductData) => 
    api.post<Product>('/products', data),
  
  updateProduct: (id: string, data: Partial<ProductData>) => 
    api.put<Product>(`/products/${id}`, data),
  
  deleteProduct: (id: string) => 
    api.delete(`/products/${id}`)
}