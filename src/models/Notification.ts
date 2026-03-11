import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  userId: string;
  title: string;
  desc: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Map _id to id for API responses
NotificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
