import { Box, Button } from "@mui/material";

export default function ModeSelector({ setMode }) {
  return (
    <Box textAlign="center">
      <Button variant="contained" onClick={() => setMode("teacher")} sx={{ m: 2 }}>
        מורה
      </Button>
      <Button variant="outlined" onClick={() => setMode("student")} sx={{ m: 2 }}>
        תלמיד
      </Button>
    </Box>
  );
}
