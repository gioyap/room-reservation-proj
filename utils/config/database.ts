import mongoose from "mongoose";

let isConnected = false;
let db: mongoose.Connection | null = null;

export async function connect() {
	if (isConnected && db) {
		return db;
	}

	try {
		await mongoose.connect(process.env.MONGO_URI!, {});

		mongoose.connection.once("connected", () => {
			console.log("MongoDB connected");
			isConnected = true;
		});

		mongoose.connection.on("error", (err) => {
			console.log("MongoDB error: " + err);
			process.exit();
		});

		db = mongoose.connection;
		return db;
	} catch (error) {
		console.log(error);
		process.exit();
	}
}
