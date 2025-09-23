import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  } catch (e) {
    logger.error('Error getting user by ID', e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    await getUserById(id);

    // Prepare update data with updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return updatedUser[0];
  } catch (e) {
    logger.error('Error updating user', e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    await db.delete(users).where(eq(users.id, id));

    return { message: 'User deleted successfully', deletedUser: existingUser };
  } catch (e) {
    logger.error('Error deleting user', e);
    throw e;
  }
};
