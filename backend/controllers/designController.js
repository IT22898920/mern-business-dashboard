import Design from '../models/Design.js';

// Add new design
export const addDesign = async (req, res) => {
  try {
    const { projectName, clientName, status, description, imageURL } = req.body;

    // Owner email comes from authenticated user; fallback to provided contact only if present
    const ownerEmail = (req.user?.profile?.email || req.user?.email || '').toLowerCase();
    if (!ownerEmail) {
      return res.status(400).json({ message: 'Owner email not available' });
    }

    const newDesign = new Design({
      projectName,
      clientName,
      contact: ownerEmail,
      status,
      description,
      imageURL
    });

    await newDesign.save();
    res.status(201).json({ message: 'Design added successfully', design: newDesign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all designs
export const getAllDesigns = async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get designs owned by current authenticated designer
export const getMyDesigns = async (req, res) => {
  try {
    const ownerEmail = (req.user?.profile?.email || req.user?.email || '').toLowerCase();
    if (!ownerEmail) {
      return res.status(400).json({ message: 'Owner email not available' });
    }
    const designs = await Design.find({ contact: ownerEmail }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single design
export const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json(design);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update design
export const updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    const { projectName, clientName, contact, status, description, imageURL } = req.body;

    design.projectName = projectName || design.projectName;
    design.clientName = clientName || design.clientName;
    design.contact = contact || design.contact;
    design.status = status || design.status;
    design.description = description || design.description;
    design.imageURL = imageURL || design.imageURL;

    await design.save();
    res.json({ message: 'Design updated', design });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete design
export const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    await design.deleteOne();
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
