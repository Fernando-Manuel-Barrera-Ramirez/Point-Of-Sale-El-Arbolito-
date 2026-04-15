import React from 'react';
import { useStore } from '@/src/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Calendar, Clock, Download } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

export const SalesHistory: React.FC = () => {
  const { transactions } = useStore();

  const exportTodaySales = () => {
    const todaySales = transactions.filter(tx => isToday(new Date(tx.timestamp)));
    
    if (todaySales.length === 0) {
      alert('No hay ventas registradas para el día de hoy.');
      return;
    }

    // Flatten data for Excel
    const data = todaySales.flatMap(tx => 
      tx.items.map(item => ({
        'ID Transacción': tx.id.slice(0, 8),
        'Fecha': format(tx.timestamp, 'dd/MM/yyyy'),
        'Hora': format(tx.timestamp, 'HH:mm:ss'),
        'Producto': item.name,
        'Código': item.barcode,
        'Cantidad': item.quantity,
        'Precio Unitario': item.price,
        'Subtotal Item': item.price * item.quantity,
        'Total Venta': tx.total
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas Hoy');
    
    const fileName = `Ventas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <History className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Sin ventas registradas</p>
        <p className="text-sm">Las ventas completadas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Transacciones
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.length} {transactions.length === 1 ? 'venta realizada' : 'ventas realizadas'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={exportTodaySales}
        >
          <Download className="w-4 h-4" />
          Exportar Hoy
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {format(tx.timestamp, 'dd MMM yyyy', { locale: es })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(tx.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    ${tx.total.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    ID: {tx.id.slice(0, 8)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Productos</p>
                <div className="flex flex-wrap gap-1">
                  {tx.items.map((item, idx) => (
                    <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
