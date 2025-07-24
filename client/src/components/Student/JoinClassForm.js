import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default function JoinClassForm({ setStudent }) {
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/api/join`, {
        code,
        firstName,
        lastName,
      });
      setStudent(data);
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 350, mx: "auto" }}>
      <Typography variant="h6">הצטרפות לכיתה</Typography>
      <TextField label="קוד כיתה" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} required />
      <TextField label="שם פרטי" fullWidth margin="normal" value={firstName} onChange={e => setFirstName(e.target.value)} required />
      <TextField label="שם משפחה" fullWidth margin="normal" value={lastName} onChange={e => setLastName(e.target.value)} required />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        הצטרף
      </Button>
    </Box>
  );
}
