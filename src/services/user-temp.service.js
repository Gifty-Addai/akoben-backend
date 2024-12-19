import TempUser from '../models/temp.user.model.js';
import { calculateAge } from "../lib/utils.js";



export const checkTempUser = async (
    fullName,
    phone,
    email,
    dob,
    gender,
    streetAddress,
    address2,
    city,
    zipCode,
    idCard
  ) => {
    let tempUser = await TempUser.findOne({
      name: fullName,
      email: email,
      phone: phone
    });
  
    if (!tempUser) {
      tempUser = new TempUser({
        name: fullName,
        email: email,
        phone: phone,
        streetAddress,
        address2,
        city,
        zipCode,
        age: calculateAge(new Date(dob)),
        gender,
        idCard: idCard || null,
        bookings: [] // Initialize bookings array if not present
      });
  
      await tempUser.save();
    }
  
    return tempUser;
  };
  