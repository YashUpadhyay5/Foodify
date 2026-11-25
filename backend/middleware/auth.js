import jwt from 'jsonwebtoken';

// ================= AUTH MIDDLEWARE =================
// This middleware protects routes that require authentication
// It verifies JWT token sent from frontend and extracts userId
//
// Used in routes like:
//   cartRouter.post("/add", authMiddleware, addToCart)
//   cartRouter.post("/get", authMiddleware, getCart)
//
// If token is valid → request continues
// If token is missing/invalid → request is blocked
const authMiddelware = async (req, res, next) => {

    // ================= TOKEN EXTRACTION =================
    // Token is sent from frontend inside request headers
    // Example:
    // headers: { token: "jwt_token_string" }
    const { token } = req.headers;

    // If token does not exist, user is not authenticated
    if (!token) {
        return res.json({
            success: false,
            message: "Not Authorised. Login Again"
        });
    }

    try {
        // ================= TOKEN VERIFICATION =================
        // Verify token using secret key stored in environment variables
        //we send token from frontend in headers mot user id so here we verify token to take the particular user id
        // jwt.verify() checks:
        // 1. Token signature validity
        // 2. Token expiration
        // 3. Token integrity (not tampered)
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);  // use req.body.userid from backend userid when use middelware

        // ================= ATTACH USER ID =================
        // token_decode contains payload created during login
        // Example payload:
        // { id: userId, iat: 123456789 }
        //
        // Attach userId to request body so controllers can access it
        // IMPORTANT CONCEPT TO REMEMBER:
// req.body is not only for data coming from the frontend.
// It is a shared request object that middleware and controllers can use.
//
// Why userId is added here:
// - Frontend should NEVER send userId (security risk)
// - Backend verifies JWT token
// - Backend decides who the logged-in user is
// - userId is attached to req.body so controllers know
//   which user is making the request
//
// This ensures:
// ✔ Secure user identification
// ✔ No trust on frontend
// ✔ Controllers remain simple and clean
//If user identity comes from frontend → ❌ insecure
//If user identity comes from verified token → ✅ secure




        req.body.userId = token_decode.id;

        // ================= CONTINUE REQUEST =================
        // Call next() to move to the controller
        next();

    } catch (error) {
        console.log(error);

        // Token is invalid or expired
        res.json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};

export default authMiddelware;
// LOGIN
// ↓
// JWT created with { id: user._id }
// ↓
// Frontend stores token
// ↓
// Frontend sends token in headers
// ↓
// authMiddleware verifies token
// ↓
// token_decode.id extracted
// ↓
// req.body.userId = token_decode.id
// ↓
// Controller uses req.body.userId
// ↓
// Correct user's data is accessed
