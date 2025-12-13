const express = require('express');
const router = express.Router();
const SensitiveLocation = require('../models/SensitiveLocation');
const osmService = require('../services/osmService');
const geofencingService = require('../services/geofencingService');

/**
 * GET /api/sensitive-locations
 * Get all sensitive locations with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { type, limit = 100, page = 1 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    
    const locations = await SensitiveLocation.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ name: 1 });

    const total = await SensitiveLocation.countDocuments(filter);

    res.json({
      success: true,
      data: locations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching sensitive locations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensitive locations',
      error: error.message
    });
  }
});

/**
 * GET /api/sensitive-locations/stats
 * Get statistics about sensitive locations
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await geofencingService.getSensitiveLocationStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching location stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics',
      error: error.message
    });
  }
});

/**
 * POST /api/sensitive-locations/update-from-osm
 * Fetch and update sensitive locations from OpenStreetMap
 */
router.post('/update-from-osm', async (req, res) => {
  try {
    console.log('🔄 Starting OSM data update...');
    
    const result = await osmService.updateSensitiveLocations();
    
    res.json({
      success: true,
      message: 'Sensitive locations updated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error updating from OSM:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update sensitive locations from OSM',
      error: error.message
    });
  }
});

/**
 * POST /api/sensitive-locations/analyze-location
 * Analyze a specific location for geofencing
 */
router.post('/analyze-location', async (req, res) => {
  try {
    const { latitude, longitude, speed, speedLimit } = req.body;

    if (!latitude || !longitude || !speed) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and speed are required'
      });
    }

    const analysis = await geofencingService.calculateViolationFine(
      speed, latitude, longitude, speedLimit || null // Let service auto-detect if not provided
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Error analyzing location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze location',
      error: error.message
    });
  }
});

/**
 * GET /api/sensitive-locations/nearby
 * Find sensitive locations near a given point
 */
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const searchRadius = parseInt(radius);

    // Find all locations and calculate distances
    const allLocations = await SensitiveLocation.find({});
    const nearbyLocations = [];

    for (const location of allLocations) {
      const distance = geofencingService.calculateDistance(
        lat, lng, location.latitude, location.longitude
      );

      if (distance <= searchRadius) {
        nearbyLocations.push({
          ...location.toObject(),
          distanceFromPoint: Math.round(distance)
        });
      }
    }

    // Sort by distance
    nearbyLocations.sort((a, b) => a.distanceFromPoint - b.distanceFromPoint);

    res.json({
      success: true,
      data: nearbyLocations,
      searchParams: {
        latitude: lat,
        longitude: lng,
        radius: searchRadius
      }
    });
  } catch (error) {
    console.error('❌ Error finding nearby locations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby locations',
      error: error.message
    });
  }
});

/**
 * PUT /api/sensitive-locations/:id
 * Update a specific sensitive location
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const location = await SensitiveLocation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Sensitive location not found'
      });
    }

    res.json({
      success: true,
      data: location,
      message: 'Sensitive location updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating sensitive location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update sensitive location',
      error: error.message
    });
  }
});

/**
 * DELETE /api/sensitive-locations/:id
 * Delete a specific sensitive location
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const location = await SensitiveLocation.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Sensitive location not found'
      });
    }

    res.json({
      success: true,
      message: 'Sensitive location deleted successfully',
      data: location
    });
  } catch (error) {
    console.error('❌ Error deleting sensitive location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sensitive location',
      error: error.message
    });
  }
});

module.exports = router;