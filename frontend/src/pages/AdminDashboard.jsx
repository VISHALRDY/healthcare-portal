import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Divider,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
} from "@mui/material";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 appts, 1 users, 2 doctors, 3 create

  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Create user form
  const [newRole, setNewRole] = useState("doctor");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const statusChip = (s) => {
    const v = (s || "pending").toLowerCase();
    if (v === "approved") return <Chip size="small" label="APPROVED" color="success" variant="outlined" />;
    if (v === "rejected") return <Chip size="small" label="REJECTED" color="error" variant="outlined" />;
    return <Chip size="small" label="PENDING" color="warning" variant="outlined" />;
  };

  const loadAppointments = async () => {
    const data = await apiFetch("/appointments");
    setAppointments(Array.isArray(data) ? data : []);
  };

  const loadUsers = async () => {
    const data = await apiFetch("/users");
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadDoctors = async () => {
    const data = await apiFetch("/users/doctors");
    setDoctors(Array.isArray(data) ? data : []);
  };

  const refreshCurrentTab = async () => {
    if (tab === 0) return loadAppointments();
    if (tab === 1) return loadUsers();
    if (tab === 2) return loadDoctors();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setMsg("");
    setLoading(true);

    Promise.resolve()
      .then(() => refreshCurrentTab())
      .catch((e) => {
        console.error(e);
        setMsg("Failed to load data. Check token/role/backend.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const onCreateUser = async (e) => {
    e.preventDefault();

    if (!newName.trim()) return setMsg("Enter name.");
    if (!newEmail.trim()) return setMsg("Enter email.");
    if (!newPassword.trim() || newPassword.length < 6)
      return setMsg("Password must be at least 6 characters.");

    try {
      setMsg("");
      setLoading(true);

      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      setMsg(`✅ ${newRole.toUpperCase()} created successfully!`);

      // reset form
      setNewName("");
      setNewEmail("");
      setNewPassword("");

      // refresh lists
      await Promise.all([loadUsers(), loadDoctors()]);
    } catch (err) {
      console.error(err);
      setMsg("❌ Create failed. Email may already exist or admin not authorized.");
    } finally {
      setLoading(false);
    }
  };

  const usersCount = useMemo(() => users.length, [users]);
  const doctorsCount = useMemo(() => doctors.length, [doctors]);
  const apptsCount = useMemo(() => appointments.length, [appointments]);

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard ✅
          </Typography>
          <Button color="inherit" onClick={refreshCurrentTab} disabled={loading}>
            Refresh
          </Button>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <Chip label={`Appointments: ${apptsCount}`} variant="outlined" />
          <Chip label={`Users: ${usersCount}`} variant="outlined" />
          <Chip label={`Doctors: ${doctorsCount}`} variant="outlined" />
        </Stack>

        {msg ? (
          <Alert
            severity={
              msg.startsWith("✅") ? "success" : msg.startsWith("❌") ? "error" : "info"
            }
            sx={{ mb: 2 }}
          >
            {msg}
          </Alert>
        ) : null}

        <Card variant="outlined">
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Appointments" />
              <Tab label="Users" />
              <Tab label="Doctors" />
              <Tab label="Create Doctor/Patient" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {/* 0) Appointments */}
            {tab === 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Patient</b></TableCell>
                      <TableCell><b>Doctor</b></TableCell>
                      <TableCell><b>Date</b></TableCell>
                      <TableCell><b>Reason</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                          No appointments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell>{a.patient?.name || a.patientId?.name || "Patient"}</TableCell>
                          <TableCell>{a.doctor?.name || a.doctorId?.name || "Doctor"}</TableCell>
                          <TableCell>{a.date ? new Date(a.date).toLocaleString() : ""}</TableCell>
                          <TableCell>{a.reason}</TableCell>
                          <TableCell>{statusChip(a.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 1) Users */}
            {tab === 1 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Name</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ color: "text.secondary" }}>
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u._id}>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Chip size="small" label={u.role?.toUpperCase()} variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 2) Doctors */}
            {tab === 2 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Name</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ color: "text.secondary" }}>
                          No doctors found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      doctors.map((d) => (
                        <TableRow key={d._id}>
                          <TableCell>{d.name}</TableCell>
                          <TableCell>{d.email}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 3) Create Doctor/Patient */}
            {tab === 3 && (
              <Box component="form" onSubmit={onCreateUser} sx={{ maxWidth: 520 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  Create Doctor / Patient
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Admin-only: creates login accounts and adds them to Users/Doctors list.
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    select
                    label="Role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="patient">Patient</MenuItem>
                  </TextField>

                  <TextField
                    label="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />

                  <TextField
                    label="Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />

                  <TextField
                    label="Temporary Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Min 6 characters"
                  />

                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Creating..." : "Create User"}
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
