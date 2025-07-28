import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const SUPERADMIN_USERNAME = "superadmin";
const SUPERADMIN_PASSWORD = "super123@"; // לשנות לסיסמא שלך

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect(process.env.MONGO_URL); // ללא אפשרויות deprecated

const adminSchema = new mongoose.Schema({
  username: String,
  passwordHash: String
});
const Admin = mongoose.model('Admin', adminSchema);

const studentSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String
}, { _id: false });

const taskSchema = new mongoose.Schema({
  id: String,
  name: String,
  isCurrent: Boolean,
  statuses: mongoose.Schema.Types.Mixed
}, { _id: false });

const classSchema = new mongoose.Schema({
  name: String,
  code: String,
  adminUsername: String,
  students: [studentSchema],
  tasks: [taskSchema]
});
const Class = mongoose.model('Class', classSchema);

// ----------- Auth ------------- //
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (username === SUPERADMIN_USERNAME) {
    return res.status(403).json({ message: "Cannot register as superadmin" });
  }
  if (await Admin.findOne({ username })) {
    return res.status(409).json({ message: 'Username exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ username, passwordHash });
  res.json({ message: 'Registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD) {
    return res.json({ success: true, username, isSuperAdmin: true });
  }
  const admin = await Admin.findOne({ username });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ success: true, username });
});

// ---------- Classes CRUD ----------- //
app.post('/api/class', async (req, res) => {
  const { name, code, adminUsername } = req.body;
  const cls = await Class.create({
    name, code, adminUsername,
    students: [],
    tasks: []
  });
  res.json(cls);
});

// שים לב: סופר אדמין מקבל את כל הכיתות, לא משנה adminUsername
app.get('/api/classes', async (req, res) => {
  const { adminUsername } = req.query;
  if (adminUsername === SUPERADMIN_USERNAME) {
    const classes = await Class.find();
    return res.json(classes);
  }
  const classes = await Class.find({ adminUsername });
  res.json(classes);
});

app.get('/api/class/:id', async (req, res) => {
  const { id } = req.params;
  const cls = await Class.findById(id);
  if (!cls) return res.status(404).json({ message: "Class not found" });
  res.json(cls);
});

// סופר אדמין (וכל מורה) יכול למחוק כל כיתה
app.delete('/api/class/:id', async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ---------- Students join ---------- //
app.post('/api/join', async (req, res) => {
  const { code, firstName, lastName } = req.body;
  const cls = await Class.findOne({ code });
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  let student = cls.students.find(s => s.firstName === firstName && s.lastName === lastName);
  if (!student) {
    student = { id: uuidv4(), firstName, lastName };
    cls.students.push(student);
    await cls.save();
  }
  res.json({ classId: cls._id, studentId: student.id, firstName, lastName });
});

// ---------- Socket.io for Real-Time ---------- //
io.on('connection', (socket) => {
  socket.on('join_class', ({ classId }) => {
    socket.join(classId);
  });

  socket.on('add_task', async ({ classId, name }) => {
    const cls = await Class.findById(classId);
    if (!cls) return;
    const id = uuidv4();
    const task = { id, name, isCurrent: false, statuses: {} };
    cls.tasks.push(task);
    await cls.save();
    io.to(classId).emit('update_class', cls);
  });

  socket.on('set_current_task', async ({ classId, taskId }) => {
    const cls = await Class.findById(classId);
    if (!cls) return;
    cls.tasks.forEach(t => t.isCurrent = t.id === taskId);
    await cls.save();
    io.to(classId).emit('update_class', cls);
  });

  socket.on('delete_task', async ({ classId, taskId }) => {
    const cls = await Class.findById(classId);
    if (!cls) return;
    cls.tasks = cls.tasks.filter(t => t.id !== taskId);
    await cls.save();
    io.to(classId).emit('update_class', cls);
  });

  socket.on('update_status', async ({ classId, taskId, studentId, status }) => {
    const cls = await Class.findById(classId);
    if (!cls) return;
    const task = cls.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.statuses) task.statuses = {};
    task.statuses[studentId] = status;
    await cls.save();
    io.to(classId).emit('update_class', cls);
  });

  socket.on('disconnect', () => {});
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
