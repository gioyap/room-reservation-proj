// models/Reservation.js

import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
	},
	department: {
		type: String,
		required: [true, "Department is required"],
	},
	name: {
		type: String,
		required: [true, "Name is required"],
	},
	title: {
		type: String,
		required: [true, "Title is required"],
	},
	startDate: {
		type: Date,
		required: [true, "Start date is required"],
	},
	status: {
		type: String,
		default: "Pending",
	},
	description: {
		type: String,
		required: [true, "Description is required"],
	},
});

const Reservation =
	mongoose.models.Reservation ||
	mongoose.model("Reservation", ReservationSchema);

export default Reservation;
