import mongoose  from 'mongoose';

var dbUrl = 'mongodb://localhost:27017/google-doc-clone';

async function connectDB() {
    try {
      await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
    }
  }
  
  const Connection = connectDB();
export default Connection;