const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const transactionsCollection = db.collection('transactions');
    const classScheduleCollection = db.collection('classSchedule');

    // Budget Tracker API Routes

    // Get all transactions for a user
    app.get('/api/transactions/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const transactions = await transactionsCollection
          .find({ userId })
          .sort({ date: -1 })
          .toArray();
        res.json({
          success: true,
          data: transactions
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching transactions',
          error: error.message
        });
      }
    });

    // Add a new transaction
    app.post('/api/transactions', async (req, res) => {
      try {
        const { userId, type, amount, category, description } = req.body;
        
        if (!userId || !type || !amount || !category || !description) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required'
          });
        }

        const newTransaction = {
          userId,
          type,
          amount: parseFloat(amount),
          category,
          description,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date()
        };

        const result = await transactionsCollection.insertOne(newTransaction);
        res.json({
          success: true,
          message: 'Transaction added successfully',
          data: { ...newTransaction, _id: result.insertedId }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error adding transaction',
          error: error.message
        });
      }
    });

    // Update a transaction
    app.put('/api/transactions/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { type, amount, category, description } = req.body;
        
        const updateData = {
          type,
          amount: parseFloat(amount),
          category,
          description,
          updatedAt: new Date()
        };

        const result = await transactionsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }

        res.json({
          success: true,
          message: 'Transaction updated successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating transaction',
          error: error.message
        });
      }
    });

    // Delete a transaction
    app.delete('/api/transactions/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await transactionsCollection.deleteOne({
          _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }

        res.json({
          success: true,
          message: 'Transaction deleted successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting transaction',
          error: error.message
        });
      }
    });

    // Class Schedule API Routes

    // Get all classes for a user
    app.get('/api/classes/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const classes = await classScheduleCollection
          .find({ userId })
          .sort({ day: 1, time: 1 })
          .toArray();
        res.json({
          success: true,
          data: classes
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching classes',
          error: error.message
        });
      }
    });

    // Add a new class
    app.post('/api/classes', async (req, res) => {
      try {
        const { userId, subject, timeFrom, timeTo, location, day, color } = req.body;
        
        if (!userId || !subject || !timeFrom || !timeTo || !location || !day || !color) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required'
          });
        }

        // Helper function to convert 24-hour time to 12-hour format
        const formatTo12Hour = (time24) => {
          if (!time24) return time24;
          const [hours, minutes] = time24.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };

        const combinedTime = `${timeFrom} - ${timeTo}`;
        const displayTime = `${formatTo12Hour(timeFrom)} - ${formatTo12Hour(timeTo)}`;

        const newClass = {
          userId,
          subject,
          time: combinedTime,
          displayTime: displayTime,
          location,
          day,
          color,
          createdAt: new Date()
        };

        const result = await classScheduleCollection.insertOne(newClass);
        res.json({
          success: true,
          message: 'Class added successfully',
          data: { ...newClass, _id: result.insertedId }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error adding class',
          error: error.message
        });
      }
    });

    // Update a class
    app.put('/api/classes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { subject, timeFrom, timeTo, location, day, color } = req.body;
        
        // Helper function to convert 24-hour time to 12-hour format
        const formatTo12Hour = (time24) => {
          if (!time24) return time24;
          const [hours, minutes] = time24.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };

        const combinedTime = `${timeFrom} - ${timeTo}`;
        const displayTime = `${formatTo12Hour(timeFrom)} - ${formatTo12Hour(timeTo)}`;

        const updateData = {
          subject,
          time: combinedTime,
          displayTime: displayTime,
          location,
          day,
          color,
          updatedAt: new Date()
        };

        const result = await classScheduleCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }

        res.json({
          success: true,
          message: 'Class updated successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating class',
          error: error.message
        });
      }
    });

    // Delete a class
    app.delete('/api/classes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await classScheduleCollection.deleteOne({
          _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }

        res.json({
          success: true,
          message: 'Class deleted successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting class',
          error: error.message
        });
      }
    });

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