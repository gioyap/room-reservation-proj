import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
	if (isConnected) {
		return;
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
	} catch (error) {
		console.log(error);
		process.exit();
	}
}
