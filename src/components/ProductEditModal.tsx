import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore, Product } from '@/src/store/useStore';
import { toast } from 'sonner';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const { updateProduct } = useStore();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock((product.stock ?? 0).toString());
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    if (!name || !price || !stock) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    updateProduct(product.id, {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
    });

    toast.success('Producto actualizado');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Código de Barras</label>
            <Input value={product?.barcode || ''} disabled className="bg-muted" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="edit-name" className="text-sm font-medium">Nombre</label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="edit-price" className="text-sm font-medium">Precio ($)</label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-stock" className="text-sm font-medium">Stock</label>
              <Input
                id="edit-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
