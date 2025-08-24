import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {io} from "socket.io-client";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
console.log("Axios Base URL:", backendUrl);


export const AuthContext = createContext();

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

export const AuthProvider = ({ children }) => {

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
            limitedToast(error.message, "error");
            console.log(error);
        }

    }

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);

            if (data.success) {
                setAUthUser(data.userData);
                connectSOcket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                limitedToast(data.message, "success");
            } else {
                limitedToast("user not found", "error");
            }
        } catch (error) {
            limitedToast("user not found", "error");
            console.log(error);
        }
    }    

    const logout = () => {
        setAUthUser(null);
        setToken(null);
        setOnlineUsers([]);
        localStorage.removeItem("token");
        axios.defaults.headers.common["token"] = null;
        socket?.disconnect();
        limitedToast("Logged out successfully", "success");
    }


    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAUthUser(data.user);
                limitedToast("Profile updated successfully");
            }
        } catch (error) {
            limitedToast(error.message, "error");
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
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
