import React, { useState, useEffect } from 'react';

// שים כאן את כתובת ה-API שלך מ-Render!
const API = "https://class-tracking.onrender.com/api";
const TEACHER_PASSWORD = "Barak-Fast-Track"; // שנה כאן לסיסמה שתרצה

function StudentView({ onGoToTeacher }) {
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
    <div style={{ direction: 'rtl', maxWidth: 300, margin: '0 auto', background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px #0001", padding: 24, marginTop: 40 }}>
      <h2>משימה: {task}</h2>
      <input
        placeholder="הכנס שם"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid #bbb", fontSize: 16 }}
      />
      <div>
        <button
          disabled={!name || status !== 'לא התחיל'}
          onClick={() => updateStatus("בתהליך")}
          style={{ padding: "8px 12px", margin: "4px", background: "#4169e1", color: "#fff", border: "none", borderRadius: 8, fontSize: 15 }}
        >
          התחל משימה
        </button>
        <button
          disabled={status !== 'בתהליך'}
          onClick={() => updateStatus("סיים")}
          style={{ padding: "8px 12px", margin: "4px", background: "#6cbb3c", color: "#fff", border: "none", borderRadius: 8, fontSize: 15 }}
        >
          סיימתי
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <b>הסטטוס שלך: {status}</b>
      </div>
      <button
        style={{ marginTop: 16, background: "none", border: "none", color: "#222", textDecoration: "underline", cursor: "pointer" }}
        onClick={onGoToTeacher}
      >
        מעבר למורה
      </button>
    </div>
  );
}

function TeacherView({ onLogout }) {
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
    <div style={{ direction: 'rtl', maxWidth: 420, margin: '0 auto', background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px #0001", padding: 24, marginTop: 40 }}>
      <h2>מסך למורה</h2>
      <div>
        <b>שם משימה:</b> {task}
        <input
          style={{ marginRight: 8, marginLeft: 8, padding: 6, borderRadius: 6, border: "1px solid #bbb" }}
          value={newTask}
          placeholder="שם חדש למשימה"
          onChange={e => setNewTask(e.target.value)}
        />
        <button onClick={updateTask} style={{ padding: "7px 14px", background: "#4169e1", color: "#fff", border: "none", borderRadius: 8, fontSize: 14 }}>
          עדכן שם
        </button>
      </div>
      <table border="1" style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f4f6fa" }}>
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
      <button style={{ marginTop: 12, padding: "8px 14px", background: "#ff5757", color: "#fff", border: "none", borderRadius: 8, fontSize: 15 }} onClick={resetAll}>אפס הכל</button>
      <button style={{ marginTop: 12, marginRight: 8, background: "none", border: "none", color: "#222", textDecoration: "underline", cursor: "pointer" }} onClick={onLogout}>יציאה</button>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("student"); // או teacher
  const [teacherUnlocked, setTeacherUnlocked] = useState(false);
  const [pw, setPw] = useState("");

  const goToTeacher = () => {
    setPw("");
    setMode("teacher");
    setTeacherUnlocked(false);
  };

  // מסך ראשי: בוחר האם תלמיד, או מסך כניסת מורה
  return (
    <div style={{
      padding: 16,
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f4fafe,#e2e6fa 90%)",
      fontFamily: "Rubik, Arial, sans-serif"
    }}>
      <h1 style={{ textAlign: 'center', color: "#222", letterSpacing: "1px", marginTop: 18, fontWeight: 500 }}>מעקב סטטוס תרגול</h1>
      {mode === "student" ? (
        <StudentView onGoToTeacher={goToTeacher} />
      ) : !teacherUnlocked ? (
        <div style={{ maxWidth: 320, margin: "50px auto", background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px #0001", padding: 32, textAlign: 'center' }}>
          <h2>כניסת מורה</h2>
          <input
            type="password"
            placeholder="סיסמה"
            value={pw}
            onChange={e => setPw(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 16, borderRadius: 8, border: "1px solid #aaa" }}
            onKeyDown={e => { if (e.key === "Enter") if (pw === TEACHER_PASSWORD) setTeacherUnlocked(true); }}
          />
          <button
            onClick={() => { if (pw === TEACHER_PASSWORD) setTeacherUnlocked(true); }}
            style={{ width: "100%", padding: 10, fontSize: 16, background: "#4169e1", color: "#fff", border: "none", borderRadius: 8 }}
          >
            כניסה
          </button>
          <div style={{ color: "red", height: 24, marginTop: 8 }}>
            {pw && pw !== TEACHER_PASSWORD ? "סיסמה שגויה" : ""}
          </div>
          <button style={{ marginTop: 12, background: "none", border: "none", color: "#555", textDecoration: "underline" }} onClick={() => setMode("student")}>חזור לתלמיד</button>
        </div>
      ) : (
        <TeacherView onLogout={() => { setMode("student"); setTeacherUnlocked(false); }} />
      )}
    </div>
  );
}
