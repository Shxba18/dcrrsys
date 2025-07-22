const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Připojeno k MongoDB');
  } catch (err) {
    console.error('❌ Nepodařilo se připojit k MongoDB:', err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
