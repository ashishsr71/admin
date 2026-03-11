"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type Payment = {
  id: string;
  amount: number;
  fullName: string;
  userId: string;
  email: string;
  paymentMethod: "Card" | "COD";
  status: "pending" | "success" | "failed";
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "fullName",
    header: "User",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => {
      const pm = row.getValue("paymentMethod") as string;
      return (
        <div className={cn("text-xs font-semibold px-2 py-1 rounded w-max", pm === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800')}>
          {pm}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");

      return (
        <div
          className={cn(
            `p-1 px-2 rounded-md w-max text-xs font-medium capitalize`,
            status === "pending" && "bg-blue-100 text-blue-800",
            status === "success" && "bg-emerald-100 text-emerald-800",
            status === "failed" && "bg-red-100 text-red-800"
          )}
        >
          {status as string}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentActionCell payment={row.original} />,
  },
];

const PaymentActionCell = ({ payment }: { payment: Payment }) => {
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Order marked as ${newStatus}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error updating order status");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/orders/${payment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error deleting order");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
          Copy payment ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {payment.status === "pending" && (
          <DropdownMenuItem onClick={() => handleUpdateStatus("success")} className="text-emerald-600 font-medium">
            Mark as Success
          </DropdownMenuItem>
        )}
        {payment.status === "success" && payment.paymentMethod === "COD" && (
          <DropdownMenuItem onClick={() => handleUpdateStatus("pending")} className="text-amber-600 font-medium">
            Revert to Pending
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem>
          <Link href={`/users/${payment.userId}`}>View customer</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-500">
          Delete order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
