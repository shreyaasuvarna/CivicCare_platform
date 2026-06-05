const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./models/Complaint');
const { calculatePriority } = require('./services/priorityService');

async function fixPriorities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const complaints = await Complaint.find();

    for (let c of complaints) {
      const result = calculatePriority(c);

      c.priorityScore = result.score;
      c.isCritical = result.isCritical;

      await c.save();
    }

    console.log("All priorities updated");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixPriorities();
