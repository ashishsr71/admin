import { Product, columns } from "./columns";
import { DataTable } from "./data-table";

export const dynamic = "force-dynamic";

const getData = async (): Promise<Product[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://127.0.0.1:${process.env.PORT || 3000}`);
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Fetch products error", error);
    return [];
  }
};

const PaymentsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Products</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default PaymentsPage;
