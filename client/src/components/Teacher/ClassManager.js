import React, { useState } from "react";
import { Box, Button, List, ListItem, ListItemText, TextField, Typography, IconButton } from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function ClassManager({ classes, selectedClass, setSelectedClass, teacher, setClasses }) {
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");

  const addClass = async () => {
    if (!className || !classCode) return;
    const { data } = await axios.post(`${API_URL}/api/class`, {
      name: className,
      code: classCode,
      adminUsername: teacher.username
    });
    setClasses(prev => [...prev, { ...data, students: [], tasks: [], adminUsername: teacher.username }]);
    setClassName("");
    setClassCode("");
  };

  const deleteClass = async id => {
    await axios.delete(`${API_URL}/api/class/${id}`);
    setClasses(prev => prev.filter(cls => cls._id !== id));
    if (selectedClass && selectedClass._id === id) setSelectedClass(null);
  };

  return (
    <Box>
      <Typography variant="h6">
        {teacher.isSuperAdmin ? "כל הכיתות במערכת" : "הכיתות שלך"}
      </Typography>
      <List>
        {classes.map(cls => (
          <ListItem
            key={cls._id}
            selected={selectedClass && cls._id === selectedClass._id}
            onClick={() => setSelectedClass(cls)}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteClass(cls._id)}>
                <DeleteIcon />
              </IconButton>
            }
            button
          >
            <ListItemText
              primary={cls.name}
              secondary={`קוד: ${cls.code} | מורה: ${cls.adminUsername} (${cls.students.length} תלמידים, ${cls.tasks.length} משימות)`}
            />
          </ListItem>
        ))}
      </List>
      {!teacher.isSuperAdmin && (
        <Box display="flex" gap={1} mt={1}>
          <TextField
            label="שם כיתה"
            value={className}
            onChange={e => setClassName(e.target.value)}
            size="small"
          />
          <TextField
            label="קוד כיתה"
            value={classCode}
            onChange={e => setClassCode(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={addClass}>הוסף</Button>
        </Box>
      )}
    </Box>
  );
}
