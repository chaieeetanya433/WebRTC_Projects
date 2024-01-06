// Socket.io server setup
const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true,
});

// Maps to store email-to-socketID and socketID-to-email mappings
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// Handling socket connections
io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  // Handling user joining a room
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  // Handling initiating a call to another user
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  // Handling acceptance of a call
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  // Handling negotiation needed for peer connection
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  // Handling finalization of peer negotiation
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});