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
    const studyPlansCollection = db.collection('studyPlans');
    const studyGoalsCollection = db.collection('studyGoals');

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

    // Study Planner API Routes

    // Get all study tasks for a user
    app.get('/api/study-plans/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const studyPlans = await studyPlansCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .toArray();
        res.json({
          success: true,
          data: studyPlans
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching study plans',
          error: error.message
        });
      }
    });

    // Add a new study task
    app.post('/api/study-plans', async (req, res) => {
      try {
        const { 
          userId, 
          subject, 
          topic, 
          duration, 
          priority, 
          dueDate, 
          difficulty, 
          tags, 
          notes, 
          resources 
        } = req.body;
        
        if (!userId || !subject || !topic || !duration || !dueDate) {
          return res.status(400).json({
            success: false,
            message: 'Required fields: userId, subject, topic, duration, dueDate'
          });
        }

        const newStudyTask = {
          userId,
          subject,
          topic,
          duration: parseInt(duration),
          priority: priority || 'medium',
          dueDate,
          difficulty: difficulty || 'medium',
          tags: tags || [],
          notes: notes || '',
          resources: resources || [],
          completed: false,
          actualTimeSpent: 0,
          sessions: [],
          recurring: null,
          createdAt: new Date()
        };

        const result = await studyPlansCollection.insertOne(newStudyTask);
        res.json({
          success: true,
          message: 'Study task added successfully',
          data: { ...newStudyTask, _id: result.insertedId }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error adding study task',
          error: error.message
        });
      }
    });

    // Update a study task
    app.put('/api/study-plans/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { 
          subject, 
          topic, 
          duration, 
          priority, 
          dueDate, 
          difficulty, 
          tags, 
          notes, 
          resources,
          completed,
          actualTimeSpent,
          sessions
        } = req.body;
        
        const updateData = {
          subject,
          topic,
          duration: parseInt(duration),
          priority,
          dueDate,
          difficulty,
          tags,
          notes,
          resources,
          completed,
          actualTimeSpent,
          sessions,
          updatedAt: new Date()
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const result = await studyPlansCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Study task not found'
          });
        }

        res.json({
          success: true,
          message: 'Study task updated successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating study task',
          error: error.message
        });
      }
    });

    // Delete a study task
    app.delete('/api/study-plans/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await studyPlansCollection.deleteOne({
          _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Study task not found'
          });
        }

        res.json({
          success: true,
          message: 'Study task deleted successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting study task',
          error: error.message
        });
      }
    });

    // Add study session to a task
    app.post('/api/study-plans/:id/sessions', async (req, res) => {
      try {
        const { id } = req.params;
        const { duration, completed } = req.body;
        
        if (!duration) {
          return res.status(400).json({
            success: false,
            message: 'Duration is required'
          });
        }

        const session = {
          date: new Date().toISOString().split('T')[0],
          duration: parseInt(duration),
          completed: completed || false
        };

        const result = await studyPlansCollection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $push: { sessions: session },
            $inc: { actualTimeSpent: parseInt(duration) },
            $set: { updatedAt: new Date() }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Study task not found'
          });
        }

        res.json({
          success: true,
          message: 'Study session added successfully',
          data: session
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error adding study session',
          error: error.message
        });
      }
    });

    // Study Goals API Routes

    // Get study goals for a user
    app.get('/api/study-goals/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        let studyGoals = await studyGoalsCollection.findOne({ userId });
        
        // If no goals exist, create default ones
        if (!studyGoals) {
          studyGoals = {
            userId,
            weekly: { target: 20, current: 0 },
            monthly: { target: 80, current: 0 },
            createdAt: new Date()
          };
          await studyGoalsCollection.insertOne(studyGoals);
        }

        res.json({
          success: true,
          data: studyGoals
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching study goals',
          error: error.message
        });
      }
    });

    // Update study goals
    app.put('/api/study-goals/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { weekly, monthly } = req.body;
        
        const updateData = {
          weekly,
          monthly,
          updatedAt: new Date()
        };

        const result = await studyGoalsCollection.updateOne(
          { userId },
          { $set: updateData },
          { upsert: true }
        );

        res.json({
          success: true,
          message: 'Study goals updated successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating study goals',
          error: error.message
        });
      }
    });

    // Get study analytics for a user
    app.get('/api/study-analytics/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const studyPlans = await studyPlansCollection.find({ userId }).toArray();
        
        const analytics = {
          totalTasks: studyPlans.length,
          completedTasks: studyPlans.filter(task => task.completed).length,
          overdueTasks: studyPlans.filter(task => 
            !task.completed && new Date(task.dueDate) < new Date()
          ).length,
          totalPlannedTime: studyPlans.reduce((total, task) => total + task.duration, 0),
          totalActualTime: studyPlans.reduce((total, task) => total + (task.actualTimeSpent || 0), 0),
          completedStudyTime: studyPlans
            .filter(task => task.completed)
            .reduce((total, task) => total + (task.actualTimeSpent || 0), 0),
          averageSessionLength: (() => {
            const allSessions = studyPlans.flatMap(task => task.sessions || []);
            return allSessions.length > 0 
              ? allSessions.reduce((total, session) => total + session.duration, 0) / allSessions.length 
              : 0;
          })(),
          subjectStats: studyPlans.reduce((stats, task) => {
            if (!stats[task.subject]) {
              stats[task.subject] = { planned: 0, actual: 0, tasks: 0, completed: 0 };
            }
            stats[task.subject].planned += task.duration;
            stats[task.subject].actual += task.actualTimeSpent || 0;
            stats[task.subject].tasks += 1;
            if (task.completed) stats[task.subject].completed += 1;
            return stats;
          }, {})
        };

        // Calculate derived metrics
        analytics.completionRate = analytics.totalTasks > 0 
          ? (analytics.completedTasks / analytics.totalTasks) * 100 
          : 0;
        analytics.efficiency = analytics.totalPlannedTime > 0 
          ? (analytics.totalActualTime / analytics.totalPlannedTime) * 100 
          : 0;

        res.json({
          success: true,
          data: analytics
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching study analytics',
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