import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ShoppingBag, ShoppingCart, AlertTriangle, Plus, Minus, ArrowRight } from 'lucide-react';
import { getCleanImageUrl, getFallbackImage } from '../utils/imageUtils';

export interface CartItem {
  product_id: number;
  name: string;
  price_per_unit: number;
  unit: string;
  quantity: number;
  stock: number;
  image_url?: string;
}

export const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('agrisense_cart');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('agrisense_cart');
      setCart(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('cart_updated', handleSync);
    return () => window.removeEventListener('cart_updated', handleSync);
  }, []);

  const categories = ['All', 'Fertilizers', 'Seeds', 'Pesticides', 'Equipment'];

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'All' ? '/inventory/products/' : `/inventory/products/?category=${selectedCategory}`;
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('agrisense_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      updateCart(
        cart.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      updateCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price_per_unit: parseFloat(product.price_per_unit),
          unit: product.unit,
          quantity: 1,
          stock: product.stock,
          image_url: product.image_url,
        },
      ]);
    }
  };

  const removeFromCart = (productId: number) => {
    const existing = cart.find((item) => item.product_id === productId);
    if (existing && existing.quantity > 1) {
      updateCart(
        cart.map((item) =>
          item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      updateCart(cart.filter((item) => item.product_id !== productId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2C2825]">Agri Marketplace & Supplies</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Purchase certified seeds, recommended fertilizers, and irrigation equipment.
          </p>
        </div>

        <button
          onClick={() => cart.length > 0 && navigate('/checkout')}
          className="clay-button-secondary relative px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 bg-[#C86D3B] text-white hover:bg-[#9E4A20]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          <span className="font-extrabold ml-1">₹{cartTotal.toFixed(2)}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#2E6F40] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-[#6C665D] border border-[#E5E0D8] hover:bg-[#EBE7DF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6C665D]">Loading marketplace catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => {
            const inCart = cart.find((item) => item.product_id === p.id);

            return (
              <ClayCard key={p.id} className="p-5 flex flex-col justify-between space-y-4 overflow-hidden group">
                <div>
                  {/* Product Image Banner */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#F5F3EE] border border-[#E5E0D8] mb-3">
                    <img
                      src={getCleanImageUrl(p.image_url, p.name || p.category)}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(p.name || p.category);
                      }}
                    />

                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2C2825]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/20">
                        {p.category}
                      </span>
                    </div>

                    {p.is_low_stock && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-[#2C2825] leading-snug">{p.name}</h3>
                  <p className="text-xs text-[#6C665D] mt-1 line-clamp-2">{p.description}</p>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#2E6F40]">₹{p.price_per_unit}</span>
                      <span className="text-xs text-[#6C665D] font-semibold"> / {p.unit}</span>
                    </div>
                    <span className="text-xs font-bold text-[#6C665D]">Stock: {p.stock}</span>
                  </div>
                </div>

                {/* Cart Buttons */}
                <div className="pt-3 border-t border-[#E5E0D8]">
                  {inCart ? (
                    <div className="flex items-center justify-between bg-[#F5F3EE] p-1.5 rounded-xl border border-[#E5E0D8]">
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2C2825] hover:bg-[#EBE7DF]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-[#2C2825] px-2">
                        {inCart.quantity} in Cart
                      </span>
                      <button
                        onClick={() => addToCart(p)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2C2825] hover:bg-[#EBE7DF]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <ClayButton
                      className="w-full bg-[#2E6F40] hover:bg-[#1E5128]"
                      size="sm"
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      icon={<ShoppingBag className="w-4 h-4" />}
                    >
                      {p.stock > 0 ? 'Add to Order Cart' : 'Out of Stock'}
                    </ClayButton>
                  )}
                </div>
              </ClayCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
