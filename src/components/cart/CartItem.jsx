import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export default function CartItem({ item }) {
  const { dispatch } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg bg-gray-50"
      />

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-primary truncate">{item.name}</h4>
        <p className="text-sm text-muted mt-0.5">${item.price.toLocaleString()}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QUANTITY',
                  payload: { id: item.id, quantity: item.quantity - 1 },
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
            <button
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QUANTITY',
                  payload: { id: item.id, quantity: item.quantity + 1 },
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">
              ${(item.price * item.quantity).toLocaleString()}
            </span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
