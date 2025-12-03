"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../payments/data-table"
import { Button } from "@/components/ui/button"
import { useUserStore, User } from "./user-store"
import { toast, Toaster } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

const columns = (onEdit: (user: User) => void, onDelete: (userID: string) => void, isAdmin: boolean): ColumnDef<User>[] => [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Gender",
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

export function UserTable() {
  const { users, loading, pagination, fetchUsers, addUser, updateUser, deleteUser } = useUserStore()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' //check if admin
  const [showForm, setShowForm] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    fetchUsers(1)
  }, [])

  const handlePageChange = (page: number) => {
    fetchUsers(page)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userID: string) => {
    try {
      await deleteUser(userID)
      toast.success('User deleted successfully')
      fetchUsers(pagination?.page || 1)
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      age: parseInt(formData.get('age') as string) || undefined,
      gender: formData.get('gender') as string || undefined,
    }

    console.log('Submitting user data:', userData)

    try {
      if (editingUser) {
        await updateUser(editingUser._id!, userData)
        toast.success('User updated successfully')
      } else {
        await addUser(userData)
        toast.success('User added successfully')
      }
      setShowForm(false)
      fetchUsers(pagination?.page || 1)
    } catch (error: any) {
      console.error('Error details:', error)
      console.error('Server response:', error.response?.data)
      const errorMessage = error.response?.data?.error || 'Error saving user'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        {isAdmin && <Button onClick={handleAdd}>Add User</Button>}
      </div>
      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <>
          <DataTable columns={columns(handleEdit, handleDelete, isAdmin)} data={users} />
          
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Full Name"
                defaultValue={editingUser?.name}
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={editingUser?.email}
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="gender"
                defaultValue={editingUser?.gender || ''}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                name="age"
                type="number"
                placeholder="Age (optional)"
                defaultValue={editingUser?.age}
                className="w-full p-2 border rounded"
                min="0"
              />
              <div className="flex gap-2">
                <Button type="submit">{editingUser ? 'Update' : 'Add'}</Button>
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