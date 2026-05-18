import express from "express";
import multer from "multer";

import {
  createExpense,
  getAllExpenses,
  uploadAndExtractExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", getAllExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);
router.post("/upload", upload.single("invoice"), uploadAndExtractExpense);

export default router;
