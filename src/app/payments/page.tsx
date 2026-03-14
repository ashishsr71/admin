import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const getData = async (): Promise<Payment[]> => {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/orders`, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  } catch (error) {
    console.error("Fetch orders error", error);
    return [];
  }
};

const PaymentsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Orders</h1>
      </div>
      <DataTable columns={columns} data={data}/>
    </div>
  );
};

export default PaymentsPage;
