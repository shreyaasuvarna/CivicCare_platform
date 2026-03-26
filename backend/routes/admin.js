const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const ADMIN_EMAIL = "admin@mcc.gov.in";
  const ADMIN_PASSWORD = "admin123";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      message: "Invalid admin credentials"
    });
  }

  // const token = jwt.sign(
  //   { role: "admin", email: ADMIN_EMAIL },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );
  const token = jwt.sign(
  { id: "admin123", role: "admin", email: ADMIN_EMAIL },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);


  res.json({
    token,
    user: {
  name: "Government Admin",
  email: ADMIN_EMAIL,
  role: "admin"
}

  });

});

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, totalUsers] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ role: 'user' })
    ]);

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentComplaints = await Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      stats: { total, pending, inProgress, resolved, totalUsers, recentComplaints },
      categoryStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints for admin (more details)
// @access  Admin
router.get('/complaints', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20, sort = '-createdAt', search } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    // const complaints = await Complaint.find(query)
    //   .sort(sort)
    //   .skip((page - 1) * limit)
    //   .limit(parseInt(limit))
    //   .populate('filedBy', 'name email');
  //   const complaints = await Complaint.find(query)
  // .sort({ priorityScore: -1, createdAt: -1 }) // 🔥 AI PRIORITY SORT
  // .skip((page - 1) * limit)
  // .limit(parseInt(limit))
  // .populate('filedBy', 'name email');
  const complaints = await Complaint.aggregate([
  { $match: query },

  // 🔥 Assign priority based on status
  {
    $addFields: {
      statusPriority: {
        $switch: {
          branches: [
            { case: { $eq: ["$status", "Pending"] }, then: 1 },
            { case: { $eq: ["$status", "In Progress"] }, then: 2 },
            { case: { $eq: ["$status", "Resolved"] }, then: 3 },
            { case: { $eq: ["$status", "Rejected"] }, then: 4 }
          ],
          default: 5
        }
      }
    }
  },

  // 🔥 Sort logic
  {
    // $sort: {
    //   statusPriority: 1,     // Pending first
    //   priorityScore: -1,     // Then AI priority
    //   createdAt: -1          // Then newest
    // }
    $sort: {
  isCritical: -1,        // 🚨 FORCE CRITICAL FIRST
  statusPriority: 1,     // then Pending > others
  priorityScore: -1,     // then AI score
  createdAt: -1
}

  },

  { $skip: (page - 1) * limit },
  { $limit: parseInt(limit) }
]);

// ✅ Populate user details (important)
await Complaint.populate(complaints, {
  path: 'filedBy',
  select: 'name email'
});



    res.json({ complaints, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PATCH /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updateData = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (status === 'Resolved') updateData.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('filedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ message: `Status updated to "${status}"`, complaint });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   DELETE /api/admin/complaints/:id
// @desc    Delete a complaint
// @access  Admin
router.delete('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    res.json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort('-createdAt');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints for government dashboard
// @access  Admin
// router.get('/complaints', async (req, res) => {
//   try {
//     const complaints = await Complaint.find()
//       .populate('filedBy', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(complaints);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// @route   PUT /api/admin/complaint/:id
// @desc    Update complaint status and action
// @access  Admin
router.put('/complaint/:id', async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status || complaint.status;
    complaint.adminNote = adminNote || complaint.adminNote;

    if (status === "Resolved") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.json({
      message: "Complaint updated successfully",
      complaint
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
