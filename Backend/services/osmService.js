const axios = require('axios');
const SensitiveLocation = require('../models/SensitiveLocation');

class OSMService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    // Default radius for all sensitive location types (in meters)
    this.defaultRadius = {
      hospital: 500,    // 500m around hospitals
      school: 500,      // 500m around schools  
      university: 500,  // 500m around universities
      town: 500,        // 500m around town centers
      city: 500         // 500m around city centers
    };
  }

  /**
   * Build Overpass QL query for Sri Lanka sensitive locations
   */
  buildOverpassQuery() {
    return `
      [out:json][timeout:60];
      (
        // Hospitals in Sri Lanka
        node["amenity"="hospital"](5.916,79.652,9.835,81.881);
        way["amenity"="hospital"](5.916,79.652,9.835,81.881);
        relation["amenity"="hospital"](5.916,79.652,9.835,81.881);
        
        // Schools in Sri Lanka
        node["amenity"="school"](5.916,79.652,9.835,81.881);
        way["amenity"="school"](5.916,79.652,9.835,81.881);
        relation["amenity"="school"](5.916,79.652,9.835,81.881);
        
        // Universities in Sri Lanka
        node["amenity"="university"](5.916,79.652,9.835,81.881);
        way["amenity"="university"](5.916,79.652,9.835,81.881);
        relation["amenity"="university"](5.916,79.652,9.835,81.881);
        
        // Towns and cities in Sri Lanka
        node["place"~"^(town|city)$"](5.916,79.652,9.835,81.881);
        way["place"~"^(town|city)$"](5.916,79.652,9.835,81.881);
        relation["place"~"^(town|city)$"](5.916,79.652,9.835,81.881);
      );
      out center meta;
    `;
  }

  /**
   * Fetch sensitive locations from OpenStreetMap
   */
  async fetchSensitiveLocations() {
    try {
      console.log('🔍 Fetching sensitive locations from OpenStreetMap...');
      
      const query = this.buildOverpassQuery();
      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 60000 // 60 second timeout
      });

      const locations = this.parseOverpassResponse(response.data);
      console.log(`📍 Found ${locations.length} sensitive locations`);
      
      return locations;
    } catch (error) {
      console.error('❌ Error fetching OSM data:', error.message);
      throw error;
    }
  }

  /**
   * Parse Overpass API response
   */
  parseOverpassResponse(data) {
    const locations = [];
    
    if (!data.elements) return locations;

    data.elements.forEach(element => {
      try {
        let lat, lon, name, type;

        // Get coordinates
        if (element.lat && element.lon) {
          lat = element.lat;
          lon = element.lon;
        } else if (element.center) {
          lat = element.center.lat;
          lon = element.center.lon;
        } else {
          return; // Skip if no coordinates
        }

        // Get name
        name = element.tags?.name || 
               element.tags?.['name:en'] || 
               element.tags?.['name:si'] || 
               element.tags?.['name:ta'] || 
               'Unknown Location';

        // Determine type
        if (element.tags?.amenity === 'hospital') {
          type = 'hospital';
        } else if (element.tags?.amenity === 'school') {
          type = 'school';
        } else if (element.tags?.amenity === 'university') {
          type = 'university';
        } else if (element.tags?.place === 'town') {
          type = 'town';
        } else if (element.tags?.place === 'city') {
          type = 'city';
        } else {
          return; // Skip unknown types
        }

        locations.push({
          osmId: element.id.toString(),
          name,
          type,
          latitude: lat,
          longitude: lon,
          radius: this.defaultRadius[type],
          address: this.buildAddress(element.tags)
        });

      } catch (error) {
        console.warn('⚠️ Error parsing element:', error.message);
      }
    });

    return locations;
  }

  /**
   * Build address from OSM tags
   */
  buildAddress(tags) {
    const addressParts = [];
    
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:state']) addressParts.push(tags['addr:state']);
    
    return addressParts.length > 0 ? addressParts.join(', ') : null;
  }

  /**
   * Save locations to database
   */
  async saveSensitiveLocations(locations) {
    try {
      console.log('💾 Saving sensitive locations to database...');
      
      let savedCount = 0;
      let updatedCount = 0;

      for (const location of locations) {
        try {
          const existingLocation = await SensitiveLocation.findOne({ 
            osmId: location.osmId 
          });

          if (existingLocation) {
            // Update existing location
            await SensitiveLocation.updateOne(
              { osmId: location.osmId },
              { 
                ...location, 
                updatedAt: new Date() 
              }
            );
            updatedCount++;
          } else {
            // Create new location
            await SensitiveLocation.create(location);
            savedCount++;
          }
        } catch (error) {
          console.warn(`⚠️ Error saving location ${location.name}:`, error.message);
        }
      }

      console.log(`✅ Saved ${savedCount} new locations, updated ${updatedCount} existing locations`);
      return { savedCount, updatedCount };
      
    } catch (error) {
      console.error('❌ Error saving locations:', error.message);
      throw error;
    }
  }

  /**
   * Update sensitive locations data
   */
  async updateSensitiveLocations() {
    try {
      const locations = await this.fetchSensitiveLocations();
      const result = await this.saveSensitiveLocations(locations);
      
      console.log('🎉 Sensitive locations update completed');
      return result;
    } catch (error) {
      console.error('❌ Failed to update sensitive locations:', error.message);
      throw error;
    }
  }
}

module.exports = new OSMService();