import React, { useState, useEffect } from "react";

// עדכן כאן את כתובת ה־API שלך אם צריך
const API = "/api";
const TEACHER_PASSWORD = "555555";

function InfoMsg({ children, color = "#32b06c" }) {
  return (
    <div style={{
      background: color + "22",
      color: color,
      border: "1.5px solid " + color,
      borderRadius: 8,
      padding: "8px 10px",
      margin: "15px 0",
      textAlign: "center",
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: "0.7px"
    }}>{children}</div>
  );
}

function Loader() {
  return <div style={{ textAlign: "center", color: "#4169e1", margin: 22 }}>טוען...</div>
}

function StudentView({ onGoToTeacher, studentName, setStudentName, taskName }) {
  const [status, setStatus] = useState("לא התחיל");
  const [inputValue, setInputValue] = useState(studentName || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(API + "/status")
      .then(res => res.json())
      .then(data => {
        if (data.currentTask === "") setStatus("לא התחיל");
      });
  }, [taskName]);

  const updateStatus = (newStatus) => {
    if (!studentName) return;
    setLoading(true);
    fetch(API + "/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: studentName, status: newStatus }),
    })
      .then(() => {
        setStatus(newStatus);
        setMsg("עודכן בהצלחה!");
        setTimeout(() => setMsg(""), 1200);
      })
      .catch(() => setMsg("שגיאה בשמירת סטטוס!"))
      .finally(() => setLoading(false));
  };

  const handleSubmitName = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || inputValue.trim().split(" ").length < 2) {
      setMsg("נא להזין שם פרטי ושם משפחה");
      return;
    }
    setStudentName(inputValue.trim());
    localStorage.setItem("studentName", inputValue.trim());
    setMsg("");
  };

  const handleLogout = () => {
    setStudentName("");
    localStorage.removeItem("studentName");
    setInputValue("");
    setStatus("לא התחיל");
    setMsg("");
  };

  return (
    <div style={{ direction: 'rtl', maxWidth: 340, margin: '0 auto', background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px #0002", padding: 24, marginTop: 40 }}>
      <h2 style={{ color: "#4169e1", fontWeight: 500 }}>משימה: {taskName || "אין משימה נוכחית"}</h2>
      {!studentName ? (
        <form onSubmit={handleSubmitName} style={{ marginBottom: 16 }}>
          <input
            placeholder="שם פרטי ושם משפחה"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setMsg(""); }}
            style={{ width: '100%', marginBottom: 8, padding: 9, borderRadius: 8, border: "1.5px solid #bbb", fontSize: 16, background: "#f8faff" }}
            autoFocus
          />
          <button
            type="submit"
            style={{ padding: "8px 12px", background: "#4169e1", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, width: "100%" }}
            disabled={loading}
          >
            אשר שם
          </button>
          {msg && <InfoMsg color="#e25d3c">{msg}</InfoMsg>}
        </form>
      ) : (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          <span role="img" aria-label="wave">👋</span> שלום, {studentName}!
        </div>
      )}

      <div>
        <button
          disabled={!studentName || status !== 'לא התחיל' || loading}
          onClick={() => updateStatus("בתהליך")}
          style={{ padding: "8px 12px", margin: "4px", background: "#4169e1", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, opacity: loading ? 0.5 : 1 }}
        >
          התחל משימה
        </button>
        <button
          disabled={status !== 'בתהליך' || loading}
          onClick={() => updateStatus("סיים")}
          style={{ padding: "8px 12px", margin: "4px", background: "#6cbb3c", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, opacity: loading ? 0.5 : 1 }}
        >
          סיימתי
        </button>
      </div>
      <div style={{ marginTop: 12, fontWeight: 500, fontSize: 16 }}>
        {loading ? <Loader /> : <>הסטטוס שלך: <span style={{ color: status === "סיים" ? "#32b06c" : "#333" }}>{status}</span></>}
      </div>
      {studentName && (
        <button
          style={{ marginTop: 14, background: "none", border: "none", color: "#888", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}
          onClick={handleLogout}
        >
          התנתק/י
        </button>
      )}
      <button
        style={{ marginTop: 16, background: "none", border: "none", color: "#222", textDecoration: "underline", cursor: "pointer" }}
        onClick={onGoToTeacher}
      >
        מעבר למורה
      </button>
    </div>
  );
}

function TaskPanel({ tasks, activeTaskId, selectedTaskId, onCreate, onDelete, onSelect, onActive, loading }) {
  const [newTaskName, setNewTaskName] = useState("");
  return (
    <div style={{ flex: 1, minWidth: 200, background: "#f7faff", borderRadius: 14, boxShadow: "0 2px 12px #0001", padding: 18, height: "fit-content" }}>
      <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 6 }}>משימות בכיתה</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tasks.map(t =>
          <li key={t.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            margin: "6px 0", background: t.id === selectedTaskId ? "#eaf3ff" : "transparent",
            borderRadius: 7, padding: "4px 7px"
          }}>
            <span style={{ fontWeight: t.id === activeTaskId ? 700 : 400 }}>
              {t.name}
              {t.id === activeTaskId && <span style={{ color: "#4169e1", marginRight: 6 }}>⭐</span>}
            </span>
            <span>
              {t.id !== activeTaskId && (
                <button onClick={() => onActive(t.id)} style={{ fontSize: 13, marginLeft: 7, border: "none", color: "#4169e1", background: "none", cursor: "pointer" }}>הפוך לנוכחית</button>
              )}
              <button onClick={() => onSelect(t.id)} style={{ fontSize: 13, border: "none", color: "#789", background: "none", cursor: "pointer", marginLeft: 7 }}>👁️</button>
              <button onClick={() => onDelete(t.id)} style={{ fontSize: 13, border: "none", color: "#d32f2f", background: "none", cursor: "pointer" }}>🗑️</button>
            </span>
          </li>
        )}
      </ul>
      <div style={{ marginTop: 14 }}>
        <input
          style={{ width: "80%", padding: 6, borderRadius: 7, border: "1px solid #bbb" }}
          placeholder="שם משימה חדשה"
          value={newTaskName}
          onChange={e => setNewTaskName(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={() => { if (newTaskName.trim()) { onCreate(newTaskName); setNewTaskName(""); } }}
          style={{ marginRight: 5, padding: "7px 12px", background: "#4169e1", color: "#fff", border: "none", borderRadius: 8 }}
          disabled={loading}
        >
          צור משימה חדשה
        </button>
      </div>
    </div>
  );
}

function TeacherView({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // מביא את כל המשימות מהשרת (עם טבלאות הסטודנטים)
  const fetchTasks = () =>
    fetch(API + "/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks);
        setActiveTaskId(data.activeTaskId);
        // ברירת מחדל: נבחרת המשימה הפעילה
        if (!selectedTaskId && data.activeTaskId)
          setSelectedTaskId(data.activeTaskId);
      });

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // יצירת משימה חדשה
  const createTask = (name) => {
    if (!name.trim()) return;
    setLoading(true);
    fetch(API + "/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then(() => {
  setMsg("משימה נוצרה");
  fetchTasks();
  setTimeout(() => setMsg(""), 1500);
})
      .finally(() => setLoading(false));
  };

  // מחיקת משימה
  const deleteTask = id => {
    if (!window.confirm("למחוק את המשימה?")) return;
    setLoading(true);
    fetch(API + `/tasks/${id}`, { method: "DELETE" })
      .then(() => {
        setMsg("משימה נמחקה");
        setTimeout(() => setMsg(""), 1500);
        fetchTasks();
        if (selectedTaskId === id) setSelectedTaskId(null);
      })
      .finally(() => setLoading(false));
  };

  // הפוך לנוכחית
  const makeActiveTask = id => {
    setLoading(true);
    fetch(API + "/tasks/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(() => {
        setMsg("משימה נבחרה כפעילה");
        setActiveTaskId(id);
        setTimeout(() => setMsg(""), 1200);
        fetchTasks();
      })
      .finally(() => setLoading(false));
  };

  // בחר לצפות בטבלת המשימה (לא בהכרח הפעילה)
  const viewTask = id => setSelectedTaskId(id);

  // איפוס סטטוס רק למשימה שנצפית כרגע
  const resetAllStatus = () => {
    if (!selectedTaskId) return;
    setLoading(true);
    // לאפס סטטוס אפשר רק דרך הפעלה של המשימה כנוכחית (הכי פשוט לוגית)
    fetch(API + "/tasks/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedTaskId }),
    }).then(() =>
      fetch(API + "/reset", { method: "POST" })
    ).then(() => {
      setMsg("הסטטוסים אופסו");
      fetchTasks();
      setTimeout(() => setMsg(""), 1800);
    })
      .catch(() => setMsg("שגיאה!"))
      .finally(() => setLoading(false));
  };

  // איפוס כללי – מוחק תלמידים מכל המשימות
  const resetEverything = () => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את כל התלמידים מכל המשימות?")) return;
    setLoading(true);
    fetch(API + "/reset-all", { method: "POST" })
      .then(() => {
        setMsg("כל התלמידים נמחקו!");
        fetchTasks();
        setTimeout(() => setMsg(""), 1800);
      })
      .catch(() => setMsg("שגיאה!"))
      .finally(() => setLoading(false));
  };

  // איזו משימה מוצגת עכשיו?
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div style={{ direction: 'rtl', display: "flex", gap: 12, maxWidth: 1000, margin: '0 auto', marginTop: 30 }}>
      <div style={{ flex: 2 }}>
        <h2 style={{ color: "#4169e1", fontWeight: 500 }}>
          {selectedTask ? `משימה: ${selectedTask.name}` : "בחר משימה מהפאנל"}
          {selectedTask && selectedTask.id === activeTaskId && <span style={{ color: "#4169e1" }}> ⭐ (משימה נוכחית לתלמידים)</span>}
        </h2>
        <div style={{ margin: "10px 0 5px 0", fontSize: 17, fontWeight: 400 }}>
          <span style={{ color: "#888" }}>סה״כ תלמידים:</span> <b style={{ color: "#4169e1" }}>{selectedTask?.students.length || 0}</b>
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto", marginTop: 10 }}>
          <table border="0" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f6fa" }}>
                <th style={{ padding: 8, borderBottom: "1.5px solid #eaeaea" }}>שם</th>
                <th style={{ padding: 8, borderBottom: "1.5px solid #eaeaea" }}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {!selectedTask || selectedTask.students.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: "center", color: "#aaa", padding: 20 }}>אין תלמידים רשומים</td></tr>
              ) : selectedTask.students.map(s => (
                <tr key={s.name}>
                  <td style={{ padding: 7, borderBottom: "1.5px solid #f5f5f5" }}>{s.name}</td>
                  <td style={{
                    padding: 7,
                    borderBottom: "1.5px solid #f5f5f5",
                    color: s.status === "סיים" ? "#32b06c" : s.status === "בתהליך" ? "#e2991e" : "#333",
                    fontWeight: s.status === "סיים" ? 600 : 400
                  }}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button
            style={{ flex: 1, padding: "10px 10px", background: "#ffb347", color: "#333", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, transition: "background 0.2s" }}
            onClick={resetAllStatus}
            disabled={loading || !selectedTaskId}
          >
            אפס סטטוס למשימה
          </button>
          <button
            style={{ flex: 1, padding: "10px 10px", background: "#ff5757", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, transition: "background 0.2s" }}
            onClick={resetEverything}
            disabled={loading}
          >
            איפוס הכל (כל המשימות)
          </button>
        </div>
        <button style={{ marginTop: 18, marginRight: 8, background: "none", border: "none", color: "#4169e1", textDecoration: "underline", cursor: "pointer", fontWeight: 500, fontSize: 15 }} onClick={onLogout}>התנתקות</button>
        {loading && <Loader />}
        {msg && <InfoMsg>{msg}</InfoMsg>}
        {err && <InfoMsg color="#e25d3c">{err}</InfoMsg>}
      </div>
      <TaskPanel
        tasks={tasks}
        activeTaskId={activeTaskId}
        selectedTaskId={selectedTaskId}
        onCreate={createTask}
        onDelete={deleteTask}
        onSelect={viewTask}
        onActive={makeActiveTask}
        loading={loading}
      />
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("student");
  const [teacherUnlocked, setTeacherUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [studentName, setStudentName] = useState(localStorage.getItem("studentName") || "");
  const [taskName, setTaskName] = useState("");

  // מביא רק את המשימה הנוכחית בשביל התלמיד
  const fetchActiveTask = () =>
    fetch(API + "/tasks")
      .then(res => res.json())
      .then(data => {
        const curr = data.tasks.find(t => t.id === data.activeTaskId);
        setTaskName(curr ? curr.name : "");
      });

  useEffect(() => {
    const isTeacher = localStorage.getItem("isTeacher");
    if (isTeacher === "true") {
      setMode("teacher");
      setTeacherUnlocked(true);
    }
    fetchActiveTask();
    const interval = setInterval(fetchActiveTask, 2500); // גם התלמיד מתעדכן LIVE
    return () => clearInterval(interval);
  }, []);

  const unlockTeacher = () => {
    setTeacherUnlocked(true);
    localStorage.setItem("isTeacher", "true");
  };

  const logoutTeacher = () => {
    setMode("student");
    setTeacherUnlocked(false);
    localStorage.removeItem("isTeacher");
  };

  const goToTeacher = () => {
    setPw("");
    setMode("teacher");
    setTeacherUnlocked(false);
  };

  return (
    <div style={{
      padding: 16,
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f4fafe,#e2e6fa 90%)",
      fontFamily: "Rubik, Arial, sans-serif"
    }}>
      <h1 style={{ textAlign: 'center', color: "#222", letterSpacing: "1px", marginTop: 18, fontWeight: 500 }}>מעקב סטטוס תרגול</h1>
      {mode === "student" ? (
        <StudentView
          onGoToTeacher={goToTeacher}
          studentName={studentName}
          setStudentName={setStudentName}
          taskName={taskName}
        />
      ) : !teacherUnlocked ? (
        <div style={{ maxWidth: 320, margin: "50px auto", background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px #0001", padding: 32, textAlign: 'center' }}>
          <h2>כניסת מורה</h2>
          <input
            type="password"
            placeholder="סיסמה"
            value={pw}
            onChange={e => setPw(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 16, borderRadius: 8, border: "1.5px solid #aaa" }}
            onKeyDown={e => { if (e.key === "Enter") if (pw === TEACHER_PASSWORD) unlockTeacher(); }}
          />
          <button
            onClick={() => { if (pw === TEACHER_PASSWORD) unlockTeacher(); }}
            style={{ width: "100%", padding: 10, fontSize: 16, background: "#4169e1", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500 }}
          >
            כניסה
          </button>
          <div style={{ color: "red", height: 24, marginTop: 8, fontWeight: 500 }}>
            {pw && pw !== TEACHER_PASSWORD ? "סיסמה שגויה" : ""}
          </div>
          <button style={{ marginTop: 12, background: "none", border: "none", color: "#555", textDecoration: "underline", fontSize: 15 }} onClick={() => setMode("student")}>חזור לתלמיד</button>
        </div>
      ) : (
        <TeacherView onLogout={logoutTeacher} />
      )}
    </div>
  );
}
