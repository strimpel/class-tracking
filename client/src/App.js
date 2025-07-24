import React, { useState, useEffect } from 'react';

// שים כאן את כתובת ה-API שלך מ-Render!
const API = "https://class-tracking.onrender.com/api";

function StudentView({ onBack }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("לא התחיל");
  const [task, setTask] = useState("");

  useEffect(() => {
    fetch(API + "/status")
      .then(res => res.json())
      .then(data => setTask(data.currentTask));
  }, []);

  const updateStatus = (newStatus) => {
    if (!name) return;
    fetch(API + "/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: newStatus }),
    }).then(() => setStatus(newStatus));
  };

  return (
    <div style={{ direction: 'rtl', maxWidth: 300, margin: '0 auto' }}>
      <h2>משימה: {task}</h2>
      <input
        placeholder="הכנס שם"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <div>
        <button disabled={!name || status !== 'לא התחיל'} onClick={() => updateStatus("בתהליך")}>
          התחל משימה
        </button>
        <button disabled={status !== 'בתהליך'} onClick={() => updateStatus("סיים")}>
          סיימתי
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <b>הסטטוס שלך: {status}</b>
      </div>
      <button style={{ marginTop: 16 }} onClick={onBack}>מעבר למורה</button>
    </div>
  );
}

function TeacherView({ onBack }) {
  const [students, setStudents] = useState([]);
  const [task, setTask] = useState("");
  const [newTask, setNewTask] = useState("");

  const refresh = () =>
    fetch(API + "/status")
      .then(res => res.json())
      .then(data => {
        setStudents(data.students);
        setTask(data.currentTask);
      });

  useEffect(refresh, []);

  const resetAll = () =>
    fetch(API + "/reset", { method: "POST" }).then(refresh);

  const updateTask = () =>
    fetch(API + "/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName: newTask }),
    }).then(() => {
      setTask(newTask);
      setNewTask("");
      refresh();
    });

  return (
    <div style={{ direction: 'rtl', maxWidth: 400, margin: '0 auto' }}>
      <h2>צפייה למורה</h2>
      <div>
        <b>שם משימה:</b> {task}
        <input
          style={{ marginRight: 8, marginLeft: 8 }}
          value={newTask}
          placeholder="שם חדש למשימה"
          onChange={e => setNewTask(e.target.value)}
        />
        <button onClick={updateTask}>עדכן שם</button>
      </div>
      <table border="1" style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>שם</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={{ marginTop: 12 }} onClick={resetAll}>אפס הכל</button>
      <button style={{ marginRight: 8 }} onClick={onBack}>מעבר לתלמיד</button>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("student"); // או teacher

  return (
    <div style={{ padding: 16 }}>
      <h1>מעקב סטטוס תרגול</h1>
      {mode === "student" ? (
        <StudentView onBack={() => setMode("teacher")} />
      ) : (
        <TeacherView onBack={() => setMode("student")} />
      )}
    </div>
  );
}
