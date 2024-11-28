import mongoose, { model, Schema } from "mongoose";

const visitorCountSchema = new Schema(
  {
    visits: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

export const Visitors =
  mongoose.models.Visitors || model("Visitors", visitorCountSchema);
