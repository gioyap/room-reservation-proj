// types/socketTypes.ts
export const ADD_MESSAGE = "ADD_MESSAGE";

export interface AddMessageAction {
	type: typeof ADD_MESSAGE;
	payload: string;
}

export type SocketActionTypes = AddMessageAction;
