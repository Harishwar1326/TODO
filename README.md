# Expense Tracker (Node.js + React + MongoDB + Google GenAI)

This project implements exactly this flow:

1. Upload invoice image from React frontend.
2. Backend uses Google GenAI SDK to extract vendor, amount, date, and category.
3. Backend inserts classified expense into MongoDB.
4. Frontend reads and displays saved expenses.

## 1) Folder Structure

```text
AI_TODO/
  backend/
    .env.example
    package.json
    src/
      config/
        db.js
      controllers/
        expenseController.js
      models/
        Expense.js
      routes/
        expenseRoutes.js
      services/
        genaiService.js
      server.js
  frontend/
    package.json
    vite.config.js
    index.html
    src/
      api.js
      App.jsx
      main.jsx
      styles.css
  README.md
```

## 2) Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI
- Google AI API key for Gemini

## 3) Backend Setup

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
copy .env.example .env
```

4. Edit `.env` values:

- `MONGODB_URI`
- `GOOGLE_API_KEY`
- `PORT` (optional)

Default local Mongo URI in `.env.example`:

```text
mongodb://localhost:27017/
```

5. Start backend:

```bash
npm run dev
```

Backend base URL: `http://localhost:5000`

## 4) Frontend Setup

1. Open a second terminal and go to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## 5) API Endpoints

### `POST /api/expenses/upload`

- Form-data key: `invoice` (image file)
- Behavior:
  - reads image buffer
  - sends image to Gemini via Google GenAI SDK
  - extracts and classifies invoice data
  - saves document in MongoDB
- Returns saved expense document

### `POST /api/expenses`

- JSON body with extracted data
- Saves directly to MongoDB (used for explicit save step)

Example body:

```json
{
  "vendor": "Fresh Mart",
  "amount": 54.2,
  "date": "2026-05-18",
  "category": "Food",
  "currency": "USD"
}
```

### `GET /api/expenses`

- Returns all expenses as JSON array

## 6) Required Flow Mapping (Your Shots)

### Input 1 -> Output 1

- Input: Upload invoice image in frontend
- Output: Backend receives image, Gemini extracts `vendor`, `amount`, `date`, classifies e.g. `Food`

### Input 2 -> Output 2

- Input: Save extracted and classified data
- Output: Structured JSON inserted as document in `expenses` collection

### Input 3 -> Output 3

- Input: Fetch all saved expenses
- Output: JSON array returned to frontend and rendered in table

## 7) Notes

- No authentication/authorization is included.
- No in-memory or localStorage persistence is used.
- Scope is limited to upload, extraction/classification, insert, and view.
