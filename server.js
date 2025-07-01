// server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();



// Middleware
app.use(cors({
  origin: 'https://keen-trifle-b51605.netlify.app', // React frontend
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const expenditureRoutes = require('./routes/expenditureRoutes');
app.use('/api/expenditures', expenditureRoutes);

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

const purchaseRoutes = require('./routes/purchase');
app.use('/api/purchases', purchaseRoutes);

const transferRoutes = require('./routes/transfer');
app.use('/api/transfers', transferRoutes);

const baseRoutes = require('./routes/base');
app.use('/api/bases', baseRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const assignmentRoutes = require('./routes/assignment');
app.use('/api/assignments', assignmentRoutes);

const assetRoutes = require('./routes/asset');
app.use('/api/assets', assetRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Military Asset Management API is running');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
