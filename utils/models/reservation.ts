// models/Reservation.js

import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
	},
	company: {
		type: String,
		required: [true, "Company is required"],
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
	fromDate: {
		type: Date,
	},
	toDate: {
		type: Date,
	},
	status: {
		type: String,
		default: "Pending",
	},
	description: {
		type: String,
	},
	processedBy: {
		type: String,
		required: false,
	},
});

ReservationSchema.index({ status: 1 });

const Reservation =
	mongoose.models.Reservation ||
	mongoose.model("Reservation", ReservationSchema);

export default Reservation;
