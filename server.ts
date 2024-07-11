// server.ts
import express from "express";
import { createServer } from "http";
import { connect } from "./utils/config/database.js";

const app = express();
const httpServer = createServer(app);
connect();

app.get("/get", (req: any, res: any) => {
	res.send("GET request received!");
});

const PORT = process.env.EXPRESS_PORT || 3001;
httpServer.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
