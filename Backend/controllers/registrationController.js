const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DriverProfile = require('../models/DriverProfile');
const OfficerProfile = require('../models/OfficerProfile');

/**
 * Register a new user (Driver or Officer)
 */
exports.register = async (req, res) => {
  try {
    const { 
      // Common fields
      username, 
      email, 
      password, 
      phoneNumber, 
      role,
      
      // Driver-specific fields
      fullName,
      nicNumber,
      drivingLicenseNumber,
      licenseClass,
      licenseIssueDate,
      licenseExpiryDate,
      address,
      emergencyContact,
      
      // Officer-specific fields
      policeIdNumber,
      policeStation,
      division,
      rank,
      department
    } = req.body;

    // Validate required common fields
    if (!username || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, email, password, phoneNumber, role'
      });
    }

    // Validate role
    if (!['driver', 'officer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "driver" or "officer"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create base user
    const userData = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      role
    };

    const user = new User(userData);
    await user.save();

    let profileData = null;

    if (role === 'driver') {
      // Validate driver-specific required fields
      if (!fullName || !nicNumber || !drivingLicenseNumber || !licenseClass || 
          !licenseIssueDate || !licenseExpiryDate) {
        await User.findByIdAndDelete(user._id); // Cleanup
        return res.status(400).json({
          success: false,
          message: 'Missing required driver fields: fullName, nicNumber, drivingLicenseNumber, licenseClass, licenseIssueDate, licenseExpiryDate'
        });
      }

      // Check for duplicate NIC and license
      const existingDriver = await DriverProfile.findOne({
        $or: [
          { nicNumber },
          { drivingLicenseNumber: drivingLicenseNumber.toUpperCase() }
        ]
      });

      if (existingDriver) {
        await User.findByIdAndDelete(user._id); // Cleanup
        return res.status(400).json({
          success: false,
          message: 'Driver with this NIC or driving license number already exists'
        });
      }

      // Create driver profile
      const driverProfile = new DriverProfile({
        userId: user._id,
        fullName,
        nicNumber,
        phoneNumber,
        drivingLicenseNumber: drivingLicenseNumber.toUpperCase(),
        licenseClass,
        licenseIssueDate: new Date(licenseIssueDate),
        licenseExpiryDate: new Date(licenseExpiryDate),
        address: address || {},
        emergencyContact: emergencyContact || {}
      });

      await driverProfile.save();

      // Link profile to user
      user.driverProfile = driverProfile._id;
      await user.save();

      profileData = driverProfile;

    } else if (role === 'officer') {
      // Validate officer-specific required fields
      if (!fullName || !policeIdNumber || !policeStation || !division) {
        await User.findByIdAndDelete(user._id); // Cleanup
        return res.status(400).json({
          success: false,
          message: 'Missing required officer fields: fullName, policeIdNumber, policeStation, division'
        });
      }

      // Check for duplicate police ID
      const existingOfficer = await OfficerProfile.findOne({ 
        policeIdNumber: policeIdNumber.toUpperCase() 
      });

      if (existingOfficer) {
        await User.findByIdAndDelete(user._id); // Cleanup
        return res.status(400).json({
          success: false,
          message: 'Officer with this police ID already exists'
        });
      }

      // Create officer profile
      const officerProfile = new OfficerProfile({
        userId: user._id,
        fullName,
        phoneNumber,
        policeIdNumber: policeIdNumber.toUpperCase(),
        policeStation,
        division,
        rank: rank || null,
        department: department || 'Traffic Police'
      });

      await officerProfile.save();

      // Link profile to user
      user.officerProfile = officerProfile._id;
      await user.save();

      profileData = officerProfile;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        profileId: profileData._id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Prepare response data
    const responseData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt
      },
      profile: profileData,
      token
    };

    console.log(`✅ User registered successfully: ${user.username} (${user.role})`);
    if (role === 'driver') {
      console.log(`   Driver: ${fullName} - License: ${drivingLicenseNumber}`);
    } else {
      console.log(`   Officer: ${fullName} - Police ID: ${policeIdNumber} - Station: ${policeStation}`);
    }

    res.status(201).json({
      success: true,
      message: `${role === 'driver' ? 'Driver' : 'Officer'} registered successfully`,
      data: responseData
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Enhanced error handling
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists in the system`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get registration requirements based on role
 */
exports.getRegistrationRequirements = async (req, res) => {
  try {
    const { role } = req.query;

    const requirements = {
      common: {
        fields: ['username', 'email', 'password', 'phoneNumber', 'role'],
        validation: {
          username: 'Minimum 3 characters, maximum 30 characters',
          email: 'Valid email address',
          password: 'Minimum 6 characters',
          phoneNumber: 'Valid Sri Lankan phone number format',
          role: 'Must be either "driver" or "officer"'
        }
      }
    };

    if (!role || role === 'driver') {
      requirements.driver = {
        required: [
          'fullName', 'nicNumber', 'drivingLicenseNumber', 
          'licenseClass', 'licenseIssueDate', 'licenseExpiryDate'
        ],
        optional: [
          'address', 'emergencyContact'
        ],
        validation: {
          nicNumber: 'Valid Sri Lankan NIC (9 digits + V/X or 12 digits)',
          drivingLicenseNumber: 'Valid driving license number',
          phoneNumber: 'Valid Sri Lankan phone number'
        }
      };
    }

    if (!role || role === 'officer') {
      requirements.officer = {
        required: [
          'fullName', 'policeIdNumber', 'policeStation', 'division'
        ],
        optional: ['rank', 'department'],
        ranks: [
          'Police Constable', 'Police Sergeant', 'Police Inspector', 
          'Sub Inspector', 'Assistant Superintendent', 
          'Deputy Inspector General', 'Inspector General'
        ],
        departments: [
          'Traffic Police', 'General Police', 'Special Task Force', 'Criminal Investigation'
        ],
        validation: {
          policeIdNumber: 'Valid police ID number',
          phoneNumber: 'Valid Sri Lankan phone number'
        }
      };
    }

    res.json({
      success: true,
      data: requirements
    });

  } catch (error) {
    console.error('Error getting registration requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get registration requirements'
    });
  }
};

/**
 * Validate registration data before submission
 */
exports.validateRegistrationData = async (req, res) => {
  try {
    const { email, username, nicNumber, drivingLicenseNumber, policeIdNumber } = req.body;

    const validation = {
      email: { available: true },
      username: { available: true },
      nicNumber: { available: true },
      drivingLicenseNumber: { available: true },
      policeIdNumber: { available: true }
    };

    // Check email
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      validation.email.available = !existingEmail;
    }

    // Check username
    if (username) {
      const existingUsername = await User.findOne({ username });
      validation.username.available = !existingUsername;
    }

    // Check NIC
    if (nicNumber) {
      const existingNIC = await DriverProfile.findOne({ nicNumber });
      validation.nicNumber.available = !existingNIC;
    }

    // Check driving license
    if (drivingLicenseNumber) {
      const existingLicense = await DriverProfile.findOne({ 
        drivingLicenseNumber: drivingLicenseNumber.toUpperCase() 
      });
      validation.drivingLicenseNumber.available = !existingLicense;
    }

    // Check police ID
    if (policeIdNumber) {
      const existingPoliceId = await OfficerProfile.findOne({ 
        policeIdNumber: policeIdNumber.toUpperCase() 
      });
      validation.policeIdNumber.available = !existingPoliceId;
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed'
    });
  }
};