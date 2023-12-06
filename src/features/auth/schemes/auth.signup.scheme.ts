import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  firstname: Joi.string().optional(),
  lastname: Joi.string().optional(),
  username: Joi.string().required().min(4).max(20).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Username length must be more than or equal to 4 digits',
    'string.max': 'Username length must be lower than or equal to 20 digits',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password length must be more than or equal to 4 digits',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  })
});

export { signupSchema };
