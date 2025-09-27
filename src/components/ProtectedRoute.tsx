import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, roles: userRoles } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Proverava se autentifikacija...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required roles
  if (roles && roles.length > 0) {
    const userRoleNames = userRoles.map(r => r.role)
    const hasRequiredRole = roles.some(role => userRoleNames.includes(role as 'client' | 'trainer' | 'gym_admin' | 'store_admin'))
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nemate dozvolu
            </h2>
            <p className="text-gray-600">
              Nemate potrebnu dozvolu za pristup ovoj stranici.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}