import { cn } from "@/lib/utils"
import { authApi } from "@/apis/auth"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const loginData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const response = await authApi.login(loginData)
      login(response.data.user)
      alert(`Welcome back, ${response.data.user.name}!`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.'
      alert(errorMessage)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Login to your account</h2>
          <p className="text-gray-600 mt-2">
            Enter your email below to login to your account
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <input 
              id="password"
              name="password" 
              type="password" 
              className="w-full p-2 border rounded-md"
              required 
            />
          </div>
          <div className="space-y-2">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" className="w-full border border-gray-300 p-2 rounded-md hover:bg-gray-50">
              Login with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
