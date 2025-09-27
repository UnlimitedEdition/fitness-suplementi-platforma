import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  User,
  Calendar,
  Activity,
  Store,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const { user, profile, roles, signOut } = useAuth()
  const location = useLocation()
  
  const currentUserRoles = roles.map(r => r.role)
  const isClient = currentUserRoles.includes('client')
  const isTrainer = currentUserRoles.includes('trainer')
  const isGymAdmin = currentUserRoles.includes('gym_admin')
  const isStoreAdmin = currentUserRoles.includes('store_admin')

  // Client navigation items
  const clientNavItems = [
    { name: 'Proizvodi', href: '/products', icon: Store },
    { name: 'Moji Treninzi', href: '/my-sessions', icon: Calendar },
    { name: 'Napredak', href: '/progress', icon: Activity },
    { name: 'Narudžbine', href: '/orders', icon: ShoppingCart },
  ]

  // Trainer navigation items
  const trainerNavItems = [
    { name: 'Moji Klijenti', href: '/trainer/clients', icon: Users },
    { name: 'Rasporedo', href: '/trainer/schedule', icon: Calendar },
    { name: 'Performanse', href: '/trainer/performance', icon: Activity },
    { name: 'Prihodi', href: '/trainer/earnings', icon: Store },
  ]

  // Gym admin navigation items
  const gymNavItems = [
    { name: 'Prioritetni Članovi', href: '/gym/priority-members', icon: Users },
    { name: 'Analitika', href: '/gym/analytics', icon: Activity },
    { name: 'Treneri', href: '/gym/trainers', icon: User },
    { name: 'Finansije', href: '/gym/finances', icon: Store },
  ]

  // Store admin navigation items
  const storeNavItems = [
    { name: 'Proizvodi', href: '/store/products', icon: Store },
    { name: 'Narudžbine', href: '/store/orders', icon: ShoppingCart },
    { name: 'Kupci', href: '/store/customers', icon: Users },
    { name: 'Popusti', href: '/store/promotions', icon: Activity },
  ]

  const getRoleNavItems = () => {
    const items = []
    if (isClient) items.push(...clientNavItems)
    if (isTrainer) items.push(...trainerNavItems)
    if (isGymAdmin) items.push(...gymNavItems)
    if (isStoreAdmin) items.push(...storeNavItems)
    return items
  }

  const getPriorityBadge = () => {
    if (!profile) return null
    
    const badgeVariants = {
      basic: 'secondary',
      bronze: 'outline',
      silver: 'default',
      gold: 'destructive',
      platinum: 'destructive'
    } as const
    
    const badgeColors = {
      basic: 'text-gray-600',
      bronze: 'text-orange-600',
      silver: 'text-gray-500',
      gold: 'text-yellow-600',
      platinum: 'text-purple-600'
    }
    
    return (
      <Badge 
        variant={badgeVariants[profile.priority_level] || 'secondary'}
        className={cn('text-xs', badgeColors[profile.priority_level])}
      >
        {profile.priority_level.toUpperCase()}
      </Badge>
    )
  }

  return (
    <nav className={cn('bg-slate-900 text-white border-b border-green-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-green-400">FitSupp</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pretraži proizvode, trenere..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Shopping Cart */}
                {isClient && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/cart" className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-xs rounded-full flex items-center justify-center">
                        0
                      </span>
                    </Link>
                  </Button>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-green-600">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'Korisnik'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getPriorityBadge()}
                          <Badge variant="outline" className="text-xs">
                            {profile?.membership_level}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Role-based navigation */}
                    {getRoleNavItems().map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link 
                            to={item.href} 
                            className={cn(
                              'flex items-center space-x-2 w-full',
                              location.pathname === item.href && 'bg-green-100'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Podešavanja</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Odjavi se</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Prijava</Link>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link to="/register">Registracija</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pb-3 space-y-1">
            {user && getRoleNavItems().map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                    location.pathname === item.href
                      ? 'bg-green-700 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}