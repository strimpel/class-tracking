import React, { useState, useEffect } from "react";
import { CssBaseline, Container, Box } from "@mui/material";
import ModeSelector from "./components/Shared/ModeSelector";
import LoginForm from "./components/Auth/LoginForm";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import JoinClassForm from "./components/Student/JoinClassForm";

function App() {
  const [mode, setMode] = useState(null); // 'teacher' | 'student'
  const [teacher, setTeacher] = useState(null); // { username }
  const [student, setStudent] = useState(null); // { studentId, classId, firstName, lastName }

  // שמירה ב-localStorage
  useEffect(() => {
    const m = localStorage.getItem("mode");
    if (m) setMode(m);
    const t = localStorage.getItem("teacher");
    if (t) setTeacher(JSON.parse(t));
    const s = localStorage.getItem("student");
    if (s) setStudent(JSON.parse(s));
  }, []);

  useEffect(() => {
    if (mode) localStorage.setItem("mode", mode);
    if (teacher) localStorage.setItem("teacher", JSON.stringify(teacher));
    if (student) localStorage.setItem("student", JSON.stringify(student));
  }, [mode, teacher, student]);

  // Reset on logout
  const handleLogout = () => {
    setMode(null);
    setTeacher(null);
    setStudent(null);
    localStorage.clear();
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <h1 style={{ textAlign: "center" }}>מערכת ניהול סטטוס כיתה</h1>
          {!mode && <ModeSelector setMode={setMode} />}
          {mode === "teacher" && !teacher && <LoginForm setTeacher={setTeacher} />}
          {mode === "teacher" && teacher && (
            <TeacherDashboard teacher={teacher} onLogout={handleLogout} />
          )}
          {mode === "student" && !student && (
            <JoinClassForm setStudent={setStudent} />
          )}
          {mode === "student" && student && (
            <StudentDashboard student={student} onLogout={handleLogout} />
          )}
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
