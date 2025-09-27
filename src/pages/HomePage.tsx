import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import {
  Activity,
  Users,
  Calendar,
  Store,
  TrendingUp,
  Award,
  ShoppingCart,
  Dumbbell,
  Target,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function HomePage() {
  const { user, profile, roles } = useAuth()
  
  const currentUserRoles = roles.map(r => r.role)
  const isClient = currentUserRoles.includes('client')
  const isTrainer = currentUserRoles.includes('trainer')
  const isGymAdmin = currentUserRoles.includes('gym_admin')
  const isStoreAdmin = currentUserRoles.includes('store_admin')

  if (!user) {
    return <PublicHomePage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                Dobro došli, {profile?.full_name || 'Korisniče'}!
              </h1>
              <p className="text-xl text-green-100 mt-2">
                Vaša fitness i suplementi platforma
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30"
                >
                  {profile?.priority_level?.toUpperCase() || 'BASIC'} Član
                </Badge>
                <Badge 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/30"
                >
                  {profile?.membership_level || 'standard'} membership
                </Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {profile?.total_spent?.toFixed(0) || '0'}€
                </div>
                <div className="text-sm text-green-100">Ukupno potrošeno</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client Dashboard */}
            {isClient && <ClientDashboard />}
            
            {/* Trainer Dashboard */}
            {isTrainer && <TrainerDashboard />}
            
            {/* Gym Admin Dashboard */}
            {isGymAdmin && <GymAdminDashboard />}
            
            {/* Store Admin Dashboard */}
            {isStoreAdmin && <StoreAdminDashboard />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions roles={currentUserRoles} />
            <RecentActivity />
            <PromotionalBanner />
          </div>
        </div>
      </div>
    </div>
  )
}

function PublicHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-green-400">Fitness</span> &
              <br />
              <span className="text-white">Suplementi</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Kompleksna platforma koja spaja e-commerce suplemenata sa naprednim trenerskim uslugama. 
              Vaš put do boljih rezultata počinje ovde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4" asChild>
                <Link to="/register">Počnite besplatno</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-600 text-white hover:bg-white hover:text-gray-900" asChild>
                <Link to="/products">Pregledajte proizvode</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sve što vam treba na jednom mestu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Napredna platforma koja kombinuje prodaju suplemenata sa profesionalnim trenerskim uslugama
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Store className="w-8 h-8" />}
              title="E-Commerce Suplemenata"
              description="Širok asortiman kvalitetnih suplemenata sa detaljnim recenzijama i ocenama"
            />
            <FeatureCard
              icon={<Dumbbell className="w-8 h-8" />}
              title="Trenerske Usluge"
              description="Rezervišite treninge sa sertifikovanim trenerima i pratite svoj napredak"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Personalizovano Iskustvo"
              description="AI algoritmi za preporuke proizvoda i optimizaciju trening programa"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Sistem Nagrada"
              description="Zaradite poene za kupovine i aktivnost, iskoristite ih za popuste"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ClientDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Vaš Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Sledeci Trening"
          value="Danas 18:00"
          icon={<Calendar className="w-5 h-5" />}
          change="+2 ove nedelje"
          changeType="positive"
        />
        <StatsCard
          title="Aktivne Narudžbine"
          value="3"
          icon={<ShoppingCart className="w-5 h-5" />}
          change="Poslednja narudžba 2 dana"
          changeType="neutral"
        />
        <StatsCard
          title="Reward Poeni"
          value="1,247"
          icon={<Award className="w-5 h-5" />}
          change="+50 ove nedelje"
          changeType="positive"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Nedavne Narudžbine</CardTitle>
          <CardDescription>Vaše poslednje kupovine suplemenata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Whey Protein + Kreatin</h4>
                <p className="text-sm text-gray-600">Narudžba #SUP-12345</p>
              </div>
              <div className="text-right">
                <div className="font-medium">89.99€</div>
                <Badge variant="default">Isporuceno</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/orders">Pogledajte sve narudžbine</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TrainerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Trenerski Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Aktivni Klijenti"
          value="23"
          icon={<Users className="w-5 h-5" />}
          change="+3 ovaj mesec"
          changeType="positive"
        />
        <StatsCard
          title="Ocena Performansi"
          value="87/100"
          icon={<Star className="w-5 h-5" />}
          change="Visok nivo"
          changeType="positive"
        />
        <StatsCard
          title="Mesecni Prihod"
          value="2,450€"
          icon={<TrendingUp className="w-5 h-5" />}
          change="+12% vs prosli mesec"
          changeType="positive"
        />
      </div>
    </div>
  )
}

function GymAdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gym Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Ukupno Clanova"
          value="1,247"
          icon={<Users className="w-5 h-5" />}
          change="+18 ovaj mesec"
          changeType="positive"
        />
        <StatsCard
          title="Prioritetni Clanovi"
          value="89"
          icon={<Award className="w-5 h-5" />}
          change="Platina: 12, Zlato: 77"
          changeType="neutral"
        />
        <StatsCard
          title="Mesecni Prihod"
          value="45,670€"
          icon={<TrendingUp className="w-5 h-5" />}
          change="+8% vs prosli mesec"
          changeType="positive"
        />
      </div>
    </div>
  )
}

function StoreAdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Store Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Aktivni Proizvodi"
          value="342"
          icon={<Store className="w-5 h-5" />}
          change="+12 ovaj mesec"
          changeType="positive"
        />
        <StatsCard
          title="Ukupne Prodaje"
          value="23,890€"
          icon={<TrendingUp className="w-5 h-5" />}
          change="+15% vs prosli mesec"
          changeType="positive"
        />
        <StatsCard
          title="Prosecna Ocena"
          value="4.7/5"
          icon={<Star className="w-5 h-5" />}
          change="+0.2 ovaj mesec"
          changeType="positive"
        />
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, change, changeType }: {
  title: string
  value: string
  icon: React.ReactNode
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            {icon}
          </div>
        </div>
        <p className={cn(
          "text-sm mt-2",
          changeType === 'positive' && "text-green-600",
          changeType === 'negative' && "text-red-600",
          changeType === 'neutral' && "text-gray-600"
        )}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

function QuickActions({ roles }: { roles: string[] }) {
  const isClient = roles.includes('client')
  const isTrainer = roles.includes('trainer')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brze Akcije</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isClient && (
          <>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/products">
                <Store className="w-4 h-4 mr-2" />
                Kupi Suplemente
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/trainers">
                <Calendar className="w-4 h-4 mr-2" />
                Rezerviši Trening
              </Link>
            </Button>
          </>
        )}
        {isTrainer && (
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/trainer/schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Upravljaj Rasporedom
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedavna Aktivnost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium">Nova narudžba</p>
              <p className="text-xs text-gray-600">Pre 2 sata</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium">Zavrsen trening</p>
              <p className="text-xs text-gray-600">Pre 5 sati</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium">Zaradeni poeni</p>
              <p className="text-xs text-gray-600">Pre 1 dan</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PromotionalBanner() {
  return (
    <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
      <CardContent className="p-6 text-center">
        <h3 className="font-bold text-lg mb-2">Specijalna Ponuda!</h3>
        <p className="text-sm text-green-100 mb-4">
          20% popust na sve protein suplemente ovaj mesec
        </p>
        <Button size="sm" variant="secondary" asChild>
          <Link to="/products?category=protein">
            Pogledajte ponudu
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}