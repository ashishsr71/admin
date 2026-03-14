import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();
    
    // Only update allowed fields (e.g. status)
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.trackingStatus !== undefined) updateData.trackingStatus = body.trackingStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: false } // Get old order to map state changes
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // CREATE NOTIFICATION IF STATUS CHANGED
    if (body.status && body.status !== updatedOrder.status) {
      const shortId = updatedOrder._id.toString().slice(-8).toUpperCase();
      let title = "Order Update";
      let desc = `Your order #${shortId} has a new update.`;

      if (body.status === "success") {
        title = "Payment Successful";
        desc = `Your payment for order #${shortId} was successful!`;
      } else if (body.status === "pending") {
        title = "Order Pending";
        desc = `Your order #${shortId} was updated back to pending status.`;
      }

      await Notification.create({
        userId: updatedOrder.userId,
        title,
        desc,
        read: false
      });
    }

    // CREATE NOTIFICATION IF TRACKING STATUS CHANGED
    if (body.trackingStatus && body.trackingStatus !== updatedOrder.trackingStatus) {
      const shortId = updatedOrder._id.toString().slice(-8).toUpperCase();
      let title = "Tracking Update";
      let desc = `Your order #${shortId} status has changed to: ${body.trackingStatus}.`;

      await Notification.create({
        userId: updatedOrder.userId,
        title,
        desc,
        read: false
      });
    }

    // Return the newly mutated state
    const newOrderState = {
      ...updatedOrder.toObject(),
      status: body.status || updatedOrder.status,
      trackingStatus: body.trackingStatus || updatedOrder.trackingStatus
    };

    return NextResponse.json(newOrderState, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}
