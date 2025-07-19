import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {io} from "socket.io-client";


const backendUrl = import.meta.env.BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ Children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAUthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAUthUser(data.user);
                connectSOcket(data.user);

            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }

    }

    





    const connectSOcket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        }); 
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (usersIds) => {
            setOnlineUsers(usersIds);
        });
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket
    }

    return (
        <AuthContext.Provider value={value}>
            {Children}
        </AuthContext.Provider>
    )
}
