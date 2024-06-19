import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;
let db: mongoose.Connection | null = null;

export async function connect() {
	if (isConnected && db) {
		return db;
	}

	try {
		// Check if MONGO_URI environment variable is defined
		if (!process.env.NEXT_PUBLIC_MONGO_URI) {
			throw new Error(
				"NEXT_PUBLIC_MONGO_URI environment variable is not defined"
			);
		}

		// Connect to MongoDB using Mongoose
		await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI, {});

		// Set up event listeners for MongoDB connection
		mongoose.connection.once("connected", () => {
			console.log("MongoDB connected");
			isConnected = true;
		});

		mongoose.connection.on("error", (err) => {
			console.error("MongoDB error:", err);
			process.exit(1); // Exit the process with an error code
		});

		db = mongoose.connection;
		return db;
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1); // Exit the process with an error code
	}
}
