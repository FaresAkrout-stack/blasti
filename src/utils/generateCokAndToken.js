import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also return the token in case it needs to be used elsewhere
    return token;
  } catch (error) {
    console.error("Error in generateTokenAndSetCookie:", error);
    throw error; // Re-throw to handle in the calling function
  }
};