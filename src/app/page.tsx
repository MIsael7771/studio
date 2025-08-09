import SalesCalculator from '@/components/sales-calculator';

export default function Home() {
  return (
    <main className="bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <SalesCalculator />
      </div>
    </main>
  );
}
