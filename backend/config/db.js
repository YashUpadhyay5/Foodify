import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected successfully");
    } catch (err) {
        console.warn("MongoDB connection error:", err.message);
        console.warn("Server is running, but database operations require MongoDB. Set a valid MONGO_URI in backend/.env (e.g. MongoDB Atlas or local mongod).");
    }
};






// import mongoose from "mongoose";

// export async function connectDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("DB Connected");
//     } catch (err) {
//         console.log("aaa", process.env.MONGO_URI);
//         console.error("MongoDB connection error:", err);
//         process.exit(1);
//     }
//}
