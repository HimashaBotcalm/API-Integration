"use client"

import * as React from "react"
import { useUserStore, User } from "../user/user-store"
import { useAuth } from "../contexts/AuthContext"
import { useAuthMonitor } from "../hooks/useAuthMonitor"
import { Layout } from "./layout"
import { ProductTable } from "../product/product-table"
import { UserTable } from "../user/user-table"
import { DummyProductTable } from "../components/DummyProductTable"
import { Profile } from "./profile"


interface Product {
  id: number
  title: string
  price: number
  category: string
  stock: number
  rating: number
}

const PieChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="flex items-center space-x-4">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="20" />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const strokeDasharray = `${percentage * 3.14} 314`
          const strokeDashoffset = -cumulativePercentage * 3.14
          cumulativePercentage += percentage
          return (
            <circle
              key={index}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={colors[index]}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          )
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index] }}></div>
            <span className="text-sm">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { users } = useUserStore()
  const { logout } = useAuth()
  const [products, setProducts] = React.useState<Product[]>([])
  const [currentView, setCurrentView] = React.useState('dashboard')

  // Monitor for token deletion and auto-logout
  useAuthMonitor(() => {
    logout()
  })

  React.useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error('Error loading products:', err))
  }, [])

  const totalUsers = users.length
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const avgRating = products.length > 0 ? products.reduce((sum, product) => sum + product.rating, 0) / products.length : 0

  const categoryData = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(categoryData).slice(0, 5).map(([label, value]) => ({ label, value }))
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  const stockLevels = [
    { label: 'Low Stock', value: products.filter(p => p.stock < 20).length },
    { label: 'Medium Stock', value: products.filter(p => p.stock >= 20 && p.stock < 50).length },
    { label: 'High Stock', value: products.filter(p => p.stock >= 50).length }
  ]

  const handleNavigate = (view: string) => {
    setCurrentView(view)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'products':
        return <ProductTable />
      case 'users':
        return <UserTable />
      case 'dummy-products':
        return <DummyProductTable />
      case 'profile':
        return <Profile />
      default:
        return (
          <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Products</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
            </div>
            <div className="text-4xl opacity-80">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Inventory Value</p>
              <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg Rating</p>
              <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
            </div>
            <div className="text-4xl opacity-80">⭐</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-6">Products by Category</h3>
          {pieData.length > 0 ? (
            <PieChart data={pieData} colors={colors} />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">Loading chart...</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-6">Stock Levels</h3>
          {stockLevels.some(s => s.value > 0) ? (
            <PieChart data={stockLevels} colors={['#ef4444', '#f59e0b', '#10b981']} />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">No stock data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-6">Recent Users</h3>
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.slice(-5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.name[0]}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No users yet</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-6">Top Rated Products</h3>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium truncate">{product.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          )}
        </div>
      </div>
    </div>
        )
    }
  }

  return (
    <Layout onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  )
}