import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Chart Data (Revenue & Users by Month = "Desktop/Mobile" proxies)
    const currentYear = new Date().getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Aggregate revenue by month
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31T23:59:59`) }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const chartData = months.map((month, index) => {
      const found = revenueAgg.find(r => r._id === index + 1);
      return {
        month,
        desktop: found ? found.revenue : 0, // Mapping "revenue" to desktop proxy
        mobile: found ? found.orders * 10 : 0 // Mapping "orders" to mobile proxy
      };
    });

    // 2. Status Data (Pie Chart)
    const statusAgg = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const pieColors: Record<string, string> = {
      pending: "var(--color-pending)",
      processing: "var(--color-processing)",
      success: "var(--color-success)",
      failed: "var(--color-failed)"
    };

    const statusData = statusAgg.map(s => ({
      status: s._id,
      count: s.count,
      fill: pieColors[s._id] || "var(--color-pending)"
    }));

    // 3. Latest Transactions (CardList)
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const latestTransactions = latestOrders.map((o, i) => ({
      id: o._id.toString(),
      title: "Order Payment",
      badge: o.fullName || "Guest User",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(o.fullName || "User")}`,
      count: o.amount
    }));

    // 4. Popular Products (CardList Proxy - just fetch 5 random products for now, or sort by a 'sales' field if added later)
    const products = await Product.find().limit(5);
    const popularProducts = products.map((p, i) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      images: p.images || { main: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800" }
    }));

    return NextResponse.json({
      chartData,
      statusData,
      latestTransactions,
      popularProducts
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch analytics", error: error.message },
      { status: 500 }
    );
  }
}
