import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, role, policeId } = req.body;

  try {
    // Check if the email is already registered
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Additional check for police ID for 'officer' role
    if (role === "officer") {
      const existingPoliceIdUser = await User.findOne({ policeId });
      if (existingPoliceIdUser) {
        return res
          .status(400)
          .json({ message: "Police ID is already registered" });
      }

      if (!policeId) {
        return res
          .status(400)
          .json({ message: "Police ID is required for officers" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // Add policeId if the user is an officer
    if (role === "officer") {
      userData.policeId = policeId;
    }

    // Create the new user in the database
    const newUser = await User.create(userData);

    // Generate token
    const token = generateToken(res, newUser._id, newUser.role);

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        policeId: newUser.policeId || null,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(res, user._id, user.role);

    // Send response
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        policeId: user.policeId || null,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout User
export const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
