import User from "../models/user.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"; 


// Signup new User
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });

        const token = generateToken(newUser._id);
        res.json({success: true,
            userData: newUser,
            message: "User created successfully",
            token,
        });
    } catch (error) {
        res.status(400).json({success: false,
            message: error.message,
        });
        
    }
}

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.json({success: true,
            userData,
            message: "User logged in successfully",
            token,
        });
    } catch (error) {
        res.status(400).json({success: false,
            message: error.message,
        });
    }
}

// aunthenticated User

export const checkAuth = (req, res) => {
    res.json({success: true,
        user: req.user,
    });
};

// update profile pic
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }
        res.json({success: true,
            user: updatedUser,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({success: false,
            message: error.message,
        });
        
    }
}