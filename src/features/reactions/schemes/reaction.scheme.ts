import Joi, { ObjectSchema } from 'joi';

const addPostReactionSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  postReactions: Joi.object().optional().allow(null, '')
});

const addCommentReactionSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  }),
  commentId: Joi.string().required().messages({
    'any.required': 'commentId is a required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  postReactions: Joi.object().optional().allow(null, '')
});

const removeReactionSchema: ObjectSchema = Joi.object().keys({
  postReactions: Joi.object().optional().allow(null, '')
});

export { addPostReactionSchema, addCommentReactionSchema, removeReactionSchema };
