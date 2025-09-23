import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '../validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const { id } = userIdSchema.parse({ id: req.params.id });

    logger.info(`Getting user with ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in fetchUserById:', e.errors);
      return res.status(400).json({
        message: 'Invalid user ID format',
        errors: e.errors,
      });
    }

    if (e.message === 'User not found') {
      logger.error(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        message: 'User not found',
      });
    }

    logger.error('Error in fetchUserById:', e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const { id } = userIdSchema.parse({ id: req.params.id });

    // Validate the request body
    const validatedData = updateUserSchema.parse(req.body);

    logger.info(`Updating user with ID: ${id}`);

    // Check if user is trying to update their own profile or is admin
    const currentUserId = req.user?.id; // Assuming user info is available in req.user
    const currentUserRole = req.user?.role;

    // If user is not admin and trying to update someone else's profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      logger.warn(
        `User ${currentUserId} attempted to update user ${id} without permission`
      );
      return res.status(403).json({
        message: 'You can only update your own profile',
      });
    }

    // If user is not admin and trying to change role
    if (currentUserRole !== 'admin' && validatedData.role) {
      logger.warn(
        `User ${currentUserId} attempted to change role without admin privileges`
      );
      return res.status(403).json({
        message: 'Only admin users can change user roles',
      });
    }

    const updatedUser = await updateUser(id, validatedData);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in updateUserById:', e.errors);
      return res.status(400).json({
        message: 'Invalid request data',
        errors: e.errors,
      });
    }

    if (e.message === 'User not found') {
      logger.error(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        message: 'User not found',
      });
    }

    logger.error('Error in updateUserById:', e);
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const { id } = userIdSchema.parse({ id: req.params.id });

    logger.info(`Deleting user with ID: ${id}`);

    // Check if user is admin (only admins can delete users)
    const currentUserRole = req.user?.role;

    if (currentUserRole !== 'admin') {
      logger.warn(
        `User ${req.user?.id} attempted to delete user ${id} without admin privileges`
      );
      return res.status(403).json({
        message: 'Only admin users can delete other users',
      });
    }

    // Prevent admin from deleting themselves
    const currentUserId = req.user?.id;
    if (currentUserId === id) {
      logger.warn(`Admin ${currentUserId} attempted to delete themselves`);
      return res.status(400).json({
        message: 'You cannot delete your own account',
      });
    }

    const result = await deleteUser(id);

    res.json({
      message: 'User deleted successfully',
      deletedUser: result.deletedUser,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in deleteUserById:', e.errors);
      return res.status(400).json({
        message: 'Invalid user ID format',
        errors: e.errors,
      });
    }

    if (e.message === 'User not found') {
      logger.error(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        message: 'User not found',
      });
    }

    logger.error('Error in deleteUserById:', e);
    next(e);
  }
};
