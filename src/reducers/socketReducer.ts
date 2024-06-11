// reducers/socketReducer.ts
import { SocketActionTypes, ADD_MESSAGE } from "../types/socketTypes";

export interface SocketState {
	messages: string[];
}

const initialState: SocketState = {
	messages: [],
};

const socketReducer = (
	state = initialState,
	action: SocketActionTypes
): SocketState => {
	switch (action.type) {
		case ADD_MESSAGE:
			return {
				...state,
				messages: [...state.messages, action.payload],
			};
		default:
			return state;
	}
};

export default socketReducer;
