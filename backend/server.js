/**
 * Virtual Classroom Platform - Backend Server
 * Using AEB Technology for Educational Management
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-classroom', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ==================== Models ====================

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number, default: 50 },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  recordingUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    submittedAt: Date,
    grade: Number,
    feedback: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Session = mongoose.model('Session', sessionSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);

// ==================== Authentication Middleware ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ==================== API Routes ====================

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Classroom Routes
app.get('/api/classrooms', authenticateToken, async (req, res) => {
  try {
    const classrooms = await Classroom.find().populate('instructorId').populate('students');
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classrooms', authenticateToken, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;
    const classroom = new Classroom({
      name,
      description,
      capacity,
      instructorId: req.user.id
    });
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/classrooms/:id', authenticateToken, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('instructorId')
      .populate('students');
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/classrooms/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { name, description, capacity, updatedAt: Date.now() },
      { new: true }
    );
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/classrooms/:id', authenticateToken, async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: 'Classroom deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Session Routes
app.post('/api/sessions/start', authenticateToken, async (req, res) => {
  try {
    const { classroomId } = req.body;
    const session = new Session({
      classroomId,
      startTime: new Date(),
      status: 'active',
      participants: [req.user.id]
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/sessions/:id/join', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (!session.participants.includes(req.user.id)) {
      session.participants.push(req.user.id);
      await session.save();
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions/:id/end', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { endTime: new Date(), status: 'completed' },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assignment Routes
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const { title, description, classroomId, dueDate } = req.body;
    const assignment = new Assignment({
      title,
      description,
      classroomId,
      dueDate,
      createdBy: req.user.id
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('createdBy').populate('submissions');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignments/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    assignment.submissions.push({
      studentId: req.user.id,
      content,
      submittedAt: new Date()
    });
    
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WebSocket Events ====================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join classroom
  socket.on('join_classroom', (data) => {
    socket.join(`classroom-${data.classroomId}`);
    io.to(`classroom-${data.classroomId}`).emit('user_joined', {
      userId: data.userId,
      userName: data.userName
    });
  });

  // Send message
  socket.on('send_message', (data) => {
    io.to(`classroom-${data.classroomId}`).emit('receive_message', {
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date()
    });
  });

  // Screen share
  socket.on('screen_share_start', (data) => {
    io.to(`classroom-${data.classroomId}`).emit('screen_share_started', {
      userId: data.userId
    });
  });

  socket.on('screen_share_end', (data) => {
    io.to(`classroom-${data.classroomId}`).emit('screen_share_ended', {
      userId: data.userId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== Server Start ====================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Virtual Classroom Server running on port ${PORT}`);
});