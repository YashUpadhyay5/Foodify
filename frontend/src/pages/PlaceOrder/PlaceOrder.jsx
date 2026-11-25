// ======================================================
// IMPORTS
// ======================================================

// React hooks:
// useContext → to access global store (cart, token, etc.)
// useEffect → to run checks when page loads
// useState → to store form input data
import React, { useContext, useEffect, useState } from 'react';

// CSS for styling
import './PlaceOrder.css';

// Global store context (cart, token, food list, backend URL)
import { StoreContext } from '../../context/StoreContext';

// Axios → to send HTTP request to backend
import axios from 'axios';

// useNavigate → to redirect user programmatically
import { useNavigate } from 'react-router-dom';


// ======================================================
// COMPONENT START
// ======================================================
const PlaceOrder = ({ setShowLogin }) => {

  // --------------------------------------------------
  // GET DATA FROM STORE CONTEXT
  // --------------------------------------------------
  // These values are coming from StoreContext.jsx
  const {
    getTotalCartAmount, // function → calculates cart total
    token,              // JWT token → user authentication
    food_list,          // all food items from backend
    cartItems,          // cart object → {foodId: quantity}
    url                 // backend base URL
  } = useContext(StoreContext);


  // --------------------------------------------------
  // STATE: DELIVERY FORM DATA
  // --------------------------------------------------
  // This state stores ALL input field values
  // Each key matches the "name" attribute of input fields
  const [data, setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""
  });


  // ==================================================
  // INPUT CHANGE HANDLER
  // ==================================================
  // 🔹 TRIGGERED WHEN?
  // → Whenever user types in ANY input field
  //
  // 🔹 HOW IT WORKS:
  // event.target.name  → input name (firstName, city, etc.)
  // event.target.value → typed value
  //
  // 🔹 DYNAMIC UPDATE:
  // [name]: value updates correct field automatically
  const onChangeHandler = (event) => {

    const name = event.target.name;     // which input
    const value = event.target.value;   // typed value

    // Update state without removing old values
    setData(data => ({
      ...data,
      [name]: value
    }));
  };


  // ==================================================
  // PLACE ORDER FUNCTION
  // ==================================================
  // 🔹 TRIGGERED WHEN?
  // → User clicks "PROCEED TO PAYMENT"
  // → <form onSubmit={placeOrder}>
  //
  // 🔹 ROLE:
  // 1. Collect cart items
  // 2. Create order object
  // 3. Send order to backend
  // 4. Redirect to Stripe
  const placeOrder = async (event) => {

    // Stop page refresh (default form behavior)
    event.preventDefault();

    // ------------------------------------------------
    // STEP 1: BUILD ORDER ITEMS FROM CART
    // ------------------------------------------------
    let orderItems = [];

    // Loop over all food items
   // Quantity originates from the cart state in the frontend, is attached to each product during order creation, transmitted to the backend via API, and finally used by Stripe to calculate the payment amount.
    food_list.map((item) => {

      // cartItems[item._id] → quantity of this item  // qunatity is come from the 
      /*
+ Click (UI)
   ↓
addToCart() → StoreContext
   ↓
cartItems state updated (itemId : quantity)
   ↓
PlaceOrder.jsx reads cartItems using useContext
   ↓
placeOrder() triggered on form submit
   ↓
quantity attached to each food item (itemInfo.quantity)
   ↓
axios POST request sends order data
   ↓
Backend receives data in req.body.items
   ↓
Stripe checkout uses item.quantity for payment calculation
*/

      if (cartItems[item._id] > 0) {

        // Copy item data
        let itemInfo = item;

        // Add quantity field
        itemInfo["quantity"] = cartItems[item._id];      // let obj = { a: 10 }; key value pairs 
                                                          //obj["a"] → 10


        // Push into order array
        orderItems.push(itemInfo);
      }
    });

    // ------------------------------------------------
    // STEP 2: CREATE FINAL ORDER OBJECT
    // ------------------------------------------------
    // This object goes to backend
    let orderData = {
      address: data,                    // delivery form data
      items: orderItems,                // cart items
      amount: getTotalCartAmount() + 2  // total + delivery fee
    };

    // ------------------------------------------------
    // STEP 3: SEND ORDER TO BACKEND
    // ------------------------------------------------
    let response = await axios.post(
      url + "/api/order/place",          // backend API
      orderData,                         // request body
      { headers: { token } }             // JWT token
    );

    // ------------------------------------------------
    // STEP 4: HANDLE BACKEND RESPONSE
    // ------------------------------------------------
    if (response.data.success) {

      // Stripe checkout URL from backend
      
      const { session_url } = response.data;

      // Redirect user to Stripe payment page
      // Frontend redirection
      window.location.replace(session_url);

    } else {
      alert(response.data.message || "Error");
    }
  };


  // ==================================================
  // NAVIGATION HOOK
  // ==================================================
  const navigate = useNavigate();


  // ==================================================
  // AUTH + CART CHECK (PAGE LOAD)
  // ==================================================
  // 🔹 TRIGGERED WHEN?
  // → Component mounts
  // → token changes
  //
  // 🔹 PURPOSE:
  // 1. Block access if user not logged in
  // 2. Block access if cart is empty
  useEffect(() => {

    // If user not logged in → prompt login and go to cart
    if (!token) {
      if (setShowLogin) setShowLogin(true);
      navigate('/cart');
    }

    // If cart empty → go to cart
    else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }

  }, [token]); // dependency → runs when token changes


  // ==================================================
  // JSX (UI)
  // ==================================================
  return (

    // onSubmit triggers placeOrder()
    <form onSubmit={placeOrder} className='place-order'> 

      {/* LEFT SIDE → DELIVERY FORM */}
      <div className="place-order-left">

        <p className="title">Delivery Information</p>

        <div className="multi-feilds">
          <input
            required
            name='firstName'
            value={data.firstName}// onChange={onChangeHandler} automatically update the value of firstName which is typed by user
            onChange={onChangeHandler}// whwen user type in firstName input field it will call onChangeHandler function
            type="text"
            placeholder='First Name'
          />
          <input
            required
            name='lastName'
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder='Last Name'
          />
        </div>

        <input
          required
          name='email'
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder='Email address'
        />

        <input
          required
          name='street'
          value={data.street}// onChange={onChangeHandler} automatically update the value of street which is typed by user
          onChange={onChangeHandler}// whwen user type in street input field it will call onChangeHandler function
          type="text"
          placeholder='Street'
        />

        <div className="multi-feilds">
          <input
            required
            name='city'
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder='City'
          />
          <input
            required
            name='state'
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder='State'
          />
        </div>

        <div className="multi-feilds">
          <input
            required
            name='zipcode'
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder='Zip Code'
          />
          <input
            required
            name='country'
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder='Country'
          />
        </div>

        <input
          required
          name='phone'
          value={data.phone}
          onChange={onChangeHandler}
          type="text"
          placeholder='Phone'
        />

      </div>


      {/* RIGHT SIDE → CART SUMMARY */}
      <div className="place-order-right">
        <div className="cart-total">

          <h2>Cart Totals</h2>

          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button type='submit'>PROCEED TO PAYMENT</button>

        </div>
      </div>

    </form>
  );
};

export default PlaceOrder;




