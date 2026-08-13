import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClayCard } from '../components/ClayCard';
import { OrderStepper } from '../components/OrderStepper';
import type { OrderStatus } from '../components/OrderStepper';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiClient.patch(`/orders/${orderId}/update_status/`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-[#2B2E28]">Order History & Trackers</h1>
        <p className="text-sm font-semibold text-[#6B6F63]">
          Track real-time order status timeline and item fulfillment.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6B6F63]">Loading order tracking...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#6B6F63]">No orders placed yet.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <ClayCard key={order.id} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2DDD3] pb-4 gap-2">
                <div>
                  <span className="text-xs font-black text-[#4C7A45] bg-[#E2F1E1] px-3 py-1 rounded-full">
                    #{order.order_number}
                  </span>
                  <span className="text-xs text-[#6B6F63] font-semibold ml-3">
                    Placed: {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-[#2B2E28]">
                    Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>

                  {/* Admin / Manager Role status updater */}
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <select
                      className="clay-input py-1 text-xs font-bold"
                      value={order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })
                      }
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Claymorphic Order Status Stepper */}
              <OrderStepper status={order.status as OrderStatus} />

              {/* Order Items Table */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD3] space-y-2 text-xs">
                <span className="font-bold text-[#6B6F63] uppercase tracking-wider text-[10px] block">
                  Purchased Items:
                </span>
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between font-semibold text-[#2B2E28]">
                    <span>
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  );
};
