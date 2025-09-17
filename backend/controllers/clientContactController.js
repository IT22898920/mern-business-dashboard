import ClientContact from '../models/ClientContact.js';
import Design from '../models/Design.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/email.js';

// Create new client contact
export const createClientContact = async (req, res) => {
  try {
    const { designId, clientName, clientEmail, clientPhone, message } = req.body;

    // Get design details to get designer email
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({
        status: 'error',
        message: 'Design not found'
      });
    }

    const clientContact = new ClientContact({
      designId,
      designerEmail: design.contact,
      clientName,
      clientEmail,
      clientPhone,
      message,
      projectName: design.projectName
    });

    await clientContact.save();

    // Create notification for the designer
    const notification = new Notification({
      recipientEmail: design.contact,
      senderName: clientName,
      senderEmail: clientEmail,
      type: 'client_contact',
      title: `New inquiry for ${design.projectName}`,
      message: `${clientName} has sent you an inquiry about your design project "${design.projectName}".`,
      relatedDesignId: designId,
      relatedClientContactId: clientContact._id,
      priority: 'high',
      metadata: {
        clientPhone: clientPhone,
        projectName: design.projectName
      }
    });

    await notification.save();

    // Send real email to designer using .env email configuration
    try {
      const subject = `New inquiry for ${design.projectName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2>New Client Inquiry</h2>
          <p>You have received a new inquiry for your design project <strong>${design.projectName}</strong>.</p>
          <h3>Client Details</h3>
          <ul>
            <li><strong>Name:</strong> ${clientName}</li>
            <li><strong>Email:</strong> ${clientEmail}</li>
            <li><strong>Phone:</strong> ${clientPhone || 'N/A'}</li>
          </ul>
          <h3>Message</h3>
          <p>${(message || '').replace(/\n/g, '<br/>')}</p>
        </div>
      `;
      await sendEmail(design.contact, subject, html);
    } catch (emailErr) {
      console.warn('Email send failed (designer contact):', emailErr.message);
      // Do not fail the request if email fails; notification already saved
    }

    res.status(201).json({
      status: 'success',
      message: 'Client contact created successfully',
      data: clientContact
    });
  } catch (error) {
    console.error('Error creating client contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get client contacts for a designer
export const getClientContacts = async (req, res) => {
  try {
    const { designerEmail } = req.params;
    
    const clientContacts = await ClientContact.find({ designerEmail })
      .populate('designId', 'projectName imageURL')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: clientContacts
    });
  } catch (error) {
    console.error('Error fetching client contacts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Update client contact status
export const updateClientContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const clientContact = await ClientContact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!clientContact) {
      return res.status(404).json({
        status: 'error',
        message: 'Client contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Client contact status updated successfully',
      data: clientContact
    });
  } catch (error) {
    console.error('Error updating client contact status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get client contact by ID
export const getClientContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clientContact = await ClientContact.findById(id)
      .populate('designId', 'projectName imageURL description');

    if (!clientContact) {
      return res.status(404).json({
        status: 'error',
        message: 'Client contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: clientContact
    });
  } catch (error) {
    console.error('Error fetching client contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Delete client contact
export const deleteClientContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clientContact = await ClientContact.findByIdAndDelete(id);

    if (!clientContact) {
      return res.status(404).json({
        status: 'error',
        message: 'Client contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Client contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};
