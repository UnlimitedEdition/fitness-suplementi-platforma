import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/ui/sonner'

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}