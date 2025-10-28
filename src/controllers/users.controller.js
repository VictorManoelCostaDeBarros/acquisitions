import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { formatValidationErrors } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');

    const users = await getAllUsers();

    return res.status(200).json({
      message: 'Users fetched successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    logger.error(`Error fetching all users: ${error}`);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    logger.info(`Fetching user by ID: ${req.params.id}`);

    // Validate the ID parameter
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    const user = await getUserById(idValidation.data.id);

    return res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    logger.info(`Updating user by ID: ${req.params.id}`);

    // Validate the ID parameter
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    // Validate the request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    // Check authentication
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = idValidation.data.id;
    const updates = bodyValidation.data;

    // Authorization checks
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only update your own profile.',
      });
    }

    // Only admins can change roles
    if (updates.role && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only admins can change user roles.' });
    }

    const updatedUser = await updateUser(userId, updates);

    logger.info(`User updated successfully: ${updatedUser.email}`);

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    logger.info(`Deleting user by ID: ${req.params.id}`);

    // Validate the ID parameter
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    // Check authentication
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = idValidation.data.id;

    // Authorization checks
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own account.',
      });
    }

    const result = await deleteUser(userId);

    logger.info(`User deleted successfully: ID ${userId}`);

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    next(error);
  }
};
