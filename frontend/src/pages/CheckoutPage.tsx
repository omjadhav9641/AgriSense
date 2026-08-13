import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import type { CartItem } from './StorePage';
import { ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, Truck, PackageCheck, ShoppingBasket } from 'lucide-react';
import { getCleanImageUrl, getFallbackImage } from '../utils/imageUtils';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('agrisense_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(
    user?.address || 'Plot 14, Nashik Agricultural Zone, Maharashtra - 422003'
  );

  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const res = await apiClient.post('/orders/', {
        items,
        shipping_address: shippingAddress,
      });
      return res.data;
    },
    onSuccess: (data) => {
      // 1. Save placed order details for success screen
      setPlacedOrder(data);

      // 2. Empty cart in localStorage & dispatch event
      localStorage.removeItem('agrisense_cart');
      setCart([]);
      window.dispatchEvent(new Event('cart_updated'));

      // 3. Invalidate queries so stock & order counts refresh everywhere
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['my_orders'] });
    },
    onError: (err: any) => {
      let msg = 'Order placement failed. Please review cart item quantities and try again.';
      if (typeof err.response?.data === 'string') {
        msg = 'Server encountered an issue. Please retry placing your order.';
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data) && err.response.data[0]) {
        msg = String(err.response.data[0]);
      }
      setError(msg);
    },
  });

  // SUCCESS ORDER CONFIRMATION VIEW
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in zoom-in-95">
        <ClayCard className="p-8 text-center space-y-6 border-2 border-emerald-500/30 bg-[#FAF8F5]">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E6F40] flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#2E6F40] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed & Placed!
            </span>
            <h1 className="text-2xl font-black text-[#2C2825] mt-2">
              Thank You, {user?.first_name || user?.username}!
            </h1>
            <p className="text-xs font-semibold text-[#6C665D]">
              Order <span className="font-extrabold text-[#2C2825]">#{placedOrder.order_number}</span> has been successfully placed and inventory stock allocated.
            </p>
          </div>

          {/* Delivery & Summary Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
              <div className="flex items-center gap-2 font-bold text-[#2C2825]">
                <Truck className="w-4 h-4 text-[#2E6F40]" />
                Estimated Delivery Window
              </div>
              <span className="font-black text-[#2E6F40] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                3 - 4 Business Days
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6C665D]">Shipping Address</span>
                <span className="font-bold text-[#2C2825]">{placedOrder.shipping_address}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6C665D]">Total Paid</span>
                <span className="font-black text-sm text-[#2E6F40]">₹{Number(placedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E0D8]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6C665D] mb-1">Ordered Items ({placedOrder.items?.length || 0})</span>
              <div className="space-y-1">
                {placedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#2C2825]">{item.product_name} x {item.quantity}</span>
                    <span className="font-bold text-[#2E6F40]">₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/orders" className="w-full sm:w-auto">
              <ClayButton className="w-full bg-[#2E6F40] text-white" icon={<ShoppingBasket className="w-4 h-4" />}>
                View My Orders History
              </ClayButton>
            </Link>
            <Link to="/store" className="w-full sm:w-auto">
              <ClayButton variant="outline" className="w-full" icon={<ShoppingBag className="w-4 h-4" />}>
                Continue Shopping in E-Store
              </ClayButton>
            </Link>
          </div>
        </ClayCard>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <ClayCard className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#6C665D]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-[#2C2825]">Your order cart is empty</h2>
          <p className="text-xs text-[#6C665D]">Select products from the Agri Store catalog to proceed with order checkout.</p>
          <Link to="/store" className="inline-block pt-2">
            <ClayButton icon={<ShoppingBag className="w-4 h-4" />}>Browse Agri Store Products</ClayButton>
          </Link>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <Link to="/store">
          <ClayButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Agri Store
          </ClayButton>
        </Link>
        <h1 className="text-2xl font-black text-[#2C2825]">Checkout & Order Confirmation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <ClayCard className="md:col-span-2 p-6 space-y-6">
          <h3 className="text-base font-bold text-[#2C2825] border-b border-[#E5E0D8] pb-3">
            Review Selected Cart Items ({cart.length})
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="divide-y divide-[#E5E0D8]">
            {cart.map((item) => (
              <div key={item.product_id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F5F3EE] border border-[#E5E0D8] overflow-hidden shrink-0">
                    <img
                      src={getCleanImageUrl(item.image_url, item.name)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(item.name);
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2C2825]">{item.name}</h4>
                    <span className="text-[#6C665D] font-semibold">
                      {item.quantity} x ₹{item.price_per_unit} / {item.unit}
                    </span>
                  </div>
                </div>
                <span className="font-black text-[#2E6F40] text-sm shrink-0">
                  ₹{(item.quantity * item.price_per_unit).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
            <ClayInput
              label="Delivery Shipping Address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />
          </div>
        </ClayCard>

        {/* Total Payment Tile */}
        <ClayCard className="p-6 flex flex-col justify-between space-y-6 h-fit">
          <h3 className="text-base font-bold text-[#2C2825] border-b border-[#E5E0D8] pb-3">
            Payment Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6C665D] font-semibold">Subtotal:</span>
              <span className="font-bold text-[#2C2825]">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6C665D] font-semibold">Delivery Charge:</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-[#E5E0D8]">
              <span>Total Payable:</span>
              <span className="text-[#2E6F40]">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <ClayButton
            className="w-full mt-4 bg-[#2E6F40] text-white"
            disabled={checkoutMutation.isPending}
            onClick={() => {
              setError('');
              checkoutMutation.mutate();
            }}
            icon={checkoutMutation.isPending ? undefined : <CheckCircle2 className="w-4 h-4" />}
          >
            {checkoutMutation.isPending ? 'Processing Order...' : 'Confirm Order Placement'}
          </ClayButton>
        </ClayCard>
      </div>
    </div>
  );
};
