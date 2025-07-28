import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import socket from "../../socket";
import axios from "axios";
import StudentTaskTable from "./StudentTaskTable";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function StudentDashboard({ student, onLogout }) {
  const [classObj, setClassObj] = useState(null);

  useEffect(() => {
    if (!student.classId) return;
    socket.emit("join_class", { classId: student.classId });
    axios.get(`${API_URL}/api/class/${student.classId}`).then(({ data }) => {
      setClassObj(data);
    });

    function updateListener(cls) {
      if (cls._id === student.classId) setClassObj(cls);
    }
    socket.on("update_class", updateListener);
    return () => socket.off("update_class", updateListener);
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
