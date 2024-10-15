// types.ts or types.d.ts
export type Reservation = {
	email: string;
	company: string;
	department: string;
	name: string;
	title: string;
	fromDate: string;
	toDate: string;
	description?: string;
	status: string;
	_id: string;
	processedBy: string;
};
