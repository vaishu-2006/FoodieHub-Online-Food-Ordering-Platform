# FoodieHub

FoodieHub is a responsive food-ordering application built with React, Vite, Express, and MongoDB. Customers can find local restaurants, browse menus, build a persistent cart, apply a coupon, check out with cash on delivery, and track their orders. A separately protected admin area handles the restaurant catalog, menu availability, customers, and order progress.

## Features

- Responsive storefront, restaurant search and cuisine filters, restaurant menus, vegetarian labels, and availability indicators.
- Persistent single-restaurant cart with quantity controls, delivery fees, free-delivery threshold, and server-validated coupons.
- Customer registration, sign-in, profile editing, saved delivery addresses, order history, and order tracking.
- MongoDB-backed orders with server-calculated prices; customers cannot set order status or submit online-payment success.
- Admin-only dashboard with order/revenue/customer metrics, a seven-day revenue chart, customer list, order-status management, and restaurant/menu CRUD.
- Sample catalog and `FIRSTBITE` coupon available from the idempotent seed command.
- JWT authentication, bcrypt password hashing, input validation, ownership checks, centralized API errors, and explicit admin provisioning.

## Technology

- **Client:** React 18, Vite, JavaScript, Tailwind CSS, React Router, Axios, React Icons, Context API.
- **Server:** Node.js, Express, Mongoose, MongoDB, JWT, bcryptjs, dotenv, CORS.
- **Payments:** Cash on delivery is enabled. No card/mobile payment is claimed or simulated; connect a real payment provider before enabling online payments.

## Project layout

```text
client/
  public/
  src/
    assets/ components/ context/ hooks/ layouts/ pages/ services/ utils/
    App.jsx  main.jsx  index.css
  index.html  package.json  vite.config.js
server/
  config/ controllers/ middleware/ models/ routes/ scripts/ utils/
  server.js  package.json  .env.example
package.json
README.md
```

## Requirements

- Node.js 20.13 or newer and npm.
- MongoDB Community Server running locally, or a MongoDB connection string.

## Setup

From the project root:

1. Install the root development helper and both application packages:

   ```powershell
   npm install
   npm run install:all
   ```

2. Create `server/.env` from the example:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

   Set `MONGODB_URI` to your MongoDB database and replace `JWT_SECRET` with a private random value of at least 32 characters. For example, generate one with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Keep `.env` private; it is ignored by Git. Set `CLIENT_URL` if the client runs on a different origin.

3. Ensure MongoDB is running, then load the sample restaurants, foods, and coupon:

   ```powershell
   npm run seed
   ```

   The seed is safe to rerun: it updates the named sample records rather than deleting the database.

4. Start both applications:

   ```powershell
   npm run dev
   ```

   The Vite client is at [http://localhost:5173](http://localhost:5173), and the API is at [http://localhost:5000](http://localhost:5000). To run one side only, use `npm run dev:client` or `npm run dev:server`.

## Database and administrator setup

The default local database URL is `mongodb://127.0.0.1:27017/foodiehub`. MongoDB creates the database and collections when the seed or application first writes records. No customer-facing registration form can create an administrator.

To provision the first admin securely:

1. Set unique `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_PHONE` values in `server/.env`. Use a unique password of at least 12 characters.
2. Run `npm run create-admin`.
3. Sign in with that account. The admin dashboard and admin API routes require a valid JWT belonging to an account whose database role is `admin`.

The provisioning command refuses to overwrite an existing account. Do not put admin credentials in source code or share the `.env` file.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API and Vite development server together |
| `npm run dev:server` | Start only the Express API |
| `npm run dev:client` | Start only the Vite client |
| `npm run build` | Create the optimized client build in `client/dist` |
| `npm run seed` | Upsert the sample catalog and `FIRSTBITE` coupon |
| `npm run create-admin` | Create an administrator from private environment variables |

## API reference

JSON errors use `{ "message": "..." }`. Protected endpoints expect `Authorization: Bearer <JWT>`. Admin endpoints additionally require the `admin` role. Prices and order totals are calculated by the server from current menu records.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a customer account |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | Signed in | Read the current account |
| `PUT` | `/api/auth/profile` | Signed in | Update name, phone, and saved addresses |
| `GET` | `/api/restaurants` | Public | List active restaurants; optional `?cuisine=Pizza` |
| `GET` | `/api/restaurants/:id` | Public | Read one active restaurant |
| `POST` | `/api/restaurants` | Admin | Create a restaurant |
| `PUT` | `/api/restaurants/:id` | Admin | Update a restaurant |
| `DELETE` | `/api/restaurants/:id` | Admin | Delete a restaurant and its menu |
| `GET` | `/api/foods` | Public | List menu items; optional `restaurantId`, `category`, and `available=true` filters |
| `GET` | `/api/foods/:id` | Public | Read one menu item |
| `POST` | `/api/foods` | Admin | Create a menu item |
| `PUT` | `/api/foods/:id` | Admin | Update a menu item |
| `PATCH` | `/api/foods/:id/availability` | Admin | Change menu availability |
| `DELETE` | `/api/foods/:id` | Admin | Delete a menu item |
| `POST` | `/api/orders` | Signed in | Place a COD order; body includes `restaurantId`, `items: [{ foodId, quantity }]`, and `deliveryAddress` |
| `GET` | `/api/orders/my-orders` | Signed in | List the signed-in customer’s orders |
| `GET` | `/api/orders` | Admin | List recent orders |
| `GET` | `/api/orders/:id` | Owner or admin | Read one order |
| `PUT` | `/api/orders/:id/status` | Admin | Advance an order through `confirmed`, `preparing`, `out_for_delivery`, or `delivered`; cancellation is allowed before completion |
| `GET` | `/api/admin/dashboard` | Admin | Read summary metrics, recent orders, and seven-day sales |
| `GET` | `/api/admin/orders` | Admin | See all orders (same protected `GET /api/orders` endpoint) |
| `GET` | `/api/admin/customers` | Admin | List customer contact details |
| `GET` | `/api/admin/inventory` | Admin | List restaurants and menu items, including paused records |
| `POST` | `/api/coupons/validate` | Signed in | Validate `{ "code": "FIRSTBITE", "subtotal": 500 }` |
| `GET` | `/api/health` | Public | Check API availability |

### Example order body

```json
{
  "restaurantId": "restaurant-object-id",
  "items": [{ "foodId": "food-object-id", "quantity": 2 }],
  "deliveryAddress": {
    "label": "Home",
    "name": "Sam Customer",
    "line1": "42 Example Street",
    "city": "Bengaluru",
    "postalCode": "560001",
    "phone": "+91 98765 43210"
  },
  "paymentMethod": "cash_on_delivery",
  "couponCode": "FIRSTBITE"
}
```

Order statuses progress in order from placed → confirmed → preparing → out for delivery → delivered. Customers can read their own status but only admins can change it.

## Screenshots

The storefront, restaurant menu, customer checkout/order tracking, and admin dashboard are all available in the running application. Capture screenshots at those routes after starting the client and API; no screenshots are bundled yet.
