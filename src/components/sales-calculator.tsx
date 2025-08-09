"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [activeTab, setActiveTab] = useState(daysOfWeek[0]);

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

    const today = daysOfWeek[new Date().getDay() -1] || 'Domingo';
    setActiveTab(today);
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
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
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
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="flex justify-end items-center mt-8 p-6 rounded-lg bg-gray-100">
            <Skeleton className="h-8 w-32 mr-4" />
            <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6">
      <Card className="w-full border-0 md:border md:shadow-lg">
        <CardHeader className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="bg-primary/10 p-2 rounded-lg">
                <Utensils className="h-8 w-8 text-primary" />
             </div>
             <CardTitle className="text-4xl font-extrabold text-primary tracking-tight">VentaClara</CardTitle>
          </div>
          <CardDescription className="text-base">Calcula tus ganancias semanales de forma sencilla e intuitiva.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-4 h-auto p-1.5">
              {days.map((day) => {
                  const dailyTotal = day.products.reduce((acc, prod) => {
                    const price = parseFloat(prod.price) || 0;
                    const quantity = parseFloat(prod.quantity) || 0;
                    return acc + (price * quantity);
                  }, 0);
                return (
                  <TabsTrigger key={day.dayName} value={day.dayName} className="flex-col h-14">
                      <span className="font-semibold">{day.dayName}</span>
                      <span className={cn("text-sm font-bold mt-1", dailyTotal > 0 ? 'text-accent' : 'text-muted-foreground/80')}>
                        {formatCurrency(dailyTotal)}
                      </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {days.map((day, dayIndex) => (
              <TabsContent key={day.dayName} value={day.dayName}>
                 <div className="space-y-4 pt-4">
                    {day.products.map((prod, prodIndex) => {
                      const productTotal = (parseFloat(prod.price) || 0) * (parseFloat(prod.quantity) || 0);
                      return (
                        <div key={prod.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 rounded-lg bg-card md:bg-secondary/30 border">
                           <div className="md:col-span-5 space-y-1.5">
                              <Label htmlFor={`name-${prod.id}`}>Producto</Label>
                              <Input
                                id={`name-${prod.id}`}
                                placeholder="Nombre del producto"
                                value={prod.name}
                                onChange={(e) => handleInputChange(dayIndex, prodIndex, 'name', e.target.value)}
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4 md:col-span-5">
                             <div className="space-y-1.5">
                               <Label htmlFor={`price-${prod.id}`}>Precio</Label>
                               <Input
                                 id={`price-${prod.id}`}
                                 type="text"
                                 inputMode="decimal"
                                 placeholder="Precio"
                                 value={prod.price}
                                 onChange={(e) => handleInputChange(dayIndex, prodIndex, 'price', e.target.value)}
                                 className="text-right"
                               />
                             </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`quantity-${prod.id}`}>Cantidad</Label>
                                <Input
                                  id={`quantity-${prod.id}`}
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="Cant."
                                  value={prod.quantity}
                                  onChange={(e) => handleInputChange(dayIndex, prodIndex, 'quantity', e.target.value)}
                                  className="text-right"
                                />
                              </div>
                           </div>
                           <div className="md:col-span-2 flex justify-between items-end">
                            <div className="text-right flex-grow space-y-1.5">
                                <Label className="text-muted-foreground">Total</Label>
                                <p className="text-right font-bold text-lg text-accent h-10 flex items-center justify-end">
                                  {formatCurrency(productTotal)}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeProduct(dayIndex, prod.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2">
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Eliminar producto</span>
                            </Button>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addProduct(dayIndex)} className="mt-6 w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                  </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end items-center bg-primary/10 p-6 rounded-b-lg mt-4">
          <h3 className="text-xl font-bold text-foreground mr-4">Total Semanal:</h3>
          <span className="text-3xl font-extrabold text-accent transition-all duration-300">
            {formatCurrency(weeklyTotal)}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
