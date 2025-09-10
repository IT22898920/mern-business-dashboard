import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Admin: list employees
export const listEmployees = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { role: 'employee' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const employees = await User.find(filter)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { employees } });
});

// Admin: create employee (with temporary password)
export const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ status: 'error', message: 'Email already exists' });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password: password || Math.random().toString(36).slice(-10),
    role: 'employee',
  });

  res.status(201).json({ status: 'success', data: { employee: user.profile } });
});


