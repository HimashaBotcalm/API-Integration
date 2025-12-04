const { MongoClient } = require('mongodb');

async function checkUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('user');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`📊 Total users found: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 Users in database:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Avatar: ${user.avatar || 'No avatar'}`);
      });
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUsers();