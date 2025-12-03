"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../payments/data-table"
import { Button } from "@/components/ui/button"
import { useProductStore, Product } from "./product-store"
import { toast, Toaster } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { uploadImage, validateImageFile } from "../utils/upload"

const columns = (onEdit: (product: Product) => void, onDelete: (productId: string) => void, isAdmin: boolean): ColumnDef<Product>[] => [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string
      return desc ? (desc.length > 50 ? desc.substring(0, 50) + "..." : desc) : "-"
    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.getValue("price")}`,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.getValue("category") || "-",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string
      return image ? (
        <img src={image} alt="Product" className="w-10 h-10 object-cover rounded" />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">No Image</div>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt || '').toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original._id!)}
            >
              Delete
            </Button>
          </>
        )}
        {!isAdmin && (
          <span className="text-sm text-gray-500">View Only</span>
        )}
      </div>
    ),
  },
]

export function ProductTable() {
  const { products, loading, pagination, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showForm, setShowForm] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string>("")

  React.useEffect(() => {
    fetchProducts(1)
  }, [])

  const handlePageChange = (page: number) => {
    fetchProducts(page)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setImagePreview("")
    setShowForm(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setImagePreview(product.image || "")
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully')
      fetchProducts(pagination?.page || 1)
    } catch (error) {
      toast.error('Error deleting product')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        validateImageFile(file)
        const base64Image = await uploadImage(file)
        setImagePreview(base64Image)
      } catch (error: any) {
        toast.error(error.message)
        e.target.value = '' // Clear the input
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string || undefined,
      stock: parseInt(formData.get('stock') as string),
      image: imagePreview || undefined,
    }

    // Validate required fields on frontend
    if (!productData.name || productData.name.trim().length < 2) {
      toast.error('Product name is required and must be at least 2 characters')
      return
    }
    
    if (isNaN(productData.price) || productData.price < 0) {
      toast.error('Valid price is required and must be positive')
      return
    }
    
    if (isNaN(productData.stock) || productData.stock < 0) {
      toast.error('Valid stock is required and must be positive')
      return
    }

    console.log('Submitting product data:', productData)
    console.log('Current user:', user)

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id!, productData)
        toast.success('Product updated successfully')
      } else {
        await addProduct(productData)
        toast.success('Product added successfully')
      }
      setShowForm(false)
      setImagePreview("")
      fetchProducts(pagination?.page || 1)
    } catch (error: any) {
      console.error('Product save error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      let errorMessage = 'Error saving product'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
        
        // If there are validation details, show them
        if (error.response.data.details) {
          if (Array.isArray(error.response.data.details)) {
            errorMessage += ': ' + error.response.data.details.join(', ')
          } else {
            errorMessage += ': ' + error.response.data.details
          }
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">User: {user?.name} ({user?.role})</span>
            {isAdmin && <Button onClick={handleAdd}>Add Product</Button>}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : (
          <>
            <DataTable columns={columns(handleEdit, handleDelete, isAdmin)} data={products} />
            
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Product Name"
                  defaultValue={editingProduct?.name}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  defaultValue={editingProduct?.description}
                  className="w-full p-2 border rounded h-20 resize-none"
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  defaultValue={editingProduct?.price}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                />
                <input
                  name="category"
                  placeholder="Category (optional)"
                  defaultValue={editingProduct?.category}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="stock"
                  type="number"
                  placeholder="Stock Quantity"
                  defaultValue={editingProduct?.stock}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingProduct ? 'Update' : 'Add'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}