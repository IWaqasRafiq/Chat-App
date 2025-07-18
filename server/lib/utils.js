import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET); 
};