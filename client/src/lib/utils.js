export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
