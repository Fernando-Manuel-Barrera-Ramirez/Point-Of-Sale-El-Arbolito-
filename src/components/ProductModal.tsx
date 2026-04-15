import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/src/store/useStore';
import { toast } from 'sonner';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, barcode }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const { addProduct, addToCart } = useStore();

  const handleSave = () => {
    if (!name || !price || !stock) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    addProduct({
      name,
      price: parseFloat(price),
      barcode,
      stock: parseInt(stock),
    });

    addToCart(barcode);
    toast.success('Producto guardado y agregado');
    
    // Reset and close
    setName('');
    setPrice('');
    setStock('10');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Producto Desconocido</DialogTitle>
          <DialogDescription>
            El código <code className="bg-muted px-1 rounded">{barcode}</code> no está en el catálogo.
            Regístralo para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Nombre del Producto</label>
            <Input
              id="name"
              placeholder="Ej. Manzana Roja"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">Precio ($)</label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="stock" className="text-sm font-medium">Stock Inicial</label>
              <Input
                id="stock"
                type="number"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar y Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
