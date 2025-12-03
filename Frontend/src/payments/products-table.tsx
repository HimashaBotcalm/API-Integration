"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./data-table"


interface Product {
  id: number
  title: string
  price: number
  category: string
  brand: string
  stock: number
  rating: number
  description?: string
  thumbnail?: string
}

const columns = (onView: (product: Product) => void): ColumnDef<Product>[] => [
  {
    accessorKey: "title",
    header: "Product",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.getValue("price")}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => `${row.getValue("rating")}/5`,
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => (
      <button
        onClick={() => onView(row.original)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>
    ),
  },
]

export function ProductsTable() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  React.useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => {
        console.log('Products loaded:', data.products?.length)
        setProducts(data.products)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading products:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading products...</div>
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
  }

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns(handleView)} data={products} />
      
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{selectedProduct.title}</h2>
            {selectedProduct.thumbnail && (
              <img src={selectedProduct.thumbnail} alt={selectedProduct.title} className="w-full h-48 object-cover mb-4 rounded" />
            )}
            <p className="mb-2"><strong>Category:</strong> {selectedProduct.category}</p>
            <p className="mb-2"><strong>Brand:</strong> {selectedProduct.brand}</p>
            <p className="mb-2"><strong>Price:</strong> ${selectedProduct.price}</p>
            <p className="mb-2"><strong>Stock:</strong> {selectedProduct.stock}</p>
            <p className="mb-2"><strong>Rating:</strong> {selectedProduct.rating}/5</p>
            {selectedProduct.description && (
              <p className="mb-4"><strong>Description:</strong> {selectedProduct.description}</p>
            )}
            <button
              onClick={() => setSelectedProduct(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}