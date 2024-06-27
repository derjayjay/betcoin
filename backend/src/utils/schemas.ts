import Joi from 'joi';
import { valid } from 'uuid-base58';

const uuidValidator = (value: string, helpers: Joi.CustomHelpers<any>) => {
  if (!valid(value)) {
    return helpers.error('invalid_id');
  }
  return value;
};

const errorMessages = { invalid_id: 'Invalid id provided.' };

export const betSchema = Joi.object({
  direction: Joi.string().valid('up', 'down').required(),
});

export const loginSchema = Joi.object({
  userId: Joi.string().required().custom(uuidValidator).messages(errorMessages),
});

export const idParameterScheme = Joi.object({
  id: Joi.string().required().custom(uuidValidator).messages(errorMessages),
});

export const profileSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(63)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9 _-]*[a-zA-Z0-9]$/)
    .required(),
});
