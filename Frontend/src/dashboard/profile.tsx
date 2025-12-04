"use client"

import * as React from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import api from "../libs/axios"

export function Profile() {
  const { user, logout } = useAuth()
  const [uploading, setUploading] = React.useState(false)
  const [avatar, setAvatar] = React.useState(user?.avatar || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
          
          const response = await api.post('/users/profile/upload-picture', {
            image: base64
          })

          if (response.data.avatar) {
            setAvatar(response.data.avatar)
            alert('Profile picture updated successfully!')
          }
        } catch (error: any) {
          console.error('Upload error:', error)
          const errorMessage = error.response?.data?.error || 'Failed to upload image'
          alert(errorMessage)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File read error:', error)
      alert('Failed to read image file')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading user information...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border max-w-2xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">Click camera icon to upload photo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.email}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.age || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.phone || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Account Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
            <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}