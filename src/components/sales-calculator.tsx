"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Utensils, Calendar as CalendarIcon, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, addDays, getWeekOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';


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
const dayNameToIndex: { [key: string]: number } = { 'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3, 'Viernes': 4, 'Sábado': 5, 'Domingo': 6 };


export default function SalesCalculator() {
  const [days, setDays] = useState<DaySales[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(daysOfWeek[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());


  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem('salesData-ElJugos');
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

    handleDateSelect(new Date());
  }, []);

  useEffect(() => {
    if (isMounted && days.length > 0) {
      localStorage.setItem('salesData-ElJugos', JSON.stringify(days));
    }
  }, [days, isMounted]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    // JS `getDay` is 0 (Sun) - 6 (Sat). We want 0 (Mon) - 6 (Sun).
    const dayIndex = (date.getDay() + 6) % 7;
    const dayName = daysOfWeek[dayIndex];
    setActiveTab(dayName);
  };
  
  const handleTabChange = (dayName: string) => {
    setActiveTab(dayName);
    const dayIndex = dayNameToIndex[dayName];
    const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const newSelectedDate = addDays(startOfSelectedWeek, dayIndex);
    setSelectedDate(newSelectedDate);
  };

  const handleInputChange = (dayIndex: number, prodIndex: number, field: keyof Omit<Product, 'id'>, value: string) => {
    const newDays = [...days];
    if ((field === 'price' || field === 'quantity') && value && !/^\d*\.?\d*$/.test(value)) {
        return;
    }
    newDays[dayIndex].products[prodIndex][field] = value;
    setDays(newDays);
  };

  const handleQuantityChange = (dayIndex: number, prodIndex: number, amount: number) => {
    const newDays = [...days];
    const currentQuantity = parseFloat(newDays[dayIndex].products[prodIndex].quantity) || 0;
    const newQuantity = Math.max(0, currentQuantity + amount);
    newDays[dayIndex].products[prodIndex].quantity = newQuantity.toString();
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

  const weekOfMonth = useMemo(() => {
    if (!selectedDate) return 0;
    return getWeekOfMonth(selectedDate, { weekStartsOn: 1 });
  }, [selectedDate]);


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
             <CardTitle className="text-4xl font-extrabold text-primary tracking-tight">El jugos</CardTitle>
          </div>
          <CardDescription className="text-base">Calcula tus ganancia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center md:justify-end items-center gap-4 mb-4">
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant={"outline"}
                   className={cn(
                     "w-[240px] justify-start text-left font-normal",
                     !selectedDate && "text-muted-foreground"
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0">
                 <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={handleDateSelect}
                   initialFocus
                   locale={es}
                 />
               </PopoverContent>
             </Popover>
             <div className="text-sm text-muted-foreground bg-secondary/30 px-3 py-2 rounded-md">
                Semana: <span className="font-bold text-foreground">{weekOfMonth}</span>
             </div>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleQuantityChange(dayIndex, prodIndex, -1)}>
                                        <MinusCircle className="h-5 w-5" />
                                    </Button>
                                    <Input
                                      id={`quantity-${prod.id}`}
                                      type="text"
                                      inputMode="decimal"
                                      placeholder="Cant."
                                      value={prod.quantity}
                                      onChange={(e) => handleInputChange(dayIndex, prodIndex, 'quantity', e.target.value)}
                                      className="text-right"
                                    />
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleQuantityChange(dayIndex, prodIndex, 1)}>
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </div>
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
