import React, { useEffect, useState } from 'react'
import './Orders.css'; // CSS styles for Orders page
import axios from 'axios'; // HTTP client for API calls
import { toast } from 'react-toastify' // For showing notifications
import { assets } from '../../assets/assets' // Import images/icons used in UI

// ===================== ORDERS COMPONENT =====================
const Orders = ({ url }) => {

  // -----------------------------
  // React state to store all orders
  // -----------------------------
  const [orders, setOrders] = useState([]); 
  // orders → array of order objects fetched from backend

  // ===================== FETCH ALL ORDERS =====================
  const fetchAllOrders = async () => {
    try {
      // GET request to backend route /api/order/list
      const response = await axios.get(url + "/api/order/list");

      // If backend responds with success
      if (response.data.success) {
        // Save orders into state
        setOrders(response.data.data); 
        // response.data.data → array of orders
        console.log(response.data.data); // debug log
      } else {
        toast.error("Error fetching orders"); // Show error notification
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching orders"); // Show error notification
    }
  }

  // ===================== STATUS HANDLER =====================
  const statusHandler = async (event, orderId) => {
    try {
      // POST request to backend to update order status
      const response = await axios.post(url + "/api/order/status", {
        orderId, // ID of the order to update
        status: event.target.value // new status selected from <select> dropdown
      });

      // If update is successful, refresh orders list
      if (response.data.success) {
        await fetchAllOrders(); // re-fetch orders to reflect updated status
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating order status");
    }
  }

  // ===================== USE EFFECT =====================
  // Runs once when component mounts
  useEffect(() => {
    fetchAllOrders(); // fetch all orders when page loads
  }, []); // empty dependency array → run only once

  // ===================== RENDER =====================
  return (
    <div className='order add'> 
      {/* Root container for Orders page */}
      
      <h3>Order Page</h3> 
      {/* Page heading */}

      <div className="order-list"> 
        {/* Container holding all order cards */}

        {orders.map((order, index) => ( 
          // Loop through each order in orders state
          <div key={index} className="order-item">
            {/* Individual order card */}

            <img src={assets.parcel_icon} alt="" /> 
            {/* Parcel icon → imported from assets */}

            <div>
              <p className='order-items-food'>
                {order.items.map((item, index) => {
                  // Loop through items in this order
                  // order.items → comes from backend response

                  if (index === order.items.length - 1) {
                    // Last item → no comma
                    return item.name + " x " + item.quantity; 
                    // item.quantity → number of this item ordered
                  } else {
                    // Other items → comma separator
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>

              <p className="order-item-name">
                {/* Customer full name */}
                {order.address.firstName + " " + order.address.lastName}
                {/* order.address → from backend order object */}
              </p>

              <div className="order-item-address">
                {/* Customer address */}
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>

              <p className='order-item-phone'>
                {/* Customer phone number */}
                {order.address.phone}
              </p>
            </div>

            {/* Total number of items in this order */}
            <p>Items : {order.items.length}</p>

            {/* Total order amount */}
            <p>${order.amount}</p>
            {/* order.amount → comes from backend → sum of all item prices + delivery */}

            {/* Dropdown to change order status */}
            <select 
              onChange={(event) => statusHandler(event, order._id)} 
              value={order.status}
            >
              {/* onChange → triggers statusHandler function */}
              {/* order._id → unique ID from backend for this order */}
              {/* value → current status of order from backend */}

              <option value="Food Processing">
                Food Processing
                {/* Option text and value → shown in dropdown */}
              </option>

              <option value="Out for delivery">
                Out for delivery
              </option>

              <option value="Delivered">
                Delivered
              </option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
