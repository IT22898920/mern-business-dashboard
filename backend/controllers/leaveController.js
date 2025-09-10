import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Employee: apply for leave
export const applyLeave = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;

  const leave = await Leave.create({
    employee: req.user._id,
    type,
    startDate,
    endDate,
    reason,
  });

  res.status(201).json({
    status: 'success',
    data: { leave },
  });
});

// Admin: list all leaves (with filters)
export const listLeaves = asyncHandler(async (req, res) => {
  const { status, employeeId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (employeeId) filter.employee = employeeId;

  const leaves = await Leave.find(filter)
    .sort({ createdAt: -1 })
    .populate('employee', 'name email role');

  res.status(200).json({ status: 'success', data: { leaves } });
});

// Admin: approve or reject leave
export const reviewLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' | 'reject'
  const leave = await Leave.findById(id);
  if (!leave) {
    return res.status(404).json({ status: 'error', message: 'Leave not found' });
  }

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ status: 'error', message: 'Invalid action' });
  }

  leave.status = action === 'approve' ? 'approved' : 'rejected';
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  res.status(200).json({ status: 'success', data: { leave } });
});

// Employee: list my leaves
export const listMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id })
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { leaves } });
});


