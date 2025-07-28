import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem } from "@mui/material";
import socket from "../../socket";

const statuses = [
  { value: "not_started", label: "לא התחיל" },
  { value: "started", label: "התחיל" },
  { value: "finished", label: "סיים" },
];

export default function StudentStatusTable({ classObj, task }) {
  const handleStatusChange = (studentId, newStatus) => {
    socket.emit("update_status", {
  classId: classObj._id, // זה שם השדה הנכון
  taskId: task.id,
  studentId,
  status: newStatus,
});
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>שם תלמיד</TableCell>
          <TableCell>סטטוס</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {classObj.students.map(s => (
          <TableRow key={s.id}>
            <TableCell>{s.firstName} {s.lastName}</TableCell>
            <TableCell>
              <Select
                size="small"
                value={task.statuses[s.id] || "not_started"}
                onChange={e => handleStatusChange(s.id, e.target.value)}
              >
                {statuses.map(st => (
                  <MenuItem value={st.value} key={st.value}>{st.label}</MenuItem>
                ))}
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
