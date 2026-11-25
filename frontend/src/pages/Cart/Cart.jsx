import React, { useContext } from 'react'
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

// ========== CART COMPONENT ==========
// Displays all items user added to cart with quantities and totals
// Also shows cart summary and checkout button
const Cart = ({ setShowLogin }) => {

  // ========== EXTRACT DATA FROM GLOBAL CONTEXT ==========
  // All data comes from StoreContext (centralized state management)
  const {cartItems,food_list,removeFromCart,getTotalCartAmount,url,token} = useContext(StoreContext);
  // cartItems: Object with {itemId: quantity} → Which items user added and how many
  // food_list: Array of all available foods with details (name, price, image, etc)
  // removeFromCart: Function to decrease quantity when user clicks X
  // getTotalCartAmount: Function to calculate total price of all items
  // url: Backend URL for loading images

  // useNavigate: Function to navigate to different pages (like checkout)
  const navigate=useNavigate()

  return (
    <div className='cart'>
      {/* ========== CART ITEMS SECTION ==========
          Displays table of items user added to cart
      */}
      <div className="cart-items">
        {/* ========== TABLE HEADER ROW ==========
            Shows column names for the cart table
        */}
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {/* ========== EMPTY CART NOTICE ========== */}
        {getTotalCartAmount() === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <p style={{ fontSize: "18px", color: "#676767", marginBottom: "15px" }}>Your cart is currently empty.</p>
            <button 
              onClick={() => navigate('/')} 
              style={{ background: "#ff6347", color: "white", padding: "10px 24px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
            >
              Browse Delicious Dishes
            </button>
          </div>
        )}

        {/* ========== LOOP THROUGH ALL FOODS ==========
            food_list.map() creates row for each food item
            But ONLY shows foods that user added (quantity > 0)
        */}
        {food_list.map((item,index)=>{
            // ========== FILTER: CHECK IF ITEM IS IN CART ==========
            // cartItems[item._id] gets the quantity of this specific item
            // If > 0: User added it → Show in cart
            // If 0/undefined: User didn't add it → Skip (don't show)
            if(cartItems[item._id]>0){
              return (
                <div key={index}>
                  {/* ========== SINGLE CART ITEM ROW ==========
                      Displays all info for ONE item user added
                  */}
                  <div className='cart-items-title cart-items-item'>
                      {/* ========== ITEM IMAGE ==========
                          url: Backend API URL
                          item.image: Filename (e.g., "pizza.jpg")
                          Full path: "http://backend.com/images/pizza.jpg"
                      */}
                      <img src={url+"/images/"+item.image} alt="" />
                      
                      {/* ========== ITEM NAME ==========
                          Shows the food name from food_list
                      */}
                      <p>{item.name}</p>
                      
                      {/* ========== ITEM PRICE ==========
                          Shows single item price (not total)
                          Example: ₹500
                      */}
                      <p>₹{item.price}</p>
                      
                      {/* ========== QUANTITY ==========
                          Gets quantity from cartItems object
                          cartItems[item._id] = how many user added
                          Example: 2 (user added pizza 2 times)
                      */}
                      <p>{cartItems[item._id]}</p>
                      
                      {/* ========== TOTAL FOR THIS ITEM ==========
                          Calculates: Price × Quantity
                          item.price = 500
                          cartItems[item._id] = 2
                          Total = 500 × 2 = ₹1000
                      */}
                      <p>₹{item.price*cartItems[item._id]}</p>
                      
                      {/* ========== REMOVE BUTTON ==========
                          Clicking X removes this item from cart
                          onClick calls removeFromCart(item._id)
                          Function decreases quantity by 1
                          When quantity reaches 0, item disappears from cart
                      */}
                      <p onClick={()=>removeFromCart(item._id)} className='cross'>x</p>
                  </div>
                  <hr />
                </div>
              )
            }
        })}
      </div>

      {/* ========== CART BOTTOM SECTION ==========
          Shows totals, delivery fee, and checkout button
      */}
      <div className="cart-bottom">
        {/* ========== CART TOTAL BOX ==========
            Displays price breakdown
        */}
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            {/* ========== SUBTOTAL ==========
                Sum of all items without delivery fee
                getTotalCartAmount() function from StoreContext
                Example: ₹1000 + ₹300 = ₹1300
            */}
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            
            {/* ========== DELIVERY FEE ==========
                Fixed fee if cart has items
                If cart empty (total = 0): No fee (0)
                If cart has items (total > 0): Fee = ₹2
                Ternary: {condition ? true value : false value}
            */}
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount()===0 ? 0 :2}</p>
            </div>
            <hr />
            
            {/* ========== FINAL TOTAL ==========
                Subtotal + Delivery Fee
                If cart empty: 0 + 0 = 0
                If cart has items: getTotalCartAmount() + 2
                Example: 1300 + 2 = ₹1302
            */}
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount()===0 ? 0 : getTotalCartAmount()+2}</b>
            </div>
          </div>
          
          {/* ========== CHECKOUT BUTTON ==========
              Navigates to /order page for payment (or prompts if empty/unauthenticated)
          */}
          <button 
            disabled={getTotalCartAmount() === 0}
            style={{
              opacity: getTotalCartAmount() === 0 ? 0.6 : 1,
              cursor: getTotalCartAmount() === 0 ? "not-allowed" : "pointer"
            }}
            onClick={() => {
              if (getTotalCartAmount() === 0) {
                alert("Your cart is empty! Please add some dishes to your cart first.");
                navigate('/');
                return;
              }
              if (!token) {
                if (setShowLogin) setShowLogin(true);
              } else {
                navigate('/order');
              }
            }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        {/* ========== PROMO CODE SECTION ==========
            Optional discount code input (for future feature)
        */}
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

/* ========== COMPLETE CART FLOW EXPLANATION ==========

STEP 1: COMPONENT LOADS
  - Cart.jsx mounts
  - useContext extracts: cartItems, food_list, removeFromCart, getTotalCartAmount, url
  - All data from global StoreContext (centralized state)

STEP 2: DISPLAY ITEMS
  - food_list.map() loops through ALL available foods
  - For each food, checks: if(cartItems[item._id] > 0)
  - Only foods with quantity > 0 are displayed
  - Creates table rows for each item in cart

STEP 3: SHOW ITEM DETAILS
  For each item in cart, displays:
  ├─ Image: url + "/images/" + item.image
  ├─ Name: item.name
  ├─ Price: item.price (single item price)
  ├─ Quantity: cartItems[item._id] (how many user added)
  ├─ Total: item.price × cartItems[item._id] (row total)
  └─ Remove: X button to delete item

STEP 4: CALCULATE TOTALS
  - Subtotal: getTotalCartAmount()
    Sums up all items: (price × qty) for each item
  - Delivery Fee: 0 if empty, ₹2 if has items
  - Final Total: Subtotal + Delivery Fee

STEP 5: CHECKOUT
  - User clicks "PROCEED TO CHECKOUT"
  - navigate('/order') takes to order/payment page

DATA FLOW DIAGRAM:
┌──────────────────────────────────────┐
│      StoreContext (Global State)     │
│                                      │
│  cartItems = {id1: qty, id2: qty}   │
│  food_list = [{id, name, price}...] │
│  url = "http://backend.com"         │
└──────────────────────────────────────┘
           ↓ (useContext extracts)
┌──────────────────────────────────────┐
│      Cart.jsx Component              │
│                                      │
│  Loop: food_list.map()              │
│    ↓ Filter: if qty > 0             │
│    ├─ Show Item                     │
│    ├─ Show Price                    │
│    ├─ Show Quantity                 │
│    ├─ Show Total                    │
│    └─ Show Remove Button            │
│                                      │
│  Calculate: getTotalCartAmount()    │
│  Add Delivery Fee: ₹2                │
│  Final Total: Subtotal + Fee        │
│  Button: Navigate to /order          │
└──────────────────────────────────────┘

EXAMPLE: User Cart Contents
cartItems = {
  "pizza123": 2,      // Pizza, quantity 2
  "burger456": 1,     // Burger, quantity 1
  "biryani789": 0     // Biryani, quantity 0 (not shown)
}

food_list = [
  {_id: "pizza123", name: "Pizza", price: 500, image: "pizza.jpg"},
  {_id: "burger456", name: "Burger", price: 300, image: "burger.jpg"},
  {_id: "biryani789", name: "Biryani", price: 250, image: "biryani.jpg"},
  {_id: "dosa123", name: "Dosa", price: 100, image: "dosa.jpg"}
]

CART DISPLAY:
┌────────┬─────────┬───────┬───────┬────────┬────────┐
│ Image  │ Title   │ Price │ Qty   │ Total  │ Remove │
├────────┼─────────┼───────┼───────┼────────┼────────┤
│ 🍕    │ Pizza   │ ₹500  │ 2     │ ₹1000  │ x      │
├────────┼─────────┼───────┼───────┼────────┼────────┤
│ 🍔    │ Burger  │ ₹300  │ 1     │ ₹300   │ x      │
└────────┴─────────┴───────┴───────┴────────┴────────┘
(Biryani NOT shown because quantity = 0)
(Dosa NOT shown because not in cartItems)

TOTALS:
Subtotal: ₹1000 + ₹300 = ₹1300
Delivery Fee: ₹2
Total: ₹1302

REMOVE FUNCTIONALITY:
- User clicks X on Pizza row
- removeFromCart("pizza123") called
- StoreContext decreases: cartItems["pizza123"] = 2 → 1
- Cart re-renders
- Pizza still shows (qty = 1 > 0)

- User clicks X on Pizza again
- removeFromCart("pizza123") called
- StoreContext decreases: cartItems["pizza123"] = 1 → 0
- Cart re-renders
- Pizza HIDDEN (qty = 0 is not > 0)

NAVIGATION FLOW:
User clicks "PROCEED TO CHECKOUT"
        ↓
navigate('/order')
        ↓
Navigates to PlaceOrder page (/order route)
        ↓
PlaceOrder page shows order form
        ↓
User enters delivery details
        ↓
Processes payment

================================================ */
