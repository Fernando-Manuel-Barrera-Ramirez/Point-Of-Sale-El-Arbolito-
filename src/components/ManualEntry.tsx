import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Keyboard, ArrowRight } from 'lucide-react';

interface ManualEntryProps {
  onScan: (barcode: string) => void;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ onScan }) => {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
      setBarcode('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Ingresar código manual..."
          className="pl-9 h-12"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
      </div>
      <Button type="submit" size="icon" className="h-12 w-12 shrink-0">
        <ArrowRight className="w-5 h-5" />
      </Button>
    </form>
  );
};
