import React from "react";
import { Box, Typography } from "@mui/material";
import StudentStatusTable from "./StudentStatusTable";

export default function TaskDetails({ classObj, task, setClasses }) {
  return (
    <Box>
      <Typography variant="h6">משימה: {task.name}</Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {task.isCurrent ? "זוהי המשימה הנוכחית" : ""}
      </Typography>
      <Box mt={2}>
        <StudentStatusTable classObj={classObj} task={task} setClasses={setClasses} />
      </Box>
    </Box>
  );
}
