const express = require('express');
const router = express.Router();
const CustomOrder = require('../models/CustomOrder');
const { Resend } = require('resend');

// Initialize Resend if environment variables are available
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// POST /api/custom-orders - Create a new custom order
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      productType,
      width,
      height,
      depth,
      color,
      requirements,
      budget
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !productType || !requirements) {
      return res.status(400).json({
        message: 'Missing required fields: name, email, phone, address, productType, and requirements are required.'
      });
    }

    // Create new custom order with validated fields
    const orderData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      productType,
      dimensions: {
        width: width || '',
        height: height || '',
        depth: depth || ''
      },
      requirements: requirements.trim(),
      status: 'new'
    };
    
    // Only add optional enum fields if they have valid values
    if (color && ['blue', 'brown', 'maroon', 'pink', 'water-blue', 'grey', 'other'].includes(color)) {
      orderData.color = color;
    }
    
    if (budget && ['under-10000', '10000-20000', '20000-30000', '30000-50000', 'above-50000'].includes(budget)) {
      orderData.budget = budget;
    }
    
    const customOrder = new CustomOrder(orderData);

    // Save to database
    const savedOrder = await customOrder.save();

    // Send email notification if Resend is configured
    if (resend && process.env.RECIPIENT_EMAIL && process.env.FROM_EMAIL) {
      try {
        const dimensionsText = [width, height, depth].filter(Boolean).join(' x ') || 'Not specified';
        
        await resend.emails.send({
          from: process.env.FROM_EMAIL,
          to: [process.env.RECIPIENT_EMAIL],
          subject: `New Custom Order Request #${savedOrder._id.toString().slice(-6)} from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
                New Custom Order Request
              </h1>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #2c5aa0; margin-top: 0;">Order ID: #${savedOrder._id.toString().slice(-6)}</h2>
                <p><strong>Status:</strong> <span style="background-color: #28a745; color: white; padding: 4px 8px; border-radius: 4px;">New</span></p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <h3 style="color: #2c5aa0;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Name:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Email:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${email}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Phone:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Address:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${address}</td>
                </tr>
              </table>

              <h3 style="color: #2c5aa0;">Product Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Product Type:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${productType.charAt(0).toUpperCase() + productType.slice(1)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Dimensions:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${dimensionsText}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Preferred Color:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${color || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Budget Range:</td>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${budget || 'Not specified'}</td>
                </tr>
              </table>

              <h3 style="color: #2c5aa0;">Special Requirements</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #2c5aa0;">
                <p style="margin: 0; white-space: pre-wrap;">${requirements}</p>
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #e7f3ff; border-radius: 8px;">
                <h3 style="color: #2c5aa0; margin-top: 0;">Next Steps</h3>
                <ul>
                  <li>Review the customer requirements carefully</li>
                  <li>Contact the customer within 24 hours</li>
                  <li>Provide a detailed quote if applicable</li>
                  <li>Update the order status in the admin panel</li>
                </ul>
              </div>
            </div>
          `,
          reply_to: email
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      message: 'Custom order request submitted successfully!',
      orderId: savedOrder._id.toString().slice(-6),
      order: {
        id: savedOrder._id,
        status: savedOrder.status,
        createdAt: savedOrder.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating custom order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      message: 'Internal server error. Please try again later.'
    });
  }
});

// GET /api/custom-orders - Get all custom orders (admin only)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get total count
    const total = await CustomOrder.countDocuments(filter);

    // Get orders with pagination
    const orders = await CustomOrder.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({
      message: 'Error fetching custom orders'
    });
  }
});

// GET /api/custom-orders/:id - Get a specific custom order
router.get('/:id', async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        message: 'Custom order not found'
      });
    }

    res.json(order);

  } catch (error) {
    console.error('Error fetching custom order:', error);
    res.status(500).json({
      message: 'Error fetching custom order'
    });
  }
});

// PUT /api/custom-orders/:id - Update a custom order (admin only)
router.put('/:id', async (req, res) => {
  try {
    const {
      status,
      adminNotes,
      quotedPrice
    } = req.body;

    const updateData = {};
    
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (quotedPrice !== undefined) {
      updateData.quotedPrice = quotedPrice;
      if (quotedPrice > 0) {
        updateData.quotedAt = new Date();
      }
    }

    const order = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Custom order not found'
      });
    }

    res.json({
      message: 'Custom order updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating custom order:', error);
    res.status(500).json({
      message: 'Error updating custom order'
    });
  }
});

// DELETE /api/custom-orders/:id - Delete a custom order (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const order = await CustomOrder.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        message: 'Custom order not found'
      });
    }

    res.json({
      message: 'Custom order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting custom order:', error);
    res.status(500).json({
      message: 'Error deleting custom order'
    });
  }
});

module.exports = router;
