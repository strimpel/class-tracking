const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// State: רשימת משימות וזיהוי המשימה הנוכחית
let tasks = [];
let activeTaskId = null;

// החזרת כל המשימות וזיהוי המשימה הנוכחית
app.get("/api/tasks", (req, res) => {
  res.json({ tasks, activeTaskId });
});

// החזרת המשימה הנוכחית (לתלמיד)
app.get("/api/status", (req, res) => {
  const task = tasks.find(t => t.id === activeTaskId);
  res.json({
    currentTask: task ? task.name : "",
    students: task ? task.students : []
  });
});

// יצירת משימה חדשה
app.post("/api/tasks", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });
  const id = Date.now().toString();
  tasks.push({ id, name, students: [] });
  if (!activeTaskId) activeTaskId = id;
  res.json({ ok: true, id });
});

// מחיקת משימה
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  if (activeTaskId === id) activeTaskId = tasks[0]?.id || null;
  res.json({ ok: true });
});

// הפיכת משימה לנוכחית
app.post("/api/tasks/select", (req, res) => {
  const { id } = req.body;
  if (!tasks.find(t => t.id === id)) return res.status(404).json({ error: "Task not found" });
  activeTaskId = id;
  res.json({ ok: true });
});

// עדכון סטטוס לתלמיד במשימה הנוכחית
app.post("/api/student", (req, res) => {
  const { name, status } = req.body;
  if (!name || !status || !activeTaskId) return res.status(400).json({ error: "Missing data" });
  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return res.status(404).json({ error: "Active task not found" });
  let student = task.students.find(s => s.name === name);
  if (student) student.status = status;
  else task.students.push({ name, status });
  res.json({ ok: true });
});

// איפוס סטטוס לכל התלמידים במשימה (לפי ID)
app.post("/api/tasks/:id/reset", (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (task) task.students.forEach(s => s.status = "לא התחיל");
  res.json({ ok: true });
});

// איפוס כל התלמידים בכל המשימות
app.post("/api/reset-all", (req, res) => {
  tasks.forEach(t => t.students = []);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log("Server running on port", PORT));
