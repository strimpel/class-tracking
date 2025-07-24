import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function LoginForm({ setTeacher }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (registerMode) {
        await axios.post(`${API_URL}/api/register`, { username, password });
        setRegisterMode(false);
      } else {
        await axios.post(`${API_URL}/api/login`, { username, password });
        setTeacher({ username });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 350, mx: "auto" }}>
      <Typography variant="h6">{registerMode ? "הרשמה כמורה" : "התחברות מורה"}</Typography>
      <TextField label="שם משתמש" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
      <TextField label="סיסמה" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        {registerMode ? "הרשם" : "התחבר"}
      </Button>
      <Button
        color="secondary"
        onClick={() => setRegisterMode(r => !r)}
        sx={{ mt: 1 }}
        fullWidth
      >
        {registerMode ? "יש לך חשבון? התחבר" : "עדיין אין חשבון? הרשם"}
      </Button>
    </Box>
  );
}
