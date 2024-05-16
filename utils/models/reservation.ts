// models/Reservation.js

import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Title is required"],
	},
	startDate: {
		type: Date,
		required: [true, "Start date is required"],
	},
	duration: {
		hours: {
			type: Number,
			required: [true, "Duration hours are required"],
		},
		minutes: {
			type: Number,
			default: 0,
		},
	},
});

const Reservation =
	mongoose.models.Reservation ||
	mongoose.model("Reservation", ReservationSchema);

export default Reservation;
