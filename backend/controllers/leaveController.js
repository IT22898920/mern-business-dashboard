import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';

// Employee: create leave request
export const createLeaveRequest = async (req, res) => {
  try {
    const { type, reason, startDate, endDate, days } = req.body;

    // Ensure requester is employee or admin acting on behalf
    const requesterId = req.user._id;

    if (!['employee', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employees can create leave requests' });
    }

    const leave = await LeaveRequest.create({
      employee: requesterId,
      type,
      reason,
      startDate,
      endDate,
      days,
      timeline: [{ action: 'created', user: requesterId, message: 'Leave request submitted' }]
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create leave request' });
  }
};

// Employee: list own leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

// Admin: list all leave requests (optional filter by status/employee)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employee = employeeId;
    const leaves = await LeaveRequest.find(filter)
      .populate('employee', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

// Admin: approve leave
export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Leave request already processed' });

    leave.status = 'approved';
    leave.adminNote = adminNote;
    leave.timeline.push({ action: 'approved', user: req.user._id, message: adminNote });
    await leave.save();
    res.status(200).json({ success: true, data: leave, message: 'Leave approved' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to approve leave' });
  }
};

// Admin: reject leave
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Leave request already processed' });

    leave.status = 'rejected';
    leave.adminNote = adminNote;
    leave.timeline.push({ action: 'rejected', user: req.user._id, message: adminNote });
    await leave.save();
    res.status(200).json({ success: true, data: leave, message: 'Leave rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to reject leave' });
  }
};

// Admin/Employee: get single leave (ensure ownership or admin)
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await LeaveRequest.findById(id).populate('employee', 'name email role');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (req.user.role !== 'admin' && leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this leave request' });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave request' });
  }
};



