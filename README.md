# Todo CRUD App

Monorepo for a React frontend and Node.js + MongoDB backend, prepared for local development and Vercel deployment.

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Deployment

This repo uses `vercel.json` to deploy the frontend as a static build and the backend task API as Vercel serverless functions.

Set these environment variables in Vercel:

- `MONGODB_URI`
- `MONGODB_DB_NAME`

The backend uses `mongodb://localhost:27017` only for local development. On Vercel, `MONGODB_URI` must point to a real hosted MongoDB instance.

## Notes

- Frontend build output is `frontend/dist`.
- API routes live under `backend/api`.
