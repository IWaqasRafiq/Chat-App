import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.error("MongoDB connection error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

mongoose.connection.on("connected", function () {
  console.log("Mongoose is connected");
});
// mongoose.connection.on("disconnected", function () {
//   console.log("Mongoose is disconnected");
//   process.exit(1);
// });
// mongoose.connection.on("error", function (err) {
//   console.log("Mongoose connection error: ", err);
//   process.exit(1);
// });
// process.on("SIGINT", function () {
//   console.log("app is terminating");
//   mongoose.connection.close(function () {
//     console.log("Mongoose default connection closed");
//     process.exit(0);
//   });
// });
