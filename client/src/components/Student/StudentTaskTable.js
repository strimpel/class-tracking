import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Typography, Box } from "@mui/material";
import socket from "../../socket";

const statuses = [
  { value: "not_started", label: "לא התחיל" },
  { value: "started", label: "התחיל" },
  { value: "finished", label: "סיים" },
];

export default function StudentTaskTable({ classObj, student }) {
  if (classObj.tasks.length === 0) {
    return <Typography>עדיין אין משימות בכיתה.</Typography>;
  }

  const handleStatusChange = (taskId, newStatus) => {
    socket.emit("update_status", {
      classId: classObj._id,
      taskId,
      studentId: student.studentId,
      status: newStatus,
    });
  };

  return (
    <Box>
      <Typography variant="h6" mb={1}>המשימות שלך</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>משימה</TableCell>
            <TableCell>סטטוס שלך</TableCell>
            <TableCell>האם זו המשימה הנוכחית?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classObj.tasks.map(task => (
            <TableRow key={task.id}>
              <TableCell>{task.name}</TableCell>
              <TableCell>
                <Select
                  size="small"
                  value={task.statuses?.[student.studentId] || "not_started"}
                  onChange={e => handleStatusChange(task.id, e.target.value)}
                >
                  {statuses.map(st => (
                    <MenuItem value={st.value} key={st.value}>{st.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                {task.isCurrent ? "כן" : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
