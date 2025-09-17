import InteriorDesigner from '../models/InteriorDesigner.js';
import { validationResult } from 'express-validator';

// @desc    Get all interior designers
// @route   GET /api/interior-designers
// @access  Private (Admin)
const getAllDesigners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const filter = req.query.filter || 'all'; // all, active, inactive, verified
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter functionality
    if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
    } else if (filter === 'verified') {
      query.isVerified = true;
    }
    
    const designers = await InteriorDesigner.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await InteriorDesigner.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        designers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designers'
    });
  }
};

// @desc    Get single interior designer
// @route   GET /api/interior-designers/:id
// @access  Private
const getDesignerById = async (req, res) => {
  try {
    const designer = await InteriorDesigner.findById(req.params.id).select('-password');
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }
    
    res.json({
      success: true,
      data: designer
    });
  } catch (error) {
    console.error('Error fetching designer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designer'
    });
  }
};

// @desc    Create new interior designer
// @route   POST /api/interior-designers
// @access  Private (Admin)
const createDesigner = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      name,
      email,
      password,
      address,
      experience,
      age,
      phone,
      specialization,
      bio,
      hourlyRate,
      languages
    } = req.body;
    
    // Check if designer already exists
    const existingDesigner = await InteriorDesigner.findOne({ email });
    if (existingDesigner) {
      return res.status(400).json({
        success: false,
        message: 'Designer with this email already exists'
      });
    }
    
    const designer = new InteriorDesigner({
      name,
      email,
      password,
      address,
      experience,
      age,
      phone,
      specialization,
      bio,
      hourlyRate,
      languages
    });
    
    await designer.save();
    
    res.status(201).json({
      success: true,
      message: 'Designer created successfully',
      data: designer
    });
  } catch (error) {
    console.error('Error creating designer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating designer'
    });
  }
};

// @desc    Update interior designer
// @route   PUT /api/interior-designers/:id
// @access  Private (Admin)
const updateDesigner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      name,
      email,
      address,
      experience,
      age,
      phone,
      specialization,
      bio,
      hourlyRate,
      languages,
      isActive,
      isVerified
    } = req.body;
    
    const designer = await InteriorDesigner.findById(req.params.id);
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== designer.email) {
      const existingDesigner = await InteriorDesigner.findOne({ email });
      if (existingDesigner) {
        return res.status(400).json({
          success: false,
          message: 'Designer with this email already exists'
        });
      }
      designer.email = email;
    }
    
    // Update fields
    if (name) designer.name = name;
    if (address) designer.address = { ...designer.address, ...address };
    if (experience !== undefined) designer.experience = experience;
    if (age !== undefined) designer.age = age;
    if (phone) designer.phone = phone;
    if (specialization) designer.specialization = specialization;
    if (bio) designer.bio = bio;
    if (hourlyRate !== undefined) designer.hourlyRate = hourlyRate;
    if (languages) designer.languages = languages;
    if (isActive !== undefined) designer.isActive = isActive;
    if (isVerified !== undefined) designer.isVerified = isVerified;
    
    await designer.save();
    
    res.json({
      success: true,
      message: 'Designer updated successfully',
      data: designer
    });
  } catch (error) {
    console.error('Error updating designer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating designer'
    });
  }
};

// @desc    Delete interior designer
// @route   DELETE /api/interior-designers/:id
// @access  Private (Admin)
const deleteDesigner = async (req, res) => {
  try {
    const designer = await InteriorDesigner.findById(req.params.id);
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }
    
    await InteriorDesigner.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Designer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting designer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting designer'
    });
  }
};

// @desc    Toggle designer active status
// @route   PATCH /api/interior-designers/:id/toggle-status
// @access  Private (Admin)
const toggleDesignerStatus = async (req, res) => {
  try {
    const designer = await InteriorDesigner.findById(req.params.id);
    
    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }
    
    designer.isActive = !designer.isActive;
    await designer.save();
    
    res.json({
      success: true,
      message: `Designer ${designer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: designer
    });
  } catch (error) {
    console.error('Error toggling designer status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating designer status'
    });
  }
};

// @desc    Get designer statistics
// @route   GET /api/interior-designers/stats/overview
// @access  Private (Admin)
const getDesignerStats = async (req, res) => {
  try {
    const totalDesigners = await InteriorDesigner.countDocuments();
    const activeDesigners = await InteriorDesigner.countDocuments({ isActive: true });
    const verifiedDesigners = await InteriorDesigner.countDocuments({ isVerified: true });
    const newDesignersThisMonth = await InteriorDesigner.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    // Average experience
    const avgExperienceResult = await InteriorDesigner.aggregate([
      { $group: { _id: null, avgExperience: { $avg: '$experience' } } }
    ]);
    const avgExperience = avgExperienceResult.length > 0 ? Math.round(avgExperienceResult[0].avgExperience) : 0;
    
    res.json({
      success: true,
      data: {
        total: totalDesigners,
        active: activeDesigners,
        verified: verifiedDesigners,
        newThisMonth: newDesignersThisMonth,
        averageExperience: avgExperience
      }
    });
  } catch (error) {
    console.error('Error fetching designer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designer statistics'
    });
  }
};

export {
  getAllDesigners,
  getDesignerById,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  toggleDesignerStatus,
  getDesignerStats
};
