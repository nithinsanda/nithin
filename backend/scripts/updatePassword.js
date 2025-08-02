import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function updatePassword() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ email: 'admin@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    // Update the user with hashed password
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password has been updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await client.close();
  }
}

updatePassword();
