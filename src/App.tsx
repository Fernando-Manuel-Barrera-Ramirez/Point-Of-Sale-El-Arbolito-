import { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { Cart } from './components/Cart';
import { ManualEntry } from './components/ManualEntry';
import { ProductModal } from './components/ProductModal';
import { ProductEditModal } from './components/ProductEditModal';
import { SalesHistory } from './components/SalesHistory';
import { useStore, Product } from './store/useStore';
import { Toaster, toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Scan, History, Package, Plus, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function App() {
  const { addToCart, inventory } = useStore();
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingFromCatalog, setIsAddingFromCatalog] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleScan = (barcode: string) => {
    const product = inventory.find(p => p.barcode === barcode);
    
    if (!product) {
      setUnknownBarcode(barcode);
      setIsAddingFromCatalog(false);
      return;
    }

    const success = addToCart(barcode);
    if (success) {
      toast.success(`Agregado: ${product.name}`, {
        description: `Código: ${barcode}`,
        icon: <ShoppingCart className="w-4 h-4" />,
      });
    }
  };

  const handleCatalogScan = (barcode: string) => {
    const existing = inventory.find(p => p.barcode === barcode);
    if (existing) {
      toast.info('Este producto ya existe en el catálogo');
      setEditingProduct(existing);
      setIsAddingFromCatalog(false);
    } else {
      setUnknownBarcode(barcode);
      setIsAddingFromCatalog(false);
    }
  };

  // Soporte para Escáner USB Global
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // No interferir si el usuario está escribiendo en un input manualmente
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const now = Date.now();
      
      // Si el tiempo entre teclas es > 50ms, probablemente es un humano, limpiamos buffer
      if (now - lastKeyTime > 50) {
        buffer = '';
      }
      
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          handleScan(buffer);
          buffer = '';
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inventory]); // Re-bind si el inventario cambia para asegurar que handleScan tenga el contexto correcto

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto border-x shadow-2xl">
      <header className="p-4 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShoppingCart className="text-primary-foreground w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">QuickPOS</h1>
          </div>
          <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
            MVP v1.0
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="scan" className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-3 w-full h-12">
              <TabsTrigger value="scan" className="gap-2">
                <Scan className="w-4 h-4" />
                <span>Escanear</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2">
                <Package className="w-4 h-4" />
                <span>Catálogo</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                <span>Ventas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="scan" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground gap-2"
                  onClick={() => setShowCamera(!showCamera)}
                >
                  <Scan className="w-3 h-3" />
                  {showCamera ? "Ocultar Cámara" : "Usar Cámara del Dispositivo"}
                </Button>
              </div>

              {showCamera && (
                <Card className="p-2 border-dashed">
                  <Scanner onScan={handleScan} />
                </Card>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Entrada Manual
                </label>
                <ManualEntry onScan={handleScan} />
              </div>

              <Card className="overflow-hidden border-none shadow-none bg-muted/20">
                <div className="p-4">
                  <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Canasta Actual
                  </h2>
                  <div className="h-[500px] rounded-xl border bg-card overflow-hidden shadow-inner">
                    <Cart />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="flex-1 p-4 overflow-y-auto m-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Catálogo de Productos</h2>
                <Button 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => setIsAddingFromCatalog(!isAddingFromCatalog)}
                  variant={isAddingFromCatalog ? "outline" : "default"}
                >
                  {isAddingFromCatalog ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingFromCatalog ? "Cancelar" : "Nuevo Producto"}
                </Button>
              </div>

              {isAddingFromCatalog && (
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm font-medium text-center">Escanea el código del nuevo producto</p>
                    <p className="text-[10px] text-muted-foreground text-center italic">
                      (Puedes usar tu escáner USB directamente o activar la cámara abajo)
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-2"
                      onClick={() => setShowCamera(!showCamera)}
                    >
                      <Scan className="w-3 h-3" />
                      {showCamera ? "Desactivar Cámara" : "Activar Cámara"}
                    </Button>

                    {showCamera && <Scanner onScan={handleCatalogScan} />}
                  </div>
                </Card>
              )}

              <div className="grid gap-3">
                {inventory.map(product => (
                  <div key={product.id} className={`p-3 border rounded-lg bg-card flex justify-between items-center group transition-colors ${(product.stock ?? 0) <= 5 ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{product.name}</p>
                        {(product.stock ?? 0) <= 5 && (
                          <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase">Stock Bajo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{product.barcode}</span>
                        <span>•</span>
                        <span className={`${(product.stock ?? 0) <= 5 ? 'text-destructive font-bold' : ''}`}>
                          Stock: {product.stock ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden m-0">
             <SalesHistory />
          </TabsContent>
        </Tabs>
      </main>

      <ProductModal 
        isOpen={!!unknownBarcode} 
        onClose={() => setUnknownBarcode(null)} 
        barcode={unknownBarcode || ''} 
      />

      <ProductEditModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
      />
      
      <Toaster position="top-center" richColors />
    </div>
  );
}
