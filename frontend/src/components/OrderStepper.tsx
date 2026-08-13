import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck } from 'lucide-react';

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered';

interface OrderStepperProps {
  status: OrderStatus;
}

const steps = [
  { key: 'placed', label: 'Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  const statusIndex = steps.findIndex((step) => step.key === status.toLowerCase());

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-[#E2DDD3] -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active Line */}
        <div
          className="absolute top-1/2 left-6 h-1.5 bg-[#4C7A45] -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{
            width: `${(Math.max(0, statusIndex) / (steps.length - 1)) * 90}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= statusIndex;
          const isCurrent = idx === statusIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#4C7A45] text-white shadow-md'
                    : 'bg-[#F2EFE8] text-[#6B6F63] border border-[#E2DDD3]'
                } ${isCurrent ? 'ring-4 ring-[#4C7A45]/20 scale-110' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-semibold ${
                  isCompleted ? 'text-[#2B2E28]' : 'text-[#6B6F63]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
