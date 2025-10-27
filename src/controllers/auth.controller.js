import logger from "#config/logger.js";
import { createUser, authenticateUser } from "#services/auth.service.js";
import { jwttoken } from "#utils/jwt.js";
import { signUpSchema, signInSchema } from "#validations/auth.validation.js"
import { formatValidationErrors } from "#utils/format.js";
import { cookies } from "#utils/cookies.js";

export const signUp = async (req,res, next) => {
  try {
    const validationResults = signUpSchema.safeParse(req.body);

    if (!validationResults.success) {
      return res.status(400).json({ error: "Validation failed", details: formatValidationErrors(validationResults.error) });
    }

    const { name, email, password, role } = validationResults.data;

    const user = await createUser(name, email, password, role);

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({ 
      message: 'User registered',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    logger.error('Failed to sign up', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: 'Email already exists'})
    }

    next(error);
  }
}

export const signIn = async (req, res, next) => {
  try {
    const validationResults = signInSchema.safeParse(req.body);

    if (!validationResults.success) {
      return res.status(400).json({ error: "Validation failed", details: formatValidationErrors(validationResults.error) });
    }

    const { email, password } = validationResults.data;

    const user = await authenticateUser(email, password);

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({ 
      message: 'User logged in',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    logger.error('Failed to sign in', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' })
    }

    if (error.message === 'Invalid password') {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    next(error);
  }
}

export const signOut = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User logged out successfully');

    res.status(200).json({ 
      message: 'User logged out'
    });

  } catch (error) {
    logger.error('Failed to sign out', error);

    next(error);
  }
}