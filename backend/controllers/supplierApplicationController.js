import SupplierApplication from '../models/SupplierApplication.js';
import User from '../models/User.js';

// Submit supplier application
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has an application
    const existingApplication = await SupplierApplication.findOne({ user: userId });
    if (existingApplication) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already submitted a supplier application.'
      });
    }

    // Check if user is already a supplier
    if (req.user.role === 'supplier') {
      return res.status(400).json({
        status: 'error',
        message: 'You are already a supplier.'
      });
    }

    // Filter out empty bank details and references
    const applicationData = { ...req.body, user: userId };
    
    // Remove bank details if they're empty or contain empty strings
    if (applicationData.bankDetails && 
        (!applicationData.bankDetails.bankName || applicationData.bankDetails.bankName.trim() === '' ||
         !applicationData.bankDetails.accountHolder || applicationData.bankDetails.accountHolder.trim() === '' ||
         !applicationData.bankDetails.accountNumber || applicationData.bankDetails.accountNumber.trim() === '')) {
      delete applicationData.bankDetails;
    }
    
    // Remove references if they're empty or contain empty objects
    if (applicationData.references && Array.isArray(applicationData.references)) {
      const filteredReferences = applicationData.references.filter(ref => 
        ref && ref.companyName && ref.contactPerson && ref.phone && ref.email && ref.relationship
      );
      if (filteredReferences.length === 0) {
        delete applicationData.references;
      } else {
        applicationData.references = filteredReferences;
      }
    }

    const application = await SupplierApplication.create(applicationData);

    res.status(201).json({
      status: 'success',
      message: 'Supplier application submitted successfully.',
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to submit application.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Get user's application status
export const getMyApplication = async (req, res) => {
  try {
    const application = await SupplierApplication.findOne({ user: req.user._id });
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'No application found.'
      });
    }

    res.json({
      status: 'success',
      data: application
    });
  } catch (error) {
    console.error('Get my application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch application.'
    });
  }
};

// Get all applications (Admin only)
export const getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build search query
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'businessDetails.description': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const applications = await SupplierApplication
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupplierApplication.countDocuments(filter);

    // Get statistics
    const stats = await SupplierApplication.getStats();

    res.json({
      status: 'success',
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applications.'
    });
  }
};

// Get single application (Admin only)
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await SupplierApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.'
      });
    }

    res.json({
      status: 'success',
      data: application
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch application.'
    });
  }
};

// Update application status (Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;
    const adminId = req.user._id;

    const application = await SupplierApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.'
      });
    }

    // Update application
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    
    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }
    
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // If approved, update user role to supplier
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.user._id, {
        role: 'supplier',
        updatedAt: new Date()
      });

      console.log(`✅ User role updated to supplier: ${application.user.email}`);
    }

    res.json({
      status: 'success',
      message: `Application ${status} successfully.`,
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update application status.'
    });
  }
};

// Delete application (Admin only)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await SupplierApplication.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.'
      });
    }

    res.json({
      status: 'success',
      message: 'Application deleted successfully.'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete application.'
    });
  }
};

// Update my application (User can update pending application only)
export const updateMyApplication = async (req, res) => {
  try {
    const application = await SupplierApplication.findOne({ user: req.user._id });
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'No application found.'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'You can only update pending applications.'
      });
    }

    // Filter out empty bank details and references
    const updateData = { ...req.body };
    
    // Remove bank details if they're empty or contain empty strings
    if (updateData.bankDetails && 
        (!updateData.bankDetails.bankName || updateData.bankDetails.bankName.trim() === '' ||
         !updateData.bankDetails.accountHolder || updateData.bankDetails.accountHolder.trim() === '' ||
         !updateData.bankDetails.accountNumber || updateData.bankDetails.accountNumber.trim() === '')) {
      delete updateData.bankDetails;
    }
    
    // Remove references if they're empty or contain empty objects
    if (updateData.references && Array.isArray(updateData.references)) {
      const filteredReferences = updateData.references.filter(ref => 
        ref && ref.companyName && ref.contactPerson && ref.phone && ref.email && ref.relationship
      );
      if (filteredReferences.length === 0) {
        delete updateData.references;
      } else {
        updateData.references = filteredReferences;
      }
    }

    Object.assign(application, updateData);
    await application.save();

    res.json({
      status: 'success',
      message: 'Application updated successfully.',
      data: application
    });
  } catch (error) {
    console.error('Update my application error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update application.'
    });
  }
};

// Get application statistics (Admin only)
export const getApplicationStats = async (req, res) => {
  try {
    const stats = await SupplierApplication.getStats();
    
    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = await SupplierApplication.countDocuments({
      submittedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      status: 'success',
      data: {
        ...stats,
        recentApplications: {
          count: recentApplications,
          period: 'Last 30 days'
        }
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch application statistics.'
    });
  }
};