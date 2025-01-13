export function validateSingleTripData(tripData, isPartial = false) {
  const errors = [];

  // Validate 'name'
  if (!isPartial || tripData.name !== undefined) {
    if (!tripData.name || tripData.name.trim().length === 0) {
      errors.push({ field: "name", message: "Name is required." });
    }
  }

  // Validate 'description'
  if (!isPartial || tripData.description !== undefined) {
    if (!tripData.description || tripData.description.length < 20) {
      errors.push({ field: "description", message: "Description must be at least 20 characters long." });
    }
  }

  // Validate 'type'
  if (!isPartial || tripData.type !== undefined) {
    const validTypes = ['hiking', 'camping', 'mountaineering', 'camping & hiking', 'other'];
    if (!tripData.type || !validTypes.includes(tripData.type)) {
      errors.push({ field: "type", message: "Invalid trip type." });
    }
  }

  // Validate 'difficulty'
  if (!isPartial || tripData.difficulty !== undefined) {
    const validDifficulties = ["easy", "moderate", "hard", "expert"];
    if (!tripData.difficulty || !validDifficulties.includes(tripData.difficulty)) {
      errors.push({ field: "difficulty", message: "Invalid difficulty level." });
    }
  }

  // Validate 'duration.days'
  if (!isPartial || tripData.duration?.days !== undefined) {
    if (tripData.duration?.days === undefined || tripData.duration.days < 1) {
      errors.push({ field: "duration.days", message: "Duration must be at least 1 day." });
    }
  }

  // Validate 'groupSize.min' and 'groupSize.max'
  if (!isPartial || tripData.groupSize !== undefined) {
    const min = tripData.groupSize?.min;
    const max = tripData.groupSize?.max;
    if (min === undefined || max === undefined) {
      errors.push({ field: "groupSize", message: "Both minimum and maximum group sizes are required." });
    } else {
      if (min < 1) {
        errors.push({ field: "groupSize.min", message: "Minimum group size must be at least 1." });
      }
      if (max < min) {
        errors.push({ field: "groupSize.max", message: "Maximum group size cannot be less than minimum group size." });
      }
    }
  }

  // Validate 'location.mainLocation'
  if (!isPartial || tripData.location?.mainLocation !== undefined) {
    if (!tripData.location?.mainLocation) {
      errors.push({ field: "location.mainLocation", message: "Main location is required." });
    }
  }


  return errors;
}
