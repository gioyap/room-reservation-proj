// reducers/index.ts
import { combineReducers } from "redux";
import socketReducer from "./socketReducer"; // Import your socket reducer here

const rootReducer = combineReducers({
	socket: socketReducer,
	// Add other reducers here if you have more slices of state
});

export default rootReducer;
