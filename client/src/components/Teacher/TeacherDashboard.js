import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import socket from "../../socket";
import axios from "axios";
import ClassManager from "./ClassManager";
import TaskSidebar from "./TaskSidebar";
import TaskDetails from "./TaskDetails";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function TeacherDashboard({ teacher, onLogout }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // טען כיתות של מורה זה
  useEffect(() => {
    axios.get(`${API_URL}/api/classes?adminUsername=${teacher.username}`).then(({ data }) => {
      setClasses(data);
      if (data.length > 0) setSelectedClass(data[0]);
    });
  }, [teacher]);

  // הצטרף לחדר socket של הכיתה
  useEffect(() => {
    if (selectedClass) {
      socket.emit("join_class", { classId: selectedClass.id });
    }
  }, [selectedClass]);

  // קבל עדכון realtime מכל שינוי בכיתה
  useEffect(() => {
    function updateListener(cls) {
      setClasses(prev => prev.map(c => c.id === cls.id ? cls : c));
      if (selectedClass && selectedClass.id === cls.id) setSelectedClass(cls);
    }
    socket.on("update_class", updateListener);
    return () => socket.off("update_class", updateListener);
    // eslint-disable-next-line
  }, [selectedClass]);

  // בוחר משימה
  const handleSelectTask = task => setSelectedTask(task);

  // עדכון ברירת מחדל למשימה
  useEffect(() => {
    if (selectedClass && selectedClass.tasks.length > 0) {
      const curr = selectedClass.tasks.find(t => t.isCurrent) || selectedClass.tasks[0];
      setSelectedTask(curr);
    } else {
      setSelectedTask(null);
    }
  }, [selectedClass]);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">שלום, {teacher.username}</Typography>
        <Button onClick={onLogout} color="secondary" variant="outlined">התנתק</Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <ClassManager
        classes={classes}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        teacher={teacher}
        setClasses={setClasses}
      />
      {selectedClass && (
        <Box display="flex" mt={2}>
          <TaskSidebar
            classObj={selectedClass}
            setClasses={setClasses}
            onSelectTask={handleSelectTask}
            selectedTask={selectedTask}
          />
          <Box flexGrow={1} ml={2}>
            {selectedTask ? (
              <TaskDetails
                classObj={selectedClass}
                task={selectedTask}
                setClasses={setClasses}
              />
            ) : (
              <Typography>בחר או הוסף משימה</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
