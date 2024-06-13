// websocket-server.ts
import { Server as SocketIOServer } from "socket.io";
import http, { Server as HTTPServer } from "http";

const httpServer: HTTPServer = http.createServer();
const io = new SocketIOServer(httpServer, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	},
});

export const startWebSocketServer = (port: number) => {
	httpServer.listen(port, () => {
		console.log(`WebSocket server is running on port ${port}`);
	});
};

export const getSocketIOInstance = () => io;

export default httpServer;
