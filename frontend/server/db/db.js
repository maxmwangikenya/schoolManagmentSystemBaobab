import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URL || 'mongodb://localhost:27017/baobab_kindergarten';
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit the process if database connection fails
  }
};

export default connectToDatabase;