import { headers } from "next/headers";
import { format } from "date-fns";
import { MapPin, User, Package, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const getOrderData = async (id: string) => {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    // We already have /api/orders, let's fetch all and filter or fetch one directly if that API is available
    const res = await fetch(`${baseUrl}/api/orders`, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();
    const order = orders.find((o: any) => o.id === id || o._id === id);
    
    // Also fetch the user to get their saved addresses
    let userAddresses = [];
    if (order?.userId) {
      const uRes = await fetch(`${baseUrl}/api/users/${order.userId}/addresses`, { cache: "no-store", next: { revalidate: 0 } });
      if (uRes.ok) {
        const uData = await uRes.json();
        userAddresses = uData.addresses || [];
      }
    }
    
    return { order, userAddresses };
  } catch (error) {
    console.error("Fetch API error", error);
    return { order: null, userAddresses: [] };
  }
};

const OrderDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await getOrderData(id);

  if (!data.order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link href="/payments" className="text-blue-500 hover:underline">Return to Orders</Link>
      </div>
    );
  }

  const { order, userAddresses } = data;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/payments">Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Order #{id.slice(-8).toUpperCase()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Order Details & Shipping */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-primary-foreground rounded-lg p-6 border border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{id.slice(-8).toUpperCase()}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 
                  {format(new Date(order.createdAt), "PPP p")}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                    order.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    Payment: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  order.trackingStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                  order.trackingStatus === 'out_for_delivery' ? 'bg-amber-100 text-amber-800' : 
                  order.trackingStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  Tracking: {(order.trackingStatus || 'processing').replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-4 border-t border-b border-border mb-6">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Customer Name</p>
                <p className="font-medium">{order.fullName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Content</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Payment Method</p>
                <p className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground"/> 
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
                <p className="font-medium text-lg text-emerald-600">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.amount)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-indigo-500" />
                Shipping Details
              </h3>
              {order.shippingAddress ? (
                <div className="bg-background border border-border p-4 rounded-lg flex gap-4 items-start">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{order.fullName}</h4>
                    <p className="text-foreground mt-1">{order.shippingAddress.street}</p>
                    <p className="text-muted-foreground text-sm">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-muted-foreground text-sm font-medium mt-1">{order.shippingAddress.country}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted text-muted-foreground rounded-lg italic text-sm text-center">
                  No shipping address provided for this order.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - User Overview & Addresses */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary-foreground rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-border pb-3">
              <User className="w-5 h-5 text-cyan-500" />
              Customer Overview
            </h3>
            
            <div className="mb-4">
              <Link href={`/users/${order.userId}`} className="text-sm text-cyan-600 hover:text-cyan-800 font-medium hover:underline flex w-fit">
                View Full Profile &rarr;
              </Link>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Saved Addresses ({userAddresses.length})</h4>
              
              {userAddresses.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Customer has no saved addresses.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2">
                  {userAddresses.map((addr: any, idx: number) => {
                    const isShippingMatch = order.shippingAddress && 
                      addr.street === order.shippingAddress.street && 
                      addr.city === order.shippingAddress.city;

                    return (
                      <div key={idx} className={`p-3 rounded-lg border text-sm relative ${isShippingMatch ? 'border-indigo-200 bg-indigo-50/30' : 'border-border bg-background'}`}>
                        {isShippingMatch && (
                          <span className="absolute top-2 right-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">USED</span>
                        )}
                        <p className="font-medium truncate pr-12">{addr.street}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.city}, {addr.state} {addr.zipCode}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
