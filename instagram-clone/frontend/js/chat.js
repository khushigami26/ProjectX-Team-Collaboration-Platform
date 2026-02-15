const socket = io("http://localhost:5000");

function sendMessage() {
  socket.emit("sendMessage", {
    sender: "user1",
    receiver: "user2",
    message: msg.value,
  });
}

socket.on("receiveMessage", (data) => {
  chat.innerHTML += `<p>${data.message}</p>`;
});
