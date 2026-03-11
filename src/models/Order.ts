import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  userId: string;
  fullName: string;
  email: string;
  amount: number;
  paymentMethod: "Card" | "COD";
  status: "pending" | "success" | "failed";
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "COD"],
      required: true,
      default: "Card",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Map _id to id for admin compatibility
OrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
