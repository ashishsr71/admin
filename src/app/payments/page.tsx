import { Payment,columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async (): Promise<Payment[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://127.0.0.1:${process.env.PORT || 3001}`);
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
        <h1 className="font-semibold">All Payments</h1>
      </div>
      <DataTable columns={columns} data={data}/>
    </div>
  );
};

export default PaymentsPage;
