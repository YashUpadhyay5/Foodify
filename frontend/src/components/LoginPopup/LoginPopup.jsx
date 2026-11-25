import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

// ============================================================
// LoginPopup Component
// ============================================================
// Modal component for user login and registration.
// Receives props from Navbar.jsx (parent) to control visibility.
// ============================================================
const LoginPopup = ({ setShowLogin }) => {
    // PROPS EXPLANATION:
    // setShowLogin: Function passed from Navbar to show/hide the modal
    //   - setShowLogin(true) → opens modal
    //   - setShowLogin(false) → closes modal

    // Access global StoreContext
    const { url, setToken, loadCartData } = useContext(StoreContext);
    // url: Backend API base URL
    // setToken: Function to store JWT token in global state

    // Track whether user is in "Login" or "Sign up"  / registrayion mode
    const [currState, setCurrState] = useState("Login");

    // Track form input values
    // Initially empty
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    // ============================================================
    // Handle input changes
    // ============================================================
    const onChangeHandler = (event) => {
        const name = event.target.name;  // "name", "email", or "password"  it is key
        const value = event.target.value; // current typed value   it value of the key

        // Update only the changed field, keep other values intact
        setData(prevData => ({ ...prevData, [name]: value }));
        // spread operator (...) copies existing fields from prevData, then [name]: value updates the specific field that changed
       //[] is use for tkaing value of the key from the object and update it with new value
        
        // Example:
        // prevData = { name: "", email: "", password: "" }
        // If user types email "abc@gmail.com":
        // result -> { name: "", email: "abc@gmail.com", password: "" }
    };

    // ============================================================
    // Handle form submission (login or register)
    // ============================================================
    const onLogin = async (event) => {
        event.preventDefault(); // prevent page reload

        let newUrl = url; // base backend URL

        // Choose endpoint based on currState
        if (currState === "Login") {
            newUrl += "/api/user/login";
        } else {
            newUrl += "/api/user/register";
        }

        try {
            console.log('Submitting to', newUrl, 'payload', data);

            // Send POST request with form data to backend
            const response = await axios.post(newUrl, data);   //data is used because it is actutal data but setdata is  function to update the ui

            // ============================================================
            // Handle successful response
            // ============================================================
            if (response.data.success) {
                // Save JWT token in global state
                setToken(response.data.token);
                // Persist token in browser storage for page reloads
                localStorage.setItem("token", response.data.token);
                if (loadCartData) {
                    await loadCartData(response.data.token);
                }
                // Close modal after successful login/register
                setShowLogin(false);
            } else {
                // Show backend message if request fails
                alert(response.data.message);
            }

        } catch (err) {
            console.error('Signup/Login error', err);

            // Handle error from backend or network
            if (err.response && err.response.data) {
                const msg = err.response.data.message || JSON.stringify(err.response.data);
                alert(msg);
            } else {
                alert(err.message || 'Request failed');
            }
        }
    };

    // ============================================================
    // JSX Rendering
    // ============================================================
    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                {/* TITLE + CLOSE BUTTON */}
                <div className="login-popup-title">
                    <h2>{currState}</h2> {/* "Login" or "Sign up" */}
                    <img 
                        onClick={() => setShowLogin(false)} 
                        src={assets.cross_icon} 
                        alt="Close" 
                    />
                </div>

                {/* INPUT FIELDS */}
                <div className="login-popup-inputs">
                    {/* Name input: only visible in Sign up mode */}
                    {currState === "Login" ? null : (
                        <input
                            name='name'
                            type="text"
                            placeholder='Your name'
                            value={data.name}
                            onChange={onChangeHandler}
                            required
                        />
                    )}

                    {/* Email input */}
                    <input
                        name='email'
                        type="email"
                        placeholder='Your email'
                        value={data.email}
                        onChange={onChangeHandler}
                        required
                    />

                    {/* Password input */}
                    <input
                        name='password'
                        type="password"
                        placeholder='Password'
                        value={data.password}
                        onChange={onChangeHandler}
                        required
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button type='submit'>
                    {currState === "Sign up" ? "Create account" : "Login"}
                </button>

                {/* TERMS & CONDITIONS */}
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy</p>
                </div>

                {/* TOGGLE LINK: Switch between Login and Sign up */}
                {currState === "Login" ? (
                    <p>
                        Create a new account? 
                        <span onClick={() => setCurrState("Sign up")}> Click here</span>
                    </p>
                ) : (
                    <p>
                        Already have an account? 
                        <span onClick={() => setCurrState("Login")}> Login here</span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;

// import React, { useState } from "react";
//
// function App() {
//
//   // State to store the Name input
//   // name      -> current value
//   // setName() -> function to update the value
//   const [name, setName] = useState("");
//
//   // State to store the Email input
//   // email      -> current value
//   // setEmail() -> function to update the value
//   const [email, setEmail] = useState("");
//
//   // State to store the Password input
//   // password      -> current value
//   // setPassword() -> function to update the value
//   const [password, setPassword] = useState("");
//
//   // This function runs when the form is submitted
//   const handleSubmit = (e) => {
//
//     // Prevent page refresh
//     e.preventDefault();
//
//     // Print all state values in the console
//     console.log("Name:", name);
//     console.log("Email:", email);
//     console.log("Password:", password);
//
//     // Clear all input fields after submit
//     setName("");
//     setEmail("");
//     setPassword("");
//   };
//
//   return (
//     <div>
//
//       <h2>Registration Form</h2>
//
//       {/* Form */}
//       <form onSubmit={handleSubmit}>
//
//         {/* ---------------- Name ---------------- */}
//         <label>Name</label>
//         <br />
//
//         <input
//           type="text"
//
//           // Input value comes from the name state
//           value={name}
//
//           // Whenever the user types,
//           // e.target.value gets the current text
//           // setName() updates the state
//           onChange={(e) => setName(e.target.value)}
//
//           placeholder="Enter Name"
//         />
//
//         <br /><br />
//
//         {/* ---------------- Email ---------------- */}
//         <label>Email</label>
//         <br />
//
//         <input
//           type="email"
//
//           // Input value comes from email state
//           value={email}
//
//           // Update email state whenever user types
//           onChange={(e) => setEmail(e.target.value)}
//
//           placeholder="Enter Email"
//         />
//
//         <br /><br />
//
//         {/* ---------------- Password ---------------- */}
//         <label>Password</label>
//         <br />
//
//         <input
//           type="password"
//
//           // Input value comes from password state
//           value={password}
//
//           // Update password state whenever user types
//           onChange={(e) => setPassword(e.target.value)}
//
//           placeholder="Enter Password"
//         />
//
//         <br /><br />
//
//         {/* Submit Button */}
//         <button type="submit">
//           Submit
//         </button>
//
//       </form>
//
//       <hr />
//
//       {/* Display current state values */}
//       <h3>Current Values</h3>
//
//       <p>
//         <strong>Name:</strong> {name}
//       </p>
//
//       <p>
//         <strong>Email:</strong> {email}
//       </p>
//
//       <p>
//         <strong>Password:</strong> {password}
//       </p>
//
//     </div>
//   );
// }
//
// export default App;

// You prepare data → {name, email}

// Send request → axios.post(newUrl, data)

// Server receives data → reads request body

// Server processes data → validation, DB, logic

// Server sends response → JSON or other format

// Axios receives response → response.data

// You use response → update UI, state, or show message

/* ============================================================
   PROPS & DATA FLOW EXPLAINED
============================================================

1. PROPS:
   - Navbar.jsx passes setShowLogin prop to control modal visibility.

2. CONTEXT:
   - StoreContext provides:
       * url -> backend URL
       * setToken -> function to save JWT token globally

3. STATE:
   - currState -> "Login" / "Sign up"
   - data -> { name, email, password }

4. INPUT HANDLING:
   - onChangeHandler updates data as user types
   - Spread operator (...data) ensures only changed field updates

5. FORM SUBMISSION:
   - onLogin sends POST request via Axios
   - response.data = { success, token, message }
   - token saved in global state + localStorage
   - popup closes on success
   - alert shown on error

6. TOGGLE:
   - User can switch between Login & Sign up via currState
============================================================ */
    // import React and useState hook
// import React, { useState } from "react";

// Signup Form Component
// const SignupForm = () => {

//   ===========================
//   Step 1: Create state for each input
//   ===========================

  // Create state for Name input
  // name: stores the current value typed in Name input field
  // setName: function to update Name state
  // const [name, setName] = useState('');       

  // Create state for Email input
  // email: stores the current value typed in Email input field
  // setEmail: function to update Email state
  // const [email, setEmail] = useState('');     

  // Create state for Password input
  // password: stores the current value typed in Password input field
  // setPassword: function to update Password state
  // const [password, setPassword] = useState(''); 

//   ===========================
//   Step 2: Input Fields (Controlled Inputs)
//   ===========================

//   return (
// const[name,setName]=useState("");
// const[email,setEmail]=useState("");
// const[password,setPassword]=useState("");
//     <form>

      // Name input
      // type="text" → normal text input
      // value={name} → controlled input shows current Name state
      // onChange updates Name state whenever user types
      // <input 
      //   type="text"                    
      //   value={name}                   
      //   onChange={e => setName(e.target.value)} 
      // />

      // Email input
      // type="email" → email input, browser validates format
      // value={email} → controlled input shows current Email state
      // onChange updates Email state whenever user types
      // <input 
      //   type="email"                   
      //   value={email}                  
      //   onChange={e => setEmail(e.target.value)} 
      // />

      // Password input
      // type="password" → hides characters
      // value={password} → controlled input shows current Password state
      // onChange updates Password state whenever user types
      // <input 
      //   type="password"                
      //   value={password}               
      //   onChange={e => setPassword(e.target.value)} 
      // />

      // Submit button
      // <button type="submit">Sign Up</button>  // Button to submit form

//     </form>
//   );
// };

// Export component to use in other files
// export default SignupForm;
