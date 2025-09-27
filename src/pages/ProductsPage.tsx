import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, Product, ProductCategory } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const { addToCart } = useCart()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [searchTerm, selectedCategory, priceRange, sortBy])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Greška pri učitavanju proizvoda')
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = async () => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')

    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
    }

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory)
    }

    query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating_average', { ascending: false })
        break
      case 'popularity':
        query = query.order('rating_count', { ascending: false })
        break
      default:
        query = query.order('name')
    }

    try {
      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error filtering products:', error)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.sale_price || product.price,
      quantity: 1,
      product_image_url: product.image_urls[0] || null
    })
    toast.success(`${product.name} dodano u korpu!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje proizvoda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Fitness Suplementi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Otkrijte naš širok asortiman kvalitetnih suplemenata za sve vaše fitness potrebe
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:w-80 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filteri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Pretraga
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Pretražite proizvode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Kategorija
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite kategoriju" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve kategorije</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Cena: {priceRange[0]}€ - {priceRange[1]}€
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Featured Brands */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Popularne marke</h4>
                  <div className="space-y-2">
                    {['Optimum Nutrition', 'BSN', 'Dymatize', 'Scitec'].map((brand) => (
                      <Button
                        key={brand}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => setSearchTerm(brand)}
                      >
                        {brand}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filteri
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    {products.length} proizvoda
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none border-l-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sortiraj po" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Naziv A-Z</SelectItem>
                      <SelectItem value="price_asc">Cena: niska → visoka</SelectItem>
                      <SelectItem value="price_desc">Cena: visoka → niska</SelectItem>
                      <SelectItem value="rating">Najbolje ocenjeno</SelectItem>
                      <SelectItem value="popularity">Najpopularnije</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nema pronađenih proizvoda
                </h3>
                <p className="text-gray-600">
                  Probajte da promenite filtere za pretragu
                </p>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}>
                {products.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ) : (
                    <ProductListItem key={product.id} product={product} onAddToCart={handleAddToCart} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAddToCart }: {
  product: Product
  onAddToCart: (product: Product) => void
}) {
  const currentPrice = product.sale_price || product.price
  const hasDiscount = product.sale_price && product.sale_price < product.price

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.image_urls[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            -{Math.round(((product.price - currentPrice) / product.price) * 100)}%
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-green-600">
            Izdvojeno
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {product.brand && (
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.brand}
              </p>
            )}
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h3>
          </div>
        </div>
        
        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(product.rating_average) 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.rating_count})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {currentPrice.toFixed(2)}€
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.price.toFixed(2)}€
              </span>
            )}
          </div>
          
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Samo {product.stock_quantity} ostalo
            </Badge>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => onAddToCart(product)}
          disabled={product.stock_quantity === 0}
        >
          {product.stock_quantity === 0 ? (
            'Nema na stanju'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Dodaj u korpu
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function ProductListItem({ product, onAddToCart }: {
  product: Product
  onAddToCart: (product: Product) => void
}) {
  const currentPrice = product.sale_price || product.price
  const hasDiscount = product.sale_price && product.sale_price < product.price

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={product.image_urls[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {product.brand && (
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {product.brand}
                  </p>
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {product.name}
                </h3>
                {product.short_description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {product.short_description}
                  </p>
                )}
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(product.rating_average) 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.rating_count})
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {currentPrice.toFixed(2)}€
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-500 line-through">
                      {product.price.toFixed(2)}€
                    </span>
                  )}
                </div>
                
                <Button 
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? (
                    'Nema na stanju'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Dodaj u korpu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}