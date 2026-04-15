import React from 'react';
import { useStore } from '@/src/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Separator } from '@/components/ui/separator';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, checkout } = useStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Canasta vacía</p>
        <p className="text-sm">Escanea productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.barcode}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md bg-muted/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.barcode, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.barcode, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromCart(item.barcode)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-4 bg-muted/30 border-t space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          className="w-full h-14 text-lg font-bold shadow-lg" 
          size="lg"
          onClick={checkout}
        >
          COBRAR AHORA
        </Button>
      </div>
    </div>
  );
};
