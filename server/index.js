const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let tasks = [];
let activeTaskId = null;

// קבלת כל המשימות כולל כל הסטודנטים
app.get("/api/tasks", (req, res) => {
  res.json({ tasks, activeTaskId });
});

// יצירת משימה חדשה
app.post("/api/tasks", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "חסר שם" });
  const id = Date.now().toString();
  tasks.push({ id, name, students: [] });
  // הפוך לאקטיבי אם זו המשימה היחידה או אם אין כרגע משימה אקטיבית
  if (!activeTaskId || tasks.length === 1) activeTaskId = id;
  res.json({ ok: true, id });
});

// מחיקת משימה
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  if (activeTaskId === id) activeTaskId = tasks.length ? tasks[0].id : null;
  res.json({ ok: true });
});

// קביעת משימה כפעילה
app.post("/api/tasks/select", (req, res) => {
  const { id } = req.body;
  if (!id || !tasks.find(t => t.id === id)) return res.status(404).json({ error: "לא נמצא" });
  activeTaskId = id;
  res.json({ ok: true });
});

// עדכון סטטוס תלמיד למשימה הפעילה בלבד
app.post("/api/student", (req, res) => {
  const { name, status } = req.body;
  if (!name || !status || !activeTaskId) return res.status(400).json({ error: "נתונים חסרים" });
  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return res.status(404).json({ error: "משימה לא קיימת" });
  let student = task.students.find(s => s.name === name);
  if (student) student.status = status;
  else task.students.push({ name, status });
  res.json({ ok: true });
});

// קבלת סטטוס תלמידים למשימה הפעילה בלבד (בשביל התלמיד)
app.get("/api/status", (req, res) => {
  const task = tasks.find(t => t.id === activeTaskId);
  res.json({
    currentTask: task ? task.name : "",
    students: task ? task.students : []
  });
});

// איפוס סטטוס לכל התלמידים במשימה הפעילה בלבד
app.post("/api/reset", (req, res) => {
  const task = tasks.find(t => t.id === activeTaskId);
  if (task) task.students.forEach(s => s.status = "לא התחיל");
  res.json({ ok: true });
});

// איפוס הכל - מוחק את כל התלמידים מכל המשימות (למורה)
app.post("/api/reset-all", (req, res) => {
  tasks.forEach(t => t.students = []);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log("Server running on port", PORT));
