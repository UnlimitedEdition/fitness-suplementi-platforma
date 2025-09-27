import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Gift
} from 'lucide-react'
import { toast } from 'sonner'

export function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  
  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal - discount + shipping

  const handleApplyPromo = () => {
    // Simple promo code logic
    const validCodes: Record<string, number> = {
      'WELCOME10': 10,
      'FITNESS20': 20,
      'NEWBIE15': 15
    }
    
    if (validCodes[promoCode.toUpperCase()]) {
      const discountAmount = (subtotal * validCodes[promoCode.toUpperCase()]) / 100
      setDiscount(discountAmount)
      toast.success(`Promo kod je primenjen! Popust: ${discountAmount.toFixed(2)}€`)
    } else {
      toast.error('Nevažeći promo kod')
    }
  }

  const handleCheckout = () => {
    if (!user) {
      toast.error('Molimo prijavite se pre nastavka kupovine')
      navigate('/login')
      return
    }
    
    if (items.length === 0) {
      toast.error('Vaša korpa je prazna')
      return
    }
    
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <ShoppingCart className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vaša korpa je prazna
          </h2>
          <p className="text-gray-600 mb-6">
            Dodajte proizvode u korpu da biste nastavili sa kupovinom
          </p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nastavi kupovinu
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nastavi kupovinu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Korpa za kupovinu
          </h1>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} {getTotalItems() === 1 ? 'proizvod' : 'proizvoda'} u korpi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Proizvodi u korpi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.product_id}>
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.product_image_url || '/placeholder-product.jpg'}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cena: {item.price.toFixed(2)}€
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Total Price */}
                      <div className="text-lg font-semibold text-gray-900 w-20 text-right">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {index < items.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Promo kod
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Unesite promo kod"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleApplyPromo}>
                    Primeni
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Popust primenjen: -{discount.toFixed(2)}€
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rezime narudžbine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ukupno ({getTotalItems()} proizvoda)</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Popust</span>
                    <span>-{discount.toFixed(2)}€</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Dostava</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'Besplatno' : `${shipping.toFixed(2)}€`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-sm text-gray-600">
                    Još {(50 - subtotal).toFixed(2)}€ do besplatne dostave
                  </p>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Ukupno</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Nastavi sa plaćanjem
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Bezbedna plaćanja putem Stripe
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Bezbedna plaćanja</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>30 dana za povraćaj</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Originalni proizvodi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}