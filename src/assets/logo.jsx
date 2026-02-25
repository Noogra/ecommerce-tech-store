import { Smartphone } from 'lucide-react';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Smartphone className="w-7 h-7 text-accent" />
      <span className="text-xl font-bold tracking-tight text-primary">
        Phone<span className="text-accent">Stop</span>
      </span>
    </div>
  );
}
