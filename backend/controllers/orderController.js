// ======================================================
// IMPORTS
// ======================================================

// MongoDB model for storing order details
import orderModel from "../models/orderModel.js";

// MongoDB model for user (used to clear cart after order)
import userModel from "../models/userModel.js";

// Stripe SDK for handling online payments
import Stripe from 'stripe';

// Create Stripe instance using secret key
// This key allows backend to talk securely with Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// ======================================================
// PLACE ORDER CONTROLLER
// ======================================================
// FLOW:
// Frontend → /api/order/place
// → placeOrder()
// → create order in DB
// → clear cart
// → create Stripe session
// → return Stripe payment URL
// ======================================================
const placeOrder = async (req, res) => {

    // This is the frontend URL where Stripe will redirect the user
    // after payment success or cancellation
    const frontend_url = process.env.FRONTEND_URL || "https://foodify-frontend-4h4v.onrender.com";

    try {
        // --------------------------------------------------
        // STEP 1: CREATE ORDER IN DATABASE
        // --------------------------------------------------
        // Data comes from frontend:
        // req.body = { userId, items, amount, address }
        const newOrder = new orderModel({
            userId: req.body.userId,   // Logged-in user (set by auth middleware)
            items: req.body.items,     // Cart items sent from frontend
            amount: req.body.amount,   // Total order amount
            address: req.body.address  // Delivery address
        });

        // Save order permanently in MongoDB
        await newOrder.save();

        // --------------------------------------------------
        // STEP 2: CLEAR USER CART AFTER ORDER PLACEMENT
        // --------------------------------------------------
        // Once order is placed, cart should be empty
        await userModel.findByIdAndUpdate(
            req.body.userId,
            { cartData: {} }
        );

        // --------------------------------------------------
        // STEP 3: PREPARE STRIPE LINE ITEMS
        // --------------------------------------------------
        // Convert cart items into Stripe format
        // Each item becomes a payable product
        const line_items = req.body.items.map((item) => ({
            // item → comes from req.body.items (frontend cart)  //define in ordermodel.js
            price_data: {
                currency: "inr",       // Indian Rupees
                product_data: {
                    name: item.name    // Food item name
                },
                // Stripe requires amount in smallest unit (paise)
                unit_amount: item.price * 100
            },
            quantity: item.quantity  // Quantity of this item
        }));

        // --------------------------------------------------
        // STEP 4: ADD DELIVERY CHARGES AS EXTRA ITEM
        // --------------------------------------------------
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100    // ₹2 delivery fee
            },
            quantity: 1
        });

        // --------------------------------------------------
        // STEP 5: CREATE STRIPE CHECKOUT SESSION
        // --------------------------------------------------
        // Stripe will host the payment page
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',

            // If payment is successful → redirect here
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,

            // If payment fails/cancelled → redirect here
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        // --------------------------------------------------
        // STEP 6: SEND PAYMENT URL TO FRONTEND
        // --------------------------------------------------
        // Frontend redirects user to Stripe payment page
        res.json({
            success: true,
            session_url: session.url
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};


// ======================================================
// VERIFY ORDER CONTROLLER
// ======================================================
// FLOW:
// Stripe → frontend redirect
// Frontend → /api/order/verify
// → verifyOrder()
// → mark order paid OR delete order
// ======================================================
const verifyOrder = async (req, res) => {

    // orderId and success come from frontend
    const { orderId, success } = req.body;

    try {
        if (success == "true") {
            // --------------------------------------------------
            // PAYMENT SUCCESS CASE
            // --------------------------------------------------
            // Mark order as paid in database
            await orderModel.findByIdAndUpdate(
                orderId,
                { payment: true }
            );

            res.json({ success: true, message: "Paid" });

        } else {
            // --------------------------------------------------
            // PAYMENT FAILED / CANCELLED
            // --------------------------------------------------
            // Remove order because payment was not completed
            await orderModel.findByIdAndDelete(orderId);

            res.json({ success: false, message: "Not Paid" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};


// ======================================================
// USER ORDERS CONTROLLER
// ======================================================
// FLOW:
// Frontend → /api/order/user
// → userOrders()
// → fetch all orders for logged-in user
// ======================================================
const userOrders = async (req, res) => {
    try {
        // userId is injected by auth middleware
        const orders = await orderModel.find({
            userId: req.body.userId
        });

        // Send user orders to frontend
        res.json({ success: true, data: orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};


// ======================================================
// ADMIN: LIST ALL ORDERS
// ======================================================
// FLOW:
// Admin Panel → /api/order/list
// → listOrders()
// → fetch all orders in system
// ======================================================
const listOrders = async (req, res) => {
    try {
        // Fetch all orders (no filter)
        const orders = await orderModel.find({});

        res.json({ success: true, data: orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};


// ======================================================
// ADMIN: UPDATE ORDER STATUS
// ======================================================
// FLOW:
// Admin Panel → /api/order/status
// → updateStatus()
// → update order delivery status
// ======================================================
const updateStatus = async (req, res) => {
    try {
        // Update order status (Processing / Delivered / etc.)
        await orderModel.findByIdAndUpdate(
            req.body.orderId,
            { status: req.body.status }
        );

        res.json({ success: true, message: "Status Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================
export {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus
};


// Frontend (Place Order)
//    ↓
// placeOrder()
//    ↓
// Order saved in DB
//    ↓
// Cart cleared
//    ↓
// Stripe checkout created
//    ↓
// User redirected to Stripe

// Stripe Payment
//    ↓
// Frontend redirect (/verify)
//    ↓
// verifyOrder()
//    ↓
// Order marked paid OR deleted
