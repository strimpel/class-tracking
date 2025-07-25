import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import socket from "../../socket";
import axios from "axios";
import StudentTaskTable from "./StudentTaskTable";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function StudentDashboard({ student, onLogout }) {
  const [classObj, setClassObj] = useState(null);

  // משיכת פרטי כיתה וסטטוס בלייב
  useEffect(() => {
    if (!student.classId) return;
    // חיבור לכיתה
    socket.emit("join_class", { classId: student.classId });

    // שליפת מצב עדכני
    axios.get(`${API_URL}/api/classes?adminUsername=none`).then(({ data }) => {
      // מוצא את הכיתה מתוך כל הכיתות
      const cls = data.find(c => c.id === student.classId);
      if (cls) setClassObj(cls);
    });

    // קבלת עדכונים חיים
    function updateListener(cls) {
      if (cls.id === student.classId) setClassObj(cls);
    }
    socket.on("update_class", updateListener);
    return () => socket.off("update_class", updateListener);
    // eslint-disable-next-line
  }, [student.classId]);

  if (!classObj) return <Typography>טוען נתוני כיתה...</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">
          שלום {student.firstName} {student.lastName}
        </Typography>
        <Button onClick={onLogout} color="secondary" variant="outlined">התנתק</Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">כיתה: {classObj.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        קוד כיתה: {classObj.code}
      </Typography>
      <Box mt={2}>
        <StudentTaskTable classObj={classObj} student={student} />
      </Box>
    </Box>
  );
}
