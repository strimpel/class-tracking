const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- DATA IN MEMORY --- //
let admins = [
  // Example: { username: 'teacher', passwordHash: '...' }
];
let classes = [
  // Example:
  // {
  //   id, name, code, adminUsername,
  //   students: [{ id, firstName, lastName }],
  //   tasks: [{ id, name, isCurrent, statuses: { [studentId]: 'not_started'|'started'|'finished' } }]
  // }
];

// ----------- Auth ------------- //
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (admins.find(a => a.username === username)) {
    return res.status(409).json({ message: 'Username exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  admins.push({ username, passwordHash });
  res.json({ message: 'Registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = admins.find(a => a.username === username);
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // For demo: no JWT, just status
  res.json({ success: true, username });
});

// ---------- Classes CRUD ----------- //
app.post('/api/class', (req, res) => {
  const { name, code, adminUsername } = req.body;
  const id = uuidv4();
  classes.push({
    id, name, code, adminUsername,
    students: [],
    tasks: [],
  });
  res.json({ id, name, code });
});

app.get('/api/classes', (req, res) => {
  const { adminUsername } = req.query;
  res.json(classes.filter(cls => cls.adminUsername === adminUsername));
});

app.delete('/api/class/:id', (req, res) => {
  const { id } = req.params;
  classes = classes.filter(cls => cls.id !== id);
  res.json({ message: 'Deleted' });
});

// ---------- Students join ---------- //
app.post('/api/join', (req, res) => {
  const { code, firstName, lastName } = req.body;
  const cls = classes.find(c => c.code === code);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  let student = cls.students.find(s => s.firstName === firstName && s.lastName === lastName);
  if (!student) {
    student = { id: uuidv4(), firstName, lastName };
    cls.students.push(student);
  }
  res.json({ classId: cls.id, studentId: student.id, firstName, lastName });
});

// ---------- Socket.io for Real-Time ---------- //
io.on('connection', (socket) => {
  // student or teacher joins class room
  socket.on('join_class', ({ classId }) => {
    socket.join(classId);
  });

  // Teacher adds task
  socket.on('add_task', ({ classId, name }) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const id = uuidv4();
    const task = { id, name, isCurrent: false, statuses: {} };
    cls.tasks.push(task);
    io.to(classId).emit('update_class', cls);
  });

  // Teacher sets current task
  socket.on('set_current_task', ({ classId, taskId }) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    cls.tasks.forEach(t => t.isCurrent = t.id === taskId);
    io.to(classId).emit('update_class', cls);
  });

  // Teacher deletes task
  socket.on('delete_task', ({ classId, taskId }) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    cls.tasks = cls.tasks.filter(t => t.id !== taskId);
    io.to(classId).emit('update_class', cls);
  });

  // Student or Teacher updates status
  socket.on('update_status', ({ classId, taskId, studentId, status }) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const task = cls.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.statuses[studentId] = status;
    io.to(classId).emit('update_class', cls);
  });

  // Student added (already handled in REST, but can join here as well)
  socket.on('disconnect', () => { });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
