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
