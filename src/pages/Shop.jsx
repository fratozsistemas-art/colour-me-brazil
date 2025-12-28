import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Star, Filter, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/shop/ProductCard';
import Cart from '../components/shop/Cart';
import { createPageUrl } from '../utils';

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setCurrentUser(user);
          
          const profiles = await base44.entities.ShopUserProfile.filter({ 
            user_id: user.id 
          });
          setShopProfile(profiles[0] || null);
        }
      } catch (error) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const addToCart = (product, selectedSize = null) => {
    const cartItem = {
      ...product,
      selectedSize,
      cartId: `${product.id}-${selectedSize || 'default'}`
    };
    
    const existing = cart.find(item => item.cartId === cartItem.cartId);
    if (existing) {
      setCart(cart.map(item => 
        item.cartId === cartItem.cartId 
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...cartItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
    } else {
      setCart(cart.map(item => 
        item.cartId === cartId ? { ...item, quantity } : item
      ));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_pt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.design_theme?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Products', emoji: '🛍️' },
    { id: 't-shirt', name: 'T-Shirts', emoji: '👕' },
    { id: 'mug', name: 'Mugs', emoji: '☕' },
    { id: 'notebook', name: 'Notebooks', emoji: '📓' },
    { id: 'poster', name: 'Posters', emoji: '🖼️' }
  ];

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header with Greeting */}
      <div className="mb-8 flex items-start justify-between">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {currentUser ? `Welcome back, ${shopProfile?.display_name || currentUser.full_name || 'there'}! 👋` : 'Brazilian Culture Shop 🇧🇷'}
          </h1>
          <p className="text-lg" style={{ color: '#6C757D' }}>
            Aquarela designs featuring Brazilian folklore and fauna
          </p>
        </div>
        {currentUser && (
          <Button
            variant="outline"
            onClick={() => window.location.href = createPageUrl('ProfileSettings')}
            className="flex items-center gap-2"
          >
            {shopProfile?.avatar_url ? (
              <img
                src={shopProfile.avatar_url}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            Profile
          </Button>
        )}
      </div>

      {/* Search and Cart */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowCart(true)}
          className="relative"
          style={{ 
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
            color: '#FFFFFF'
          }}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#FFD23F', color: '#1A2332' }}>
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
              style={selectedCategory === category.id ? {
                background: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
                color: '#FFFFFF',
                border: 'none'
              } : {}}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B35' }}></div>
          <p className="mt-4" style={{ color: '#6C757D' }}>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2332' }}>No products found</h3>
          <p style={{ color: '#6C757D' }}>Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}