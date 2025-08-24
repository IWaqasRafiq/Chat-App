import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

// --- Toast Manager ---
let activeToasts = [];

const limitedToast = (message, type = "success") => {
    // If more than 2 already showing, remove the oldest
    if (activeToasts.length >= 2) {
        const oldest = activeToasts.shift();
        toast.dismiss(oldest);
    }

    const id = toast[type](message, { duration: 3000 });
    activeToasts.push(id);
};

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/message/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            limitedToast(error.message, "error");
            console.log(error);
        }
    }

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/message/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            limitedToast(error.message, "error");
            console.log(error);
        }
    }

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/message/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessage) => [...prevMessage, data.newMessage]);
            }
        } catch (error) {
            limitedToast(error.message, "error");
            console.log(error);
        }
    }

    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("message", (newMessage) => {
            if (messages.some(msg => msg._id === newMessage._id)) return;

            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId]
                        ? prev[newMessage.senderId] + 1
                        : 1
                }));
            }
        });
    };


    const unsubscribeFromMessages = () => {
        if (socket) socket.off("message");
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        getMessages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        sendMessage,
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}
