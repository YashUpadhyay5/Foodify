//first api is made by sing the mongoose schema models then res.json send jsx like succes and data to frontend
// ten frontend use axios to fetch the data from backend and set the data in state and then render the data in jsx
// example from orderController.js
/*
  ↓ axios POST
  //axios.post("/api/order/userorders", {}, { headers: { token } })
  ↓ backend
  - authMiddleware decodes JWT → get userId
  // fetch orders for that user
  - return: { success: true, data: [order1, order2, ...] }
  ↓ frontend
  // make usesate to set the data
  then make the async function in which we call the axios post request to fetch the data from backend
  then call setData(response.data.data)
  then use useEffect to call the function when token is ready
  then in jsx map through the data to render the orders
  - setData(response.data.data)
*/





// React core + hooks
import React, { useContext, useEffect, useState } from 'react';

// CSS for My Orders page UI
import './MyOrders.css';

// Global Store Context (URL, token, etc.)
import { StoreContext } from '../../context/StoreContext';

// Axios for backend API calls
import axios from 'axios';

// Assets (icons, images)
import { assets } from '../../assets/assets';

const MyOrders = () => {

    // ----------------------------------
    // 1️⃣ Get backend URL & auth token
    // ----------------------------------

    // url → backend base URL
    // token → user login token (JWT)
    const { url, token } = useContext(StoreContext);

    // ----------------------------------
    // 2️⃣ State to store user's orders
    // ----------------------------------

    // data = list of orders returned by backend
    const [data, setData] = useState([]);

    // ----------------------------------
    // 3️⃣ Fetch user orders from backend
    // ----------------------------------

    const fetchOrders = async () => {
        try {
            // POST request with token in headers
            const respone = await axios.post(
                url + "/api/order/userorders",
                {},
                { headers: { token } }
            );

            // Save orders into state
            if (respone.data && respone.data.data) {
                setData(respone.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch user orders:", err);
        }
    };

    // ----------------------------------
    // 4️⃣ Fetch orders when token is ready
    // ----------------------------------

    useEffect(() => {

        // Only call API if user is logged in
        if (token) {
            fetchOrders();
        }

    }, [token]); // Runs when token changes

    // ----------------------------------
    // 5️⃣ UI Rendering
    // ----------------------------------

    return (
        <div className='my-orders'>

            {/* Page heading */}
            <h2>My Orders</h2>

            <div className="container">

                {/* Loop through all orders */}
                {data.map((order, index) => {

                    return (
                        <div key={index} className='my-orders-order'>

                            {/* Order icon */}
                            <img src={assets.parcel_icon} alt="" />

                            {/* Order items list */}
                            <p>
                                {order.items.map((item, index) => {

                                    // If last item → no comma
                                    if (index === order.items.length - 1) {
                                        return item.name + "x" + item.quantity;
                                    }
                                    // Else → add comma
                                    else {
                                        return item.name + "x" + item.quantity + ", ";
                                    }
                                })}
                            </p>

                            {/* Total order amount */}
                            <p>₹{order.amount}.00</p>

                            {/* Number of items */}
                            <p>Item:{order.items.length}</p>

                            {/* Order status */}
                            <p>
                                <span>&#x25cf;</span>
                                {" "}
                                <b>{order.status}</b>
                            </p>

                            {/* Refresh order status */}
                            <button onClick={fetchOrders}>
                                Track Order
                            </button>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;
