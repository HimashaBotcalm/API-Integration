"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"

const menuItems = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Users", href: "/users", icon: "👥" },
  { name: "Products", href: "/products", icon: "📦" },
  { name: "Dummy Products", href: "/dummy-products", icon: "🛍️" },
  { name: "Profile", href: "/profile", icon: "👤" },
]

interface SidebarProps {
  onNavigate: (view: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { logout, user } = useAuth()

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        {user && <p className="text-sm text-gray-300 mt-2">Welcome, {user.name}</p>}
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name.toLowerCase().replace(' ', '-'))}
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </button>
        ))}
        <button
          onClick={logout}
          className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left mt-4 border-t border-gray-700"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  )
}