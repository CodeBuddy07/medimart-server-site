# MediMart API

Backend for MediMart, a healthcare e-commerce store: medicine catalog, orders, payments through SSLCommerz (Bangladesh), and sales statistics for the admin.

Express · TypeScript · MongoDB (Mongoose) · JWT · SSLCommerz · Cloudinary

## Structure

```
src/app/modules/
  users medicines orders payment statistics
```

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5000`.

## Environment

Copy `.env.example` to `.env` (create one if the repo has no example) and set:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` |  |
| `PORT` |  |
| `NODE_ENV` |  |
| `JWT_SECRET` |  |
| `JWT_REFRESH_SECRET` |  |
| `STORE_ID` | SSLCommerz store |
| `STORE_PASSWD` |  |
| `IS_LIVE` | SSLCommerz sandbox or live |
| `CLOUDINARY_CLOUD_NAME` |  |
| `CLOUDINARY_API_KEY` |  |
| `CLOUDINARY_API_SECRET` |  |
| `EMAIL_USER` |  |
| `EMAIL_PASS` |  |
| `FRONTEND_URL` |  |
| `BACKEND_URL` |  |

## Scripts

| Command | Runs |
| --- | --- |
| `npm run dev` | `ts-node-dev --respawn --transpile-only src/index.ts` |
| `npm run build` | `tsc` |
| `npm run start` | `node dist/index.js` |


## Author

Ruhul Amin, full stack developer and co-founder at CodeMines. [ruhulcodes.com](https://www.ruhulcodes.com) · [GitHub](https://github.com/CodeBuddy07) · [LinkedIn](https://www.linkedin.com/in/codebuddy07)
