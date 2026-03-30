require("dotenv").config();
const mongoose = require("mongoose");
const fc = require("fast-check");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * Property 1: Bug Condition - Unique QR Code Generation for New Vehicles
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * GOAL: Surface counterexamples that demonstrate the bug exists
 * 
 * Expected counterexamples on UNFIXED code:
 * - Duplicate key error on qrCode field after first vehicle is created
 * - Decoded QR codes show vehicleId: "undefined" for all new vehicles
 */

async function setupTestEnvironment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Clean up test data
    await Vehicle.deleteMany({ vehicleNumber: /^TEST-BUG-/ });
    await Driver.deleteMany({ licenseNumber: /^B1234567/ });
    
    // Create a test driver for vehicle ownership
    const testDriver = new Driver({
      licenseNumber: "B1234567",
      fullName: "Test Bug Driver",
      nicNumber: "199012345678",
      phoneNumber: "0771234567",
      email: "testbugdriver@test.com",
      address: "Test Address",
      licenseClass: "B",
      licenseIssueDate: new Date("2015-01-01"),
      licenseExpiryDate: new Date("2030-01-01"),
      meritPoints: 100,
      totalViolations: 0
    });
    await testDriver.save();
    
    return testDriver._id;
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    throw error;
  }
}

async function teardownTestEnvironment() {
  try {
    await Vehicle.deleteMany({ vehicleNumber: /^TEST-BUG-/ });
    await Driver.deleteMany({ licenseNumber: /^B1234567/ });
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Teardown failed:", error.message);
  }
}

/**
 * Test 1: Sequential Vehicle Creation
 * Creates 3 vehicles one after another with different vehicleNumbers
 * EXPECTED ON UNFIXED CODE: Fails after first vehicle with duplicate key error
 */
async function testSequentialVehicleCreation(driverId) {
  console.log("\n📝 Test 1: Sequential Vehicle Creation");
  console.log("=" .repeat(60));
  
  const vehicleNumbers = ["TEST-BUG-001", "TEST-BUG-002", "TEST-BUG-003"];
  const createdVehicles = [];
  const qrCodes = new Set();
  
  try {
    for (let i = 0; i < vehicleNumbers.length; i++) {
      const vehicleNumber = vehicleNumbers[i];
      const vehicle = new Vehicle({
        vehicleNumber,
        vehicleType: "light_vehicle",
        speedLimit: 70, // light_vehicle speed limit
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Blue",
        driverId,
        iotDeviceId: new mongoose.Types.ObjectId() // Use unique ObjectId to avoid iotDeviceId duplicate key error
      });
      
      await vehicle.save();
      createdVehicles.push(vehicle);
      
      console.log(`✅ Created vehicle: ${vehicleNumber}`);
      console.log(`   QR Code: ${vehicle.qrCode.substring(0, 50)}...`);
      
      // Decode QR code to inspect contents
      const decoded = Vehicle.decodeQRCode(vehicle.qrCode);
      console.log(`   Decoded vehicleId: ${decoded.vehicleId}`);
      console.log(`   Decoded vehicleNumber: ${decoded.vehicleNumber}`);
      
      // Check for duplicate QR codes
      if (qrCodes.has(vehicle.qrCode)) {
        throw new Error(`❌ DUPLICATE QR CODE DETECTED for ${vehicleNumber}`);
      }
      qrCodes.add(vehicle.qrCode);
      
      // Check for undefined vehicleId in decoded payload
      if (decoded.vehicleId === "undefined" || decoded.vehicleId === undefined) {
        throw new Error(`❌ QR code contains undefined vehicleId for ${vehicleNumber}`);
      }
    }
    
    console.log(`\n✅ SUCCESS: All ${createdVehicles.length} vehicles created with unique QR codes`);
    console.log(`✅ All QR codes contain valid vehicleId (not "undefined")`);
    return true;
    
  } catch (error) {
    console.log(`\n❌ FAILURE: ${error.message}`);
    console.log(`   Created ${createdVehicles.length} out of ${vehicleNumbers.length} vehicles`);
    
    if (error.code === 11000) {
      console.log(`   Duplicate key error on field: ${Object.keys(error.keyPattern)[0]}`);
      console.log(`   Duplicate value: ${error.keyValue[Object.keys(error.keyPattern)[0]]}`);
    }
    
    throw error;
  } finally {
    // Cleanup
    for (const vehicle of createdVehicles) {
      await Vehicle.deleteOne({ _id: vehicle._id });
    }
  }
}

/**
 * Test 2: Rapid Concurrent Creation
 * Creates 5 vehicles simultaneously using Promise.all
 * EXPECTED ON UNFIXED CODE: Fails with multiple duplicate key errors
 */
async function testRapidConcurrentCreation(driverId) {
  console.log("\n📝 Test 2: Rapid Concurrent Creation");
  console.log("=" .repeat(60));
  
  const vehicleNumbers = [
    "TEST-BUG-CONCURRENT-001",
    "TEST-BUG-CONCURRENT-002",
    "TEST-BUG-CONCURRENT-003",
    "TEST-BUG-CONCURRENT-004",
    "TEST-BUG-CONCURRENT-005"
  ];
  
  try {
    const vehiclePromises = vehicleNumbers.map((vehicleNumber, index) => {
      const vehicle = new Vehicle({
        vehicleNumber,
        vehicleType: "motorcycle",
        speedLimit: 70, // motorcycle speed limit
        make: "Honda",
        model: "CBR",
        year: 2021,
        color: "Red",
        driverId,
        iotDeviceId: new mongoose.Types.ObjectId() // Use unique ObjectId to avoid iotDeviceId duplicate key error
      });
      return vehicle.save();
    });
    
    const results = await Promise.all(vehiclePromises);
    
    // Check for unique QR codes
    const qrCodes = results.map(v => v.qrCode);
    const uniqueQRCodes = new Set(qrCodes);
    
    if (qrCodes.length !== uniqueQRCodes.size) {
      throw new Error(`❌ DUPLICATE QR CODES: ${qrCodes.length} vehicles but only ${uniqueQRCodes.size} unique QR codes`);
    }
    
    // Check for undefined vehicleId in all QR codes
    for (const vehicle of results) {
      const decoded = Vehicle.decodeQRCode(vehicle.qrCode);
      if (decoded.vehicleId === "undefined" || decoded.vehicleId === undefined) {
        throw new Error(`❌ QR code contains undefined vehicleId for ${vehicle.vehicleNumber}`);
      }
    }
    
    console.log(`✅ SUCCESS: All ${results.length} vehicles created concurrently with unique QR codes`);
    console.log(`✅ All QR codes contain valid vehicleId (not "undefined")`);
    
    // Cleanup
    await Vehicle.deleteMany({ vehicleNumber: /^TEST-BUG-CONCURRENT-/ });
    return true;
    
  } catch (error) {
    console.log(`\n❌ FAILURE: ${error.message}`);
    
    if (error.code === 11000) {
      console.log(`   Duplicate key error on field: ${Object.keys(error.keyPattern)[0]}`);
    }
    
    // Cleanup
    await Vehicle.deleteMany({ vehicleNumber: /^TEST-BUG-CONCURRENT-/ });
    throw error;
  }
}

/**
 * Test 3: Property-Based Test - Unique QR Code Generation
 * Uses fast-check to generate random vehicle configurations
 * Tests that each produces a unique QR code without "undefined" vehicleId
 */
async function testPropertyBasedUniqueQRCodes(driverId) {
  console.log("\n📝 Test 3: Property-Based Test - Unique QR Code Generation");
  console.log("=" .repeat(60));
  
  const vehicleTypeArb = fc.constantFrom("motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle");
  const vehicleNumberArb = fc.integer({ min: 1, max: 999 }).map(n => `TEST-PBT-${String(n).padStart(3, '0')}`);
  
  const vehicleArb = fc.record({
    vehicleNumber: vehicleNumberArb,
    vehicleType: vehicleTypeArb,
    make: fc.constantFrom("Toyota", "Honda", "Nissan", "Suzuki"),
    model: fc.constantFrom("Corolla", "Civic", "Altima", "Swift"),
    year: fc.integer({ min: 2015, max: 2024 }),
    color: fc.constantFrom("Red", "Blue", "White", "Black")
  }).map(config => {
    // Add speedLimit based on vehicleType
    const speedLimits = {
      motorcycle: 70,
      light_vehicle: 70,
      three_wheeler: 50,
      heavy_vehicle: 50
    };
    return {
      ...config,
      speedLimit: speedLimits[config.vehicleType]
    };
  });
  
  try {
    await fc.assert(
      fc.asyncProperty(
        fc.array(vehicleArb, { minLength: 2, maxLength: 5 }),
        async (vehicleConfigs) => {
          // Ensure unique vehicle numbers
          const uniqueNumbers = [...new Set(vehicleConfigs.map(v => v.vehicleNumber))];
          if (uniqueNumbers.length !== vehicleConfigs.length) {
            return true; // Skip this test case if duplicate vehicle numbers
          }
          
          const createdVehicles = [];
          
          try {
            // Create all vehicles
            for (const config of vehicleConfigs) {
              const vehicle = new Vehicle({
                ...config,
                driverId,
                iotDeviceId: new mongoose.Types.ObjectId() // Use unique ObjectId to avoid iotDeviceId duplicate key error
              });
              await vehicle.save();
              createdVehicles.push(vehicle);
            }
            
            // Check for unique QR codes
            const qrCodes = createdVehicles.map(v => v.qrCode);
            const uniqueQRCodes = new Set(qrCodes);
            
            if (qrCodes.length !== uniqueQRCodes.size) {
              console.log(`❌ Counterexample found: ${qrCodes.length} vehicles but only ${uniqueQRCodes.size} unique QR codes`);
              return false;
            }
            
            // Check for undefined vehicleId in all QR codes
            for (const vehicle of createdVehicles) {
              const decoded = Vehicle.decodeQRCode(vehicle.qrCode);
              if (decoded.vehicleId === "undefined" || decoded.vehicleId === undefined) {
                console.log(`❌ Counterexample found: QR code contains undefined vehicleId for ${vehicle.vehicleNumber}`);
                return false;
              }
            }
            
            return true;
            
          } finally {
            // Cleanup
            for (const vehicle of createdVehicles) {
              await Vehicle.deleteOne({ _id: vehicle._id }).catch(() => {});
            }
          }
        }
      ),
      { numRuns: 10, verbose: true }
    );
    
    console.log("✅ SUCCESS: Property-based test passed - all generated vehicles have unique QR codes");
    return true;
    
  } catch (error) {
    console.log(`\n❌ FAILURE: Property-based test failed`);
    console.log(`   ${error.message}`);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runBugExplorationTests() {
  console.log("\n🔍 Vehicle QR Code Bug Condition Exploration Test");
  console.log("=" .repeat(60));
  console.log("CRITICAL: This test MUST FAIL on unfixed code");
  console.log("Failure confirms the bug exists");
  console.log("=" .repeat(60));
  
  let driverId;
  let allTestsPassed = true;
  
  try {
    driverId = await setupTestEnvironment();
    
    // Run Test 1: Sequential Creation
    try {
      await testSequentialVehicleCreation(driverId);
    } catch (error) {
      allTestsPassed = false;
      console.log("\n⚠️  Test 1 FAILED (Expected on unfixed code)");
    }
    
    // Run Test 2: Concurrent Creation
    try {
      await testRapidConcurrentCreation(driverId);
    } catch (error) {
      allTestsPassed = false;
      console.log("\n⚠️  Test 2 FAILED (Expected on unfixed code)");
    }
    
    // Run Test 3: Property-Based Test
    try {
      await testPropertyBasedUniqueQRCodes(driverId);
    } catch (error) {
      allTestsPassed = false;
      console.log("\n⚠️  Test 3 FAILED (Expected on unfixed code)");
    }
    
  } finally {
    await teardownTestEnvironment();
  }
  
  console.log("\n" + "=" .repeat(60));
  if (allTestsPassed) {
    console.log("✅ ALL TESTS PASSED");
    console.log("   This means the bug is FIXED or does not exist");
    console.log("=" .repeat(60));
    process.exit(0);
  } else {
    console.log("❌ TESTS FAILED");
    console.log("   This confirms the bug exists (expected on unfixed code)");
    console.log("   Counterexamples documented above");
    console.log("=" .repeat(60));
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runBugExplorationTests();
}

module.exports = runBugExplorationTests;
