// actions/socketActions.ts
import { ADD_MESSAGE, AddMessageAction } from "../types/socketTypes";

export const addMessage = (message: string): AddMessageAction => ({
	type: ADD_MESSAGE,
	payload: message,
});
