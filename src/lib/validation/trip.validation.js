export function validateSingleTripData(tripData) {
    const errors = [];
  
    if (!tripData.name || tripData.name.trim().length === 0) {
      errors.push({ field: "name", message: "Name is required." });
    }
  
    if (!tripData.description || tripData.description.length < 20) {
      errors.push({ field: "description", message: "Description must be at least 20 characters long." });
    }
  
    if (!tripData.type || !["hiking", "camping", "mountaineering", "other"].includes(tripData.type)) {
      errors.push({ field: "type", message: "Invalid trip type." });
    }
  
    if (!tripData.difficulty || !["easy", "moderate", "hard", "expert"].includes(tripData.difficulty)) {
      errors.push({ field: "difficulty", message: "Invalid difficulty level." });
    }
  
    if (tripData.duration.days < 1) {
      errors.push({ field: "duration.days", message: "Duration must be at least 1 day." });
    }
  
    if (tripData.groupSize.min < 1 || tripData.groupSize.min > tripData.groupSize.max) {
      errors.push({ field: "groupSize", message: "Invalid group size range." });
    }
  
    if (!tripData.location.mainLocation) {
      errors.push({ field: "location.mainLocation", message: "Main location is required." });
    }
  
    if (!tripData.schedule.dates || tripData.schedule.dates.length === 0) {
      errors.push({ field: "schedule.dates", message: "At least one schedule date is required." });
    }
  
    return errors;
  }
  