import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { CartPage } from '@/pages/CartPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Routes with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              
              {/* Protected routes */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              
              {/* Client routes */}
              <Route path="/my-sessions" element={
                <ProtectedRoute roles={['client']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Moji Treninzi</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/progress" element={
                <ProtectedRoute roles={['client']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Moj Napredak</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute roles={['client']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Moje Narudžbine</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Trainer routes */}
              <Route path="/trainer/*" element={
                <ProtectedRoute roles={['trainer']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Trenerski Panel</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Gym admin routes */}
              <Route path="/gym/*" element={
                <ProtectedRoute roles={['gym_admin']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Gym Admin Panel</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Store admin routes */}
              <Route path="/store/*" element={
                <ProtectedRoute roles={['store_admin']}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Store Admin Panel</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Profile routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Profil</h1>
                    <p className="text-gray-600 mt-2">Ova stranica je u razvoju...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
