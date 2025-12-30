import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setMsg("");
      setLoading(true);

      // ✅ change endpoint here if your backend uses /users/login
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Expect: { token, role, user }
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.role || data.user?.role;

      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor");
      else navigate("/patient");
    } catch (err) {
      console.error(err);
      setMsg("Login failed. Check email/password or backend route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Healthcare Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#f6f7fb", py: 6 }}>
        <Container maxWidth="sm">
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.main",
                    color: "white",
                  }}
                >
                  <LockOutlinedIcon />
                </Box>

                <Typography variant="h5" fontWeight={800}>
                  Login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in as Admin / Doctor / Patient
                </Typography>
              </Stack>

              {msg ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {msg}
                </Alert>
              ) : null}

              <Stack component="form" spacing={2} onSubmit={onSubmit}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  fullWidth
                />

                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  Test users:
                  <br /> Admin: admin@test.com / 123456
                  <br /> Doctor: doctor1@test.com / 123456
                  <br /> Patient: patient@test.com / 123456
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
