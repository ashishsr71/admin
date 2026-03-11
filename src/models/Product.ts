import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      maxlength: 100,
    },
    shortDescription: {
      type: String,
      required: [true, "Please provide a short description"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    images: {
      type: Map,
      of: String, // e.g., { main: "url", thumb: "url" }
      default: {},
    },
  },
  { timestamps: true }
);

// We need to return the _id as id for client compatibility
ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: Record<string, any>) {
    ret.id = ret._id.toString(); // Map _id to id
    delete ret._id;
  },
});

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
