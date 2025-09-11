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

// Admin: update employee (name, phone, email active)
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, isActive } = req.body;

  const user = await User.findById(id);
  if (!user || user.role !== 'employee') {
    return res.status(404).json({ status: 'error', message: 'Employee not found' });
  }

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ status: 'error', message: 'Email already in use' });
    }
    user.email = email;
  }
  if (typeof name === 'string') user.name = name;
  if (typeof phone === 'string') user.phone = phone;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  await user.save();
  res.status(200).json({ status: 'success', data: { employee: user.profile } });
});

// Admin: delete employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || user.role !== 'employee') {
    return res.status(404).json({ status: 'error', message: 'Employee not found' });
  }
  await user.deleteOne();
  res.status(200).json({ status: 'success', message: 'Employee deleted' });
});


