"use client";

import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const Homepage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Calculate total successful orders for pie chart center
  const totalData = data?.statusData?.find((s: any) => s.status === 'success')?.count || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AppBarChart data={data?.chartData} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <CardList title="Latest Transactions" data={data?.latestTransactions} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        <AppPieChart data={data?.statusData} totalData={totalData} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        <TodoList />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
        <AppAreaChart data={data?.chartData} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
        <CardList title="Popular Products" data={data?.popularProducts} />
      </div>
    </div>
  );
};

export default Homepage;
