import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Travel", "Utilities", "Office", "Healthcare", "Other"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    rawExtraction: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export const Expense = mongoose.model("Expense", expenseSchema);
