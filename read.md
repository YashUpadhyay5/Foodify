# Foodify Learning Flow Guide

This guide explains the main flow from frontend to backend in the Foodify repository, shows which folders and files are involved, and recommends the best order to learn so you can understand everything step by step.

---

## 1. Start with the Project Structure

### Main folders
- `frontend/` - React app for users
- `backend/` - Express server, APIs, MongoDB models
- `admin/` - admin panel app (separate project)

### Most important folders to learn first
- `frontend/src/` - user interface and frontend logic
- `backend/` - server entry, routes, controllers, middleware, models

---

## 2. Learn the Frontend First

### 2.1 Entry point
- `frontend/src/main.jsx`
  - wraps the app with `BrowserRouter`
  - wraps the app with `StoreContextProvider`
  - renders `<App />`

### 2.2 App root
- `frontend/src/App.jsx`
  - main routes for `/`, `/cart`, `/order`, `/verify`, `/myorders`
  - shows `Navbar`, `Footer`, and login popup state
  - controls user login modal

### 2.3 Shared state and API logic
- `frontend/src/context/StoreContext.jsx`
  - holds app-wide state: `food_list`, `cartItems`, `token`
  - fetches food list from backend
  - loads saved token and cart on page refresh
  - defines `addToCart`, `removeFromCart`, `loadCartData`
  - uses `axios` to call backend APIs

### 2.4 Pages and user flow
- `frontend/src/pages/Home/Home.jsx`
  - displays header, category menu, food list, app download section
- `frontend/src/pages/Cart/Cart.jsx`
  - shows cart items and order summary
- `frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
  - handles checkout and payment flow
- `frontend/src/pages/Verify/Verify.jsx`
  - verifies payment success and order status
- `frontend/src/pages/MyOrders/MyOrders.jsx`
  - shows user order history

### 2.5 Important frontend flow
1. App starts in `main.jsx`
2. `StoreContextProvider` loads food and token
3. `Home` page fetches and displays foods
4. User clicks `Add to Cart`
5. `StoreContext.addToCart()` updates UI and calls backend `/api/cart/add`
6. Cart data is loaded from backend when the user is logged in

---

## 3. Learn the Backend Next

### 3.1 Server entry
- `backend/server.js`
  - creates Express app
  - configures `express.json()` and `cors()`
  - connects to MongoDB with `connectDB()`
  - mounts route modules:
    - `/api/food` → `foodRoute.js`
    - `/api/user` → `userRoute.js`
    - `/api/cart` → `cartRoute.js`
    - `/api/order` → `orderRoute.js`
  - serves uploaded images from `/images`

### 3.2 Routes
- `backend/routes/foodRoute.js`
  - `POST /api/food/add` → add new food item with image upload
  - `GET /api/food/list` → list all foods
  - `POST /api/food/remove` → delete a food item
- `backend/routes/userRoute.js`
  - `POST /api/user/login` → login
  - `POST /api/user/register` → register
- `backend/routes/cartRoute.js`
  - `POST /api/cart/add` → add item to cart
  - `POST /api/cart/remove` → remove item from cart
  - `POST /api/cart/get` → get cart data
- `backend/routes/orderRoute.js`
  - order and payment endpoints

### 3.3 Controllers
- `backend/controllers/foodController.js`
  - logic for food listing, adding, deleting
- `backend/controllers/userController.js`
  - handles login, register, JWT token creation
- `backend/controllers/cartController.js`
  - handles adding items, removing items, getting cart
- `backend/controllers/orderController.js`
  - handles placing and verifying orders

### 3.4 Middleware
- `backend/middleware/auth.js`
  - checks `token` from request headers
  - verifies JWT with `JWT_SECRET`
  - attaches `req.body.userId` for protected routes

### 3.5 Models
- `backend/models/userModel.js`
  - user schema with `name`, `email`, `password`, `cartData`
  - saves user cart in MongoDB
- `backend/models/foodModel.js`
  - food item schema and fields
- `backend/models/orderModel.js`
  - order schema and order status fields

---

## 4. Full request flow: Frontend → Backend → Database

This section explains complete flows in separate parts. Each part is a full feature from frontend interaction to backend processing and database updates.

### 4.1 Authentication flow (login/register)

#### Frontend files
- `frontend/src/components/LoginPopup/LoginPopup.jsx`
- `frontend/src/App.jsx`
- `frontend/src/context/StoreContext.jsx`

#### Backend files
- `backend/routes/userRoute.js`
- `backend/controllers/userController.js`
- `backend/middleware/auth.js`
- `backend/models/userModel.js`

#### Step-by-step auth flow
1. User clicks login/signup in `Navbar` and opens `LoginPopup`.
2. The form submits `POST /api/user/login` or `POST /api/user/register` using `axios`.
3. `backend/routes/userRoute.js` receives the request and forwards it to `loginUser` or `registerUser`.
4. `backend/controllers/userController.js` validates credentials and checks MongoDB via `userModel`.
5. If successful, backend creates a JWT token with `jwt.sign({ id: user._id }, JWT_SECRET)`.
6. Backend returns JSON with `success: true` and `token`.
7. Frontend saves the token to `localStorage` and to `StoreContext.token`.

#### Token flow (why it matters)
- After login, the token proves the user is authenticated.
- The frontend never sends userId directly.
- For protected operations, the frontend sends `headers: { token }`.
- `backend/middleware/auth.js` verifies the token and sets `req.body.userId`.
- Controllers use `req.body.userId` securely to access that user’s data.

### 4.2 Food list flow

#### Frontend files
- `frontend/src/context/StoreContext.jsx`
- `frontend/src/pages/Home/Home.jsx`
- `frontend/src/components/FoodDisplay/FoodDisplay.jsx`
- `frontend/src/components/FoodItem/FoodItem.jsx`

#### Backend files
- `backend/routes/foodRoute.js`
- `backend/controllers/foodController.js`
- `backend/models/foodModel.js`

#### Step-by-step food list flow
1. On app load, `StoreContext.useEffect()` calls `fetchFoodList()`.
2. `fetchFoodList()` sends `GET /api/food/list`.
3. `backend/routes/foodRoute.js` forwards to `listFood` in `foodController.js`.
4. `foodController.js` reads food items from MongoDB and returns them as JSON.
5. Frontend stores `response.data.data` in `food_list`.
6. `FoodDisplay` renders this list and passes each item’s `_id` to `FoodItem`.

### 4.3 Add to cart flow

#### Frontend files
- `frontend/src/context/StoreContext.jsx`
- `frontend/src/components/FoodItem/FoodItem.jsx`
- `frontend/src/pages/Cart/Cart.jsx`

#### Backend files
- `backend/routes/cartRoute.js`
- `backend/controllers/cartController.js`
- `backend/middleware/auth.js`
- `backend/models/userModel.js`

#### Step-by-step add to cart flow
1. User clicks "Add" inside `FoodItem`.
2. `FoodItem` calls `addToCart(itemId)` from `StoreContext`.
3. `StoreContext.addToCart()` updates local `cartItems` state.
4. If the user has a token, it sends `POST /api/cart/add` with `{ itemId }` and `{ headers: { token } }`.
5. `cartRoute.js` runs `authMiddelware` first and then `addToCart`.
6. `auth.js` verifies the token, decodes it, and sets `req.body.userId`.
7. `cartController.js` fetches the user with `userModel.findById(userId)`, updates `cartData`, and saves it.
8. Backend returns `success: true`.

### 4.4 Load cart on refresh

#### Frontend files
- `frontend/src/context/StoreContext.jsx`

#### Backend files
- `backend/routes/cartRoute.js`
- `backend/controllers/cartController.js`
- `backend/middleware/auth.js`
- `backend/models/userModel.js`

#### Step-by-step refresh flow
1. Browser reloads and frontend state resets.
2. `StoreContext.useEffect()` reads `token` from `localStorage`.
3. If token exists, it calls `POST /api/cart/get` with `{ headers: { token } }`.
4. `authMiddelware` verifies the token and attaches `req.body.userId`.
5. `getCart()` uses `userModel.findById(userId)` and returns stored `cartData`.
6. Frontend restores cart state using `setCartItems(response.data.cartData)`.

### 4.5 Checkout and Stripe flow

#### Frontend files
- `frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
- `frontend/src/pages/Verify/Verify.jsx`

#### Backend files
- `backend/routes/orderRoute.js`
- `backend/controllers/orderController.js`
- `backend/models/orderModel.js`
- `backend/models/userModel.js`

#### Step-by-step checkout flow
1. User opens the `PlaceOrder` page after filling cart and address.
2. `PlaceOrder` reads `cartItems`, `food_list`, `token`, and `url` from `StoreContext`.
3. User submits the order form, triggering `placeOrder()`.
4. `placeOrder()` creates `orderItems` with item quantity, address, and total amount.
5. It sends `POST /api/order/place` with order data and `{ headers: { token } }`.
6. `orderRoute.js` runs `authMiddelware` to verify the token.
7. `orderController.placeOrder()` creates a new order in MongoDB and clears the user’s `cartData`.
8. It builds Stripe `line_items` and creates a Stripe checkout session.
9. Backend returns `session_url` to the frontend.
10. Frontend redirects the browser to Stripe for payment.

#### Step-by-step verify flow
1. After payment, Stripe redirects the user back to `frontend_url/verify?success=...&orderId=...`.
2. `Verify.jsx` sends `POST /api/order/verify` with `{ orderId, success }`.
3. `orderController.verifyOrder()` updates the order’s `payment` field or deletes the order if payment failed.
4. Frontend shows success or failure.

---

## 5. Best order to learn the repo

1. `frontend/src/main.jsx` - app bootstrap
2. `frontend/src/App.jsx` - main app and routing
3. `frontend/src/context/StoreContext.jsx` - how data and API calls work
4. `frontend/src/pages/Home/Home.jsx` - main user page
5. `backend/server.js` - how backend starts and mounts routes
6. `backend/routes/cartRoute.js` and `backend/middleware/auth.js` - protected route flow
7. `backend/controllers/cartController.js` - cart logic
8. `backend/controllers/userController.js` - login/register flow
9. `backend/models/userModel.js` - database user/cart shape
10. `backend/routes/foodRoute.js` and `backend/controllers/foodController.js` - food API flow

---

## 6. Quick learning tips

- Learn the frontend first to see how the app works in the browser.
- Then learn the backend to understand where data is stored and validated.
- Follow one flow at a time: food list, login, add cart, checkout.
- Pay attention to `token` headers and `req.body.userId` in protected routes.

---

## 7. Environment variables

### Backend `.env`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for JWT token
- `PORT` - server port

### Frontend `.env`
- `VITE_API_URL` - backend API base URL (optional)

---

## 8. Useful file map

- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/context/StoreContext.jsx`
- `frontend/src/pages/Home/Home.jsx`
- `frontend/src/pages/Cart/Cart.jsx`
- `frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
- `frontend/src/pages/Verify/Verify.jsx`
- `frontend/src/pages/MyOrders/MyOrders.jsx`
- `backend/server.js`
- `backend/routes/foodRoute.js`
- `backend/routes/userRoute.js`
- `backend/routes/cartRoute.js`
- `backend/routes/orderRoute.js`
- `backend/controllers/foodController.js`
- `backend/controllers/userController.js`
- `backend/controllers/cartController.js`
- `backend/controllers/orderController.js`
- `backend/middleware/auth.js`
- `backend/models/userModel.js`
- `backend/models/foodModel.js`
- `backend/models/orderModel.js`
