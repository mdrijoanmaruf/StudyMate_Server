const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;




const uri = process.env.URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Database
    const db = client.db('studyMate');


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);





// Basic Route
app.get('/', (req, res) => {
  res.send('Hello from Express server with MongoDB Atlas!');
});

// Test route for API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export Express app for Vercel serverless
module.exports = app;