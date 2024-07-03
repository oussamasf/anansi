const { io } = require("socket.io-client");

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZGUzYjBhMzRhMmMxNzlkZTZlMTQ4YiIsInJvbGVzIjpbImFjdGl2ZUNsaWVudCIsImFkbWluIiwiYWxleGFuZHJpZVdyaXRlciIsImRlcGFydG1lbnRNYW5hZ2VyIl0sImlhdCI6MTcwNDgxMTMxNH0.DmNicve2CTBzA27KcDHczYoHSILQTx4L1ZMr3Qz9Uio";

const socket = io("http://localhost:4000/client", {
  transports: ["websocket"],
  extraHeaders: {
    authorization: JWT,
  },
});

// Log when connected
socket.on("connect", () => {
  console.log("Successfully connected to the server");
});

// Log when disconnected
socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

// Log connection errors
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

// Log received notifications
socket.on("notification", (message) => {
  console.log(`Message from user1 ${JSON.stringify(message)}`);
});

// Emit a notification
socket.emit("notification", " some8");
