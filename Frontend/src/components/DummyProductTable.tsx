"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../payments/data-table"

interface DummyProduct {
  id: number
  title: string
  price: number
  category: string
  stock: number
  rating: number
  thumbnail: string
}

const columns: ColumnDef<DummyProduct>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.getValue("price")}`,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => `${row.getValue("rating")} ⭐`,
  },
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: ({ row }) => (
      <img 
        src={row.getValue("thumbnail")} 
        alt="Product" 
        className="w-10 h-10 object-cover rounded" 
      />
    ),
  },
]

export function DummyProductTable() {
  const [products, setProducts] = React.useState<DummyProduct[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading products:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dummy Products</h1>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading products...</div>
      ) : (
        <DataTable columns={columns} data={products} />
      )}
    </div>
  )
}