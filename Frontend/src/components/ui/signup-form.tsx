import { cn } from "@/lib/utils"
import { authApi } from "@/apis/auth"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const signupData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'user' | 'admin',
      age: formData.get('age') ? Number(formData.get('age')) : undefined,
      gender: formData.get('gender') as string || undefined,
      phone: formData.get('phone') as string || undefined,
    }

    // Remove undefined values
    Object.keys(signupData).forEach(key => {
      if (signupData[key as keyof typeof signupData] === undefined || signupData[key as keyof typeof signupData] === '') {
        delete signupData[key as keyof typeof signupData]
      }
    })

    try {
      console.log('Sending signup data:', signupData)
      const response = await authApi.signup(signupData)
      console.log('Signup response:', response)
      login(response.data.user)
      alert(`Account created successfully! Welcome ${response.data.user.name}!`)
    } catch (error: any) {
      console.error('Full signup error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed'
      alert(`Signup Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-gray-600 mt-2">
            Enter your information below to create your account
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className="w-full p-2 border rounded-md"
              minLength={2}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password *</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Minimum 6 characters"
              className="w-full p-2 border rounded-md"
              minLength={6}
              required 
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role *</label>
            <select
              id="role"
              name="role"
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                placeholder="25"
                min="13"
                max="120"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}