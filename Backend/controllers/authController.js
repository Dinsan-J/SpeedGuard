const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    role, 
    policeId, 
    vehicleType,
    driverProfile 
  } = req.body;
  
  try {
    // Validation
    if (role === "officer" && !policeId) {
      return res
        .status(400)
        .json({ message: "Police ID is required for officers" });
    }
    
    if (role === "user" && !vehicleType) {
      return res
        .status(400)
        .json({ message: "Vehicle type is required for users" });
    }
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate vehicle type
    const validVehicleTypes = ["motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle"];
    if (role === "user" && !validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({ 
        message: "Invalid vehicle type. Must be one of: motorcycle, light_vehicle, three_wheeler, heavy_vehicle" 
      });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
      policeId,
    };
    
    // Add vehicle type and driver profile for users
    if (role === "user") {
      userData.vehicleType = vehicleType;
      userData.driverProfile = driverProfile || {};
      userData.meritPoints = 100; // Start with 100 merit points
      userData.drivingStatus = 'active';
    }
    
    user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: "User registered successfully",
      vehicleType: role === "user" ? vehicleType : null,
      speedLimit: role === "user" ? user.getSpeedLimit() : null
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    // Find user with populated profile
    const user = await User.findOne({ email, role })
      .populate('driverProfile')
      .populate('officerProfile');
      
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set JWT as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Return user data with profile information
    const responseData = {
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
      },
      token, // Also include token in response for frontend storage
      profile: user.role === 'driver' ? user.driverProfile : user.officerProfile
    };

    res.json(responseData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
