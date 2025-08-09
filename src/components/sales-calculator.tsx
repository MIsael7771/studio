"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// State interfaces
interface Product {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

interface DaySales {
  dayName: string;
  products: Product[];
}

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function SalesCalculator() {
  const [days, setDays] = useState<DaySales[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem('salesData-VentaClara');
      if (savedData) {
        setDays(JSON.parse(savedData));
      } else {
        const initialClientDays = daysOfWeek.map(day => ({
          dayName: day,
          products: [{ id: crypto.randomUUID(), name: '', price: '', quantity: '' }]
        }));
        setDays(initialClientDays);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      const initialClientDays = daysOfWeek.map(day => ({
        dayName: day,
        products: [{ id: crypto.randomUUID(), name: '', price: '', quantity: '' }]
      }));
      setDays(initialClientDays);
    }
  }, []);

  useEffect(() => {
    if (isMounted && days.length > 0) {
      localStorage.setItem('salesData-VentaClara', JSON.stringify(days));
    }
  }, [days, isMounted]);

  const handleInputChange = (dayIndex: number, prodIndex: number, field: keyof Omit<Product, 'id'>, value: string) => {
    const newDays = [...days];
    if ((field === 'price' || field === 'quantity') && value && !/^\d*\.?\d*$/.test(value)) {
        return;
    }
    newDays[dayIndex].products[prodIndex][field] = value;
    setDays(newDays);
  };

  const addProduct = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].products.push({ id: crypto.randomUUID(), name: '', price: '', quantity: '' });
    setDays(newDays);
  };

  const removeProduct = (dayIndex: number, prodId: string) => {
    const newDays = [...days];
    newDays[dayIndex].products = newDays[dayIndex].products.filter(p => p.id !== prodId);
    if (newDays[dayIndex].products.length === 0) {
        newDays[dayIndex].products.push({ id: crypto.randomUUID(), name: '', price: '', quantity: '' });
    }
    setDays(newDays);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
  };

  const weeklyTotal = useMemo(() => {
    return days.reduce((weekAcc, day) => {
      const dayTotal = day.products.reduce((dayAcc, prod) => {
        const price = parseFloat(prod.price) || 0;
        const quantity = parseFloat(prod.quantity) || 0;
        return dayAcc + (price * quantity);
      }, 0);
      return weekAcc + dayTotal;
    }, 0);
  }, [days]);

  if (!isMounted) {
    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader>
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-2">
                {daysOfWeek.map(day => <Skeleton key={day} className="h-20 w-full" />)}
            </CardContent>
            <CardFooter className="flex justify-end items-center bg-accent/10 p-6 rounded-b-lg">
                <Skeleton className="h-8 w-32 mr-4" />
                <Skeleton className="h-10 w-40" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-4xl font-headline text-primary">VentaClara</CardTitle>
        <CardDescription>Calcula tus ganancias semanales de forma sencilla.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['day-0']} className="w-full space-y-2">
          {days.map((day, dayIndex) => {
            const dailyTotal = day.products.reduce((acc, prod) => {
              const price = parseFloat(prod.price) || 0;
              const quantity = parseFloat(prod.quantity) || 0;
              return acc + (price * quantity);
            }, 0);

            return (
              <AccordionItem value={`day-${dayIndex}`} key={day.dayName} className="border border-border rounded-lg bg-card shadow-sm">
                <AccordionTrigger className="px-4 hover:no-underline rounded-t-lg data-[state=open]:bg-primary/10">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-lg font-medium font-headline">{day.dayName}</span>
                    <span className={cn("text-lg font-bold transition-colors duration-300", dailyTotal > 0 ? 'text-accent' : 'text-muted-foreground')}>
                      {formatCurrency(dailyTotal)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t border-border">
                  <div className="hidden md:grid md:grid-cols-[1fr_120px_120px_120px_40px] gap-4 items-center mb-2 px-2 text-sm font-semibold text-muted-foreground">
                    <span>Producto</span>
                    <span className="text-right">Precio</span>
                    <span className="text-right">Cantidad</span>
                    <span className="text-right">Total</span>
                    <span></span>
                  </div>
                  <div className="space-y-4">
                    {day.products.map((prod, prodIndex) => {
                      const productTotal = (parseFloat(prod.price) || 0) * (parseFloat(prod.quantity) || 0);
                      return (
                        <div key={prod.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px_40px] gap-2 md:gap-4 items-center p-2 rounded-md hover:bg-primary/5">
                          <Input
                            placeholder="Nombre del producto"
                            value={prod.name}
                            onChange={(e) => handleInputChange(dayIndex, prodIndex, 'name', e.target.value)}
                          />
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Precio"
                            aria-label="Precio"
                            value={prod.price}
                            onChange={(e) => handleInputChange(dayIndex, prodIndex, 'price', e.target.value)}
                            className="text-right"
                          />
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Cantidad"
                            aria-label="Cantidad"
                            value={prod.quantity}
                            onChange={(e) => handleInputChange(dayIndex, prodIndex, 'quantity', e.target.value)}
                            className="text-right"
                          />
                          <span className="text-right font-medium transition-colors text-accent h-10 flex items-center justify-end">
                            {formatCurrency(productTotal)}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => removeProduct(dayIndex, prod.id)} className="text-muted-foreground hover:text-destructive h-8 w-8 justify-self-center md:justify-self-end">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar producto</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addProduct(dayIndex)} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                  </Button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-end items-center bg-primary/10 p-6 rounded-b-lg mt-4">
        <h3 className="text-xl font-headline text-foreground mr-4">Total Semanal:</h3>
        <span className="text-3xl font-bold font-headline text-accent transition-all duration-300">
          {formatCurrency(weeklyTotal)}
        </span>
      </CardFooter>
    </Card>
  );
}
