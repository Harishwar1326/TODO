import { Expense } from "../models/Expense.js";
import { extractExpenseDataFromImage } from "../services/genaiService.js";

export async function createExpense(req, res) {
  try {
    const {
      vendor,
      amount,
      date,
      category,
      currency = "USD",
      rawExtraction = {},
    } = req.body;

    const expense = await Expense.create({
      vendor,
      amount,
      date: new Date(date),
      category,
      currency,
      rawExtraction,
    });

    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save expense",
      error: error.message,
    });
  }
}

export async function uploadAndExtractExpense(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Invoice image is required" });
    }

    console.log("Received file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const extracted = await extractExpenseDataFromImage({
      mimeType: req.file.mimetype,
      base64Data: req.file.buffer.toString("base64"),
    });

    const expense = await Expense.create({
      vendor: extracted.vendor,
      amount: extracted.amount,
      date: new Date(extracted.date),
      category: extracted.category,
      currency: extracted.currency,
      rawExtraction: extracted.rawExtraction,
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error("Failed to process invoice image:", error);
    return res.status(500).json({
      message: "Failed to process invoice image",
      error: error.message,
    });
  }
}

export async function getAllExpenses(_req, res) {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return res.json(expenses);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
}

export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Expense not found" });
    return res.json({ message: "Deleted", id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete expense", error: error.message });
  }
}
