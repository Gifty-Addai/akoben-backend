import Joi from 'joi';

export const updateBookingSchema = Joi.object({
  selectedDateId: Joi.string(),
  participing: Joi.boolean(),
  numberOfPeople: Joi.number().integer().min(1),
  payment: Joi.boolean(),
  authorizationUrl: Joi.string().uri(),
  reference: Joi.string(),
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'reschedule'),
  rescheduleDate: Joi.date(),
}).min(1);
