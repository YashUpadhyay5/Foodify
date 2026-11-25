// Import React core features
import React, { useContext, useEffect } from 'react';

// Import CSS for loading spinner UI
import './Verify.css';

// React Router hooks
// useNavigate → used to redirect user programmatically
// useSearchParams → used to read URL query parameters (?success=true&orderId=123)
import { useNavigate, useSearchParams } from 'react-router-dom';

// StoreContext → global store (URL, cart, auth, etc.)
import { StoreContext } from '../../context/StoreContext';

// Axios → for making HTTP requests to backend
import axios from 'axios';

const Verify = () => {

    // ----------------------------------
    // 1️⃣ Read query parameters from URL
    // ----------------------------------

    // Example URL:
    // /verify?success=true&orderId=65fd123abc

    const [searchParams, setSearchParams] = useSearchParams();

    // Get "success" value from URL
    // success = "true" or "false"
    const success = searchParams.get("success");

    // Get orderId from URL
    const orderId = searchParams.get("orderId");

    // ----------------------------------
    // 2️⃣ Access global values from StoreContext
    // ----------------------------------

    // url = backend base URL
    // Example: http://localhost:5000
    const { url } = useContext(StoreContext);

    // ----------------------------------
    // 3️⃣ Navigation hook
    // ----------------------------------

    // Used to redirect user after verification
    const navigate = useNavigate();

    // ----------------------------------
    // 4️⃣ Payment verification function
    // ----------------------------------

    const verifyPayment = async () => {
        try {
            // Send success + orderId to backend for verification
            const response = await axios.post(
                url + "/api/order/verify",
                { success, orderId }
            );

            // If backend confirms payment success
            if (response.data && response.data.success) {
                // Redirect user to My Orders page
                navigate("/myorders");
            } else {
                // If payment failed → redirect to home
                navigate("/");
            }
        } catch (err) {
            console.error("Error verifying payment:", err);
            navigate("/");
        }
    };

    // ----------------------------------
    // 5️⃣ useEffect → runs ONCE when page loads
    // ----------------------------------

    useEffect(() => {
        // Automatically verify payment
        verifyPayment();
    }, []); // Empty dependency array → run once only

    // ----------------------------------
    // 6️⃣ UI while verification is happening
    // ----------------------------------

    return (
        <div className='verify'>
            {/* Loading spinner shown while backend verifies payment */}
            <div className="spinner"></div>
        </div>
    );
};

export default Verify;
