const User = require('../models/User');
const Slot = require('../models/Slot');

// Seed admin user
const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Passw0rd!',
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Seed patient user
const seedPatientUser = async () => {
  try {
    const patientExists = await User.findOne({ email: 'patient@example.com' });
    
    if (!patientExists) {
      const patientUser = new User({
        name: 'Test Patient',
        email: 'patient@example.com',
        password: 'Passw0rd!',
        role: 'patient'
      });
      
      await patientUser.save();
      console.log('Patient user seeded successfully');
    } else {
      console.log('Patient user already exists');
    }
  } catch (error) {
    console.error('Error seeding patient user:', error);
  }
};

// Generate initial slots
const generateInitialSlots = async () => {
  try {
    const slots = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Generate slots for next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }
      
      // Generate 30-minute slots from 9:00 AM to 5:00 PM
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startAt = new Date(currentDate);
          startAt.setHours(hour, minute, 0, 0);
          
          const endAt = new Date(startAt);
          endAt.setMinutes(endAt.getMinutes() + 30);
          
          // Only create slots that are in the future
          if (startAt > now) {
            slots.push({
              startAt,
              endAt,
              isBooked: false
            });
          }
        }
      }
    }
    
    if (slots.length > 0) {
      await Slot.insertMany(slots, { ordered: false });
      console.log(`${slots.length} initial slots generated`);
    }
  } catch (error) {
    console.error('Error generating initial slots:', error);
  }
};

// Initialize all seed data
const initializeSeedData = async () => {
  console.log('Initializing seed data...');
  await seedAdminUser();
  await seedPatientUser();
  await generateInitialSlots();
  console.log('Seed data initialization complete');
};

module.exports = {
  seedAdminUser,
  seedPatientUser,
  generateInitialSlots,
  initializeSeedData
};
