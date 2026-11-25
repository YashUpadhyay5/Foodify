import mongoose from 'mongoose';

const orderSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Food Processing"},
    date:{type:Date,default:Date.now()},
    payment:{type:Boolean,default:false}
})

const orderModel =mongoose.models.order || mongoose.model("order",orderSchema);

export default orderModel;




/*
==================== FOOD APP COMPLETE FLOW ====================

1️⃣ USER REGISTRATION
------------------------------------------------------------
User fills registration form → clicks Register button
  ↓ triggers
Frontend axios.post("/api/user/register", { name, email, password })
  ↓ sends
Request body with name, email, password
  ↓ received by
Backend POST /api/user/register
  ↓ backend actions
- Hash password using bcrypt
- Save user in MongoDB
- Create JWT token:
    jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" })
  ↓ response sent
{ success: true, token: "JWT_TOKEN" }
  ↓ frontend stores
- localStorage.setItem("token", token)
- StoreContext.token = token
Purpose: token identifies logged-in user in future requests

2️⃣ USER LOGIN
------------------------------------------------------------
User enters email + password → clicks Login
  ↓ triggers
Frontend axios.post("/api/user/login", { email, password })
  ↓ backend actions
- Verify password
- Create JWT token (same as registration)
  ↓ response sent
{ success: true, token: "JWT_TOKEN" }
  ↓ frontend stores
- localStorage
- StoreContext.token
Purpose: token used for all protected APIs

3️⃣ ADD TO CART
------------------------------------------------------------
User clicks "+ Add" button on item
  ↓ triggers
addToCart(itemId) [frontend function in StoreContext]
  ↓ updates
cartItems state:
cartItems = { itemId1: 2, itemId2: 1 }
  ↓ explanation
- quantity = number of times user clicked "+"
- stored in frontend state only (not DB yet)

4️⃣ PLACE ORDER
------------------------------------------------------------
User clicks "Place Order" button
  ↓ triggers
placeOrder(event) function in PlaceOrder.jsx
  ↓ builds orderItems
- Loop over food_list
- For each item where cartItems[item._id] > 0
  - let itemInfo = item
  - itemInfo["quantity"] = cartItems[item._id]
  - orderItems.push(itemInfo)
  ↓ builds orderData
let orderData = {
  address: formData,
  items: orderItems,
  amount: getTotalCartAmount() + deliveryFee
}
  ↓ axios POST
axios.post("/api/order/place", orderData, { headers: { token } })
  ↓ backend
- authMiddleware decodes JWT → req.userId
- save new order in orderModel
- clear user cart in DB: cartData = {}
- create Stripe checkout session
- send session_url back to frontend
  ↓ frontend
window.location.replace(session_url)
Purpose: redirect user to payment gateway

5️⃣ PAYMENT
------------------------------------------------------------
User completes payment at Stripe
  ↓ Stripe redirects
/frontend/verify?success=true&orderId=123
or
/frontend/verify?success=false&orderId=123

6️⃣ VERIFY PAYMENT
------------------------------------------------------------
Verify.jsx useEffect triggers verifyPayment()
  ↓ axios POST
axios.post("/api/order/verify", { success, orderId })
  ↓ backend
- Check success
- If true → update orderModel { payment: true }
- If false → delete order from DB
  ↓ frontend
- success → navigate("/myorders")
- fail → navigate("/")

7️⃣ MY ORDERS (Protected Page)
------------------------------------------------------------
Frontend MyOrders.jsx useEffect triggers fetchOrders()
  ↓ axios POST
axios.post("/api/order/userorders", {}, { headers: { token } })
  ↓ backend
- authMiddleware decodes JWT → get userId
- fetch orders for that user
- return: { success: true, data: [order1, order2, ...] }
  ↓ frontend
- setData(response.data.data)
- React re-renders UI
- Shows only logged-in user’s orders

8️⃣ TOKEN FLOW
------------------------------------------------------------
- Token created during login/register
- Stored in localStorage & StoreContext
- Sent in headers for protected APIs (axios)
- Backend authMiddleware:
    jwt.verify(token) → req.userId
- Used in backend to secure cart, order, payment, fetch order APIs
- Without token, user cannot access protected routes

9️⃣ CART QUANTITY FLOW
------------------------------------------------------------
- User clicks "+" on frontend
- addToCart(itemId) updates cartItems[itemId]
- cartItems stored in StoreContext state
- placeOrder() reads cartItems
- itemInfo["quantity"] = cartItems[item._id]
- axios sends quantity to backend in req.body.items
- Stripe checkout uses item.quantity for payment

==================== END OF FLOW ====================
*/
