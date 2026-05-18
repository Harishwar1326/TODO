import { useEffect, useState } from "react";
import { fetchExpenses, uploadInvoice, deleteExpense } from "./api";
import ExpensesChart from "./ExpensesChart";

function formatCurrency(amount, currency = "USD") {
  // Normalize common currency symbol inputs to ISO currency codes
  const symbolMap = { "$": "USD", "€": "EUR", "£": "GBP", "₹": "INR" };
  let code = currency || "USD";
  if (typeof code === "string") {
    code = code.trim();
    if (symbolMap[code]) code = symbolMap[code];
    code = code.toUpperCase();
  } else {
    code = "USD";
  }

  // Ensure we have a 3-letter ISO code, otherwise fallback to USD
  if (!/^[A-Z]{3}$/.test(code)) code = "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch (e) {
    return `${amount}`;
  }
}

export default function App() {
  const [file, setFile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadExpenses() {
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select an invoice image first.");
      return;
    }

    try {
      setLoading(true);
      await uploadInvoice(file);
      setFile(null);
      event.target.reset();
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      setLoading(true);
      await deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>Expense Tracker</h1>
        <p>Upload invoice images. AI extracts, classifies, and saves to MongoDB.</p>
      </header>

      <section className="card">
        <h2>Upload Invoice Image</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Upload and Save"}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>
      <ExpensesChart expenses={expenses} />

      <section className="card">
        <h2>Saved Expenses</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="4">No expenses yet.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.vendor}</td>
                    <td>{formatCurrency(expense.amount, expense.currency)}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      <button className="danger" onClick={() => handleDelete(expense._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
