# Personal Expense Tracker API

## Description

A RESTful API built with Node.js, Express, and TypeScript for tracking personal expenses. It allows users to manage their profiles, record expenses, categorize spending, and view monthly financial summaries. The project focuses on clean architecture, type safety with TypeScript, and robust data validation.

## Prerequisites

- **Node.js**: v14.0.0 or higher.
- **npm**: v6.0.0 or higher.
- **MongoDB Atlas Account**: A cloud database to store user and expense data.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd personal-expense-tracker
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory. You can copy the structure from a `.env.example` if it exists, or typically add:
    ```env
    PORT=5000
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
    ```

## Running the Project

### Development Mode

Runs the server with hot-reloading using `ts-node-dev`.

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

### Build

Compiles the TypeScript code to JavaScript in the `dist` folder.

```bash
npm run build
```

### Production Mode

Runs the compiled JavaScript application from the `dist` folder. Ensure you have built the project first.

```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/api`.

### Users

#### 1. Create a User

- **URL:** `/users`
- **Method:** `POST`
- **Description:** Registers a new user with a valid email and monthly budget.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "monthlyBudget": 1500
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec49f1b2c820c8e4e1a1",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "monthlyBudget": 1500,
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "__v": 0
    }
  }
  ```
- **Error Responses:**
  - `400`: Validation error (e.g., invalid email, budget <= 0).
  - `400`: Duplicate email.

#### 2. Get User Details

- **URL:** `/users/:id`
- **Method:** `GET`
- **Description:** Retrieves detailed information about a specific user.
- **Parameters:** `id` (MongoDB ObjectId)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec49f1b2c820c8e4e1a1",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "monthlyBudget": 1500,
      ...
    }
  }
  ```
- **Error Responses:**
  - `404`: User not found.
  - `400`: Invalid ID format.

#### 3. Get User Summary

- **URL:** `/users/:userId/summary`
- **Method:** `GET`
- **Description:** Calculates and retrieves the financial summary for the current month.
- **Parameters:** `userId` (MongoDB ObjectId)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalExpenses": 450.5,
      "monthlyBudget": 1500,
      "remainingBudget": 1049.5,
      "expenseCount": 12,
      "month": 10,
      "year": 2023
    }
  }
  ```

### Expenses

#### 1. Create an Expense

- **URL:** `/expenses`
- **Method:** `POST`
- **Description:** functionality to add a new expense.
- **Request Body:**
  ```json
  {
    "userId": "60d5ec49f1b2c820c8e4e1a1",
    "title": "Grocery Shopping",
    "amount": 120.5,
    "category": "Food",
    "date": "2023-10-27"
  }
  ```
  **Allowed Categories:** `Food`, `Transportation`, `Utilities`, `Entertainment`, `Health`, `Shopping`, `Housing`, `Education`, `Personal`, `Other`.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d6f123f1b2c820c8e4e2b2",
      "userId": "60d5ec49f1b2c820c8e4e1a1",
      "title": "Grocery Shopping",
      "amount": 120.50,
      "category": "Food",
      "date": "2023-10-27T00:00:00.000Z",
      ...
    }
  }
  ```
- **Error Responses:**
  - `400`: Validation error (amount <= 0, missing fields).
  - `404`: Cited user does not exist.

#### 2. Get User Expenses

- **URL:** `/users/:userId/expenses`
- **Method:** `GET`
- **Description:** Retrieves a list of all expenses associated with a user.
- **Parameters:** `userId` (MongoDB ObjectId)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "60d6f123f1b2c820c8e4e2b2",
        "title": "Grocery Shopping",
        "amount": 120.50,
        "category": "Food",
        "date": "2023-10-27T00:00:00.000Z"
      },
      ...
    ]
  } 
  ```

## MongoDB Atlas Setup Instructions

1.  **Sign Up/Login**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2.  **Create a Cluster**: Build a new cluster (the free M0 sandbox is suitable for testing).
3.  **Database User**: In the Security tab/Database Access, create a user with a password. **Remember these credentials**.
4.  **Network Access**: In the Security tab/Network Access, add your IP address or `0.0.0.0/0` (allow from anywhere) to the IP Whitelist.
5.  **Connect**: Click "Connect" on your cluster -> "Connect your application".
6.  **Copy URI**: Copy the connection string. It looks like `mongodb+srv://<user>:<password>@...`.
7.  **Update Config**: Paste this URI into your `.env` file as the `MONGODB_URI` value, replacing `<password>` with your actual database password.

## Project Structure

```bash
src/
├── config/         # Database connection logic
├── controllers/    # Route controllers (logic layer)
├── middleware/     # Custom middleware (ErrorHandler, Validators)
├── models/         # Mongoose Data Models (User, Expense)
├── routes/         # Express Router definitions
├── utils/          # Helper functions not specific to business logic
└── index.ts        # App entry point and server configuration
```

## Assumptions Made

- **Currency**: Amounts are stored as simple numbers. It is assumed the frontend or client handles currency formatting (e.g., USD, EUR).
- **Dates**: Dates are accepted in ISO format string (e.g., "YYYY-MM-DD") and stored as Date objects.
- **User Existence**: An expense cannot be created for a non-existent user ID; the system validates this relationship.
- **Categories**: Expense categories are restricted to a predefined list to ensure consistent reporting.
