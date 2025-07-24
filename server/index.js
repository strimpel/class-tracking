const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let students = [];
let currentTask = "משימה חדשה";

app.get('/api/status', (req, res) => {
    res.json({ students, currentTask });
});

app.post('/api/task', (req, res) => {
    currentTask = req.body.taskName || "משימה חדשה";
    students = students.map(s => ({ ...s, status: 'לא התחיל' }));
    res.json({ ok: true, currentTask });
});

app.post('/api/reset-all', (req, res) => {
    students = [];
    res.json({ ok: true });
});

app.post('/api/student', (req, res) => {
    const { name, status } = req.body;
    let student = students.find(s => s.name === name);
    if (!student) {
        student = { name, status: 'לא התחיל' };
        students.push(student);
    }
    student.status = status;
    res.json({ ok: true });
});

app.post('/api/reset', (req, res) => {
    students = students.map(s => ({ ...s, status: 'לא התחיל' }));
    res.json({ ok: true });
});

app.get('/', (req, res) => {
    res.send("Class Status Tracker API!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

//after panel
let tasks = [
  // { id: "123", name: "תרגול 1" }
];
let activeTaskId = null;

// קבלת כל המשימות והמשימה הפעילה
app.get('/api/tasks', (req, res) => {
  res.json({ tasks, activeTaskId });
});

// יצירת משימה חדשה
app.post('/api/tasks', (req, res) => {
  const { name } = req.body;
  const id = Date.now().toString();
  tasks.push({ id, name });
  if (!activeTaskId) activeTaskId = id; // המשימה הראשונה שנוצרת הופכת לפעילה
  res.json({ ok: true, id });
});

// מחיקת משימה
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  if (activeTaskId === id) {
    activeTaskId = tasks.length ? tasks[0].id : null;
  }
  res.json({ ok: true });
});

// קביעת משימה נוכחית
app.post('/api/tasks/select', (req, res) => {
  const { id } = req.body;
  activeTaskId = id;
  res.json({ ok: true });
});

// תעדכן גם את /api/status וכל מקום שצריך שישתמש בשם של המשימה הפעילה מתוך tasks.find(t=>t.id===activeTaskId)

