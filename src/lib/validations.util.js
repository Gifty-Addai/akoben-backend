export const validateBookingData = (data) => {
    const errors = [];
  
    if (!data.user) errors.push("User ID is required.");
    if (!data.trip) errors.push("Trip ID is required.");
    if (!data.campingDate) errors.push("Camping date is required.");
    if (!data.numberOfPeople || data.numberOfPeople <= 0) errors.push("Number of people must be greater than zero.");
    if (!data.totalCost || data.totalCost < 0) errors.push("Total cost must be a valid number.");
  
    return errors;
  };
  
  export const validateTripData = (data) => {
    const errors = [];
  
    if (!data.name) errors.push("Trip name is required.");
    if (!data.description) errors.push("Trip description is required.");
    
    if (!data.type || !['hiking', 'camping', 'mountaineering', 'other'].includes(data.type)) {
      errors.push("Trip type must be one of the following: hiking, camping, mountaineering, other.");
    }
  
    if (!data.difficulty || !['easy', 'moderate', 'hard', 'expert'].includes(data.difficulty)) {
      errors.push("Trip difficulty must be one of the following: easy, moderate, hard, expert.");
    }
    
    if (!data.duration || typeof data.duration !== 'object' || !data.duration.days || !data.duration.nights) {
      errors.push("Trip duration with valid days and nights is required.");
    }
    
    if (!data.groupSize || typeof data.groupSize !== 'object' || !data.groupSize.min || !data.groupSize.max) {
      errors.push("Group size with valid minimum and maximum numbers is required.");
    }
    
    if (!data.location || !data.location.mainLocation) {
      errors.push("Main location is required.");
    }
  
    if (!data.cost || typeof data.cost !== 'object' || !data.cost.basePrice) {
      errors.push("Base price for the trip is required.");
    }
    
    if (!data.schedule || !Array.isArray(data.schedule.dates) || data.schedule.dates.length === 0) {
      errors.push("Trip schedule with at least one start and end date is required.");
    } else {
      data.schedule.dates.forEach((date, index) => {
        if (!date.startDate) {
          errors.push(`Start date is required for schedule at index ${index}.`);
        }
        if (!date.endDate) {
          errors.push(`End date is required for schedule at index ${index}.`);
        }
        if (date.startDate && date.endDate && new Date(date.startDate) >= new Date(date.endDate)) {
          errors.push(`End date must be after start date for schedule at index ${index}.`);
        }
        if (!('slotsRemaining' in date) || date.slotsRemaining < 0) {
          errors.push(`Slots remaining must be a non-negative number for schedule at index ${index}.`);
        }
      });
    }
  
    return errors;
  };
  