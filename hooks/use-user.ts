// hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { User, UserRole, UserWithCounts } from '@/types'
import { useAuth } from '@clerk/nextjs'

interface UpdateUserData {
  role?: UserRole
  firstName?: string
  lastName?: string
}

export function useCurrentUser() {
  const { isSignedIn } = useAuth()
  
  return useQuery<User>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await fetch('/api/users/me')
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    enabled: isSignedIn, // Only fetch when user is signed in
    retry: false,
  })
}

export function useUsers() {
  return useQuery<UserWithCounts[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user role')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}