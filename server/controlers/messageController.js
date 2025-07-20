import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const unseenMessage = {};
    const promises = filteredUsers.map(async (user) => {
      const message = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (message.length > 0) {
        unseenMessage[user._id] = message.length;
      }
    });
    await Promise.all(promises);
    res
      .status(200)
      .json({
        success: true,
        users: filteredUsers,
        unseenMessages: unseenMessage,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    console.log("✅ getMessage called with:", req.params.id);

    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    // res.json({ success: true, messages: message });
    res.json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const response = await cloudinary.uploader.upload(image);
      imageUrl = response.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
