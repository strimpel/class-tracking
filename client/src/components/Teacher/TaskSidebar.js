import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, IconButton, TextField, Button, Typography } from "@mui/material";
import socket from "../../socket";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function TaskSidebar({ classObj, setClasses, onSelectTask, selectedTask }) {
  const [taskName, setTaskName] = useState("");

  const addTask = () => {
    if (!taskName) return;
    socket.emit("add_task", { classId: classObj.id, name: taskName });
    setTaskName("");
  };

  const deleteTask = id => {
    socket.emit("delete_task", { classId: classObj.id, taskId: id });
  };

  const setCurrentTask = id => {
    socket.emit("set_current_task", { classId: classObj.id, taskId: id });
  };

  return (
    <Box minWidth={220} borderRight="1px solid #ccc" pr={1}>
      <Typography variant="subtitle1">משימות</Typography>
      <List>
        {classObj.tasks.map(task => (
          <ListItem
            key={task.id}
            selected={selectedTask && task.id === selectedTask.id}
            onClick={() => onSelectTask(task)}
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => setCurrentTask(task.id)} title="סמן נוכחית">
                  <CheckCircleIcon color={task.isCurrent ? "success" : "disabled"} />
                </IconButton>
                <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
            button
          >
            <ListItemText primary={task.name} secondary={task.isCurrent ? "משימה נוכחית" : ""} />
          </ListItem>
        ))}
      </List>
      <Box display="flex" gap={1} mt={1}>
        <TextField
          label="שם משימה"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={addTask}>הוסף</Button>
      </Box>
    </Box>
  );
}
