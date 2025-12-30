import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
} from "@mui/material";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // form
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(""); // datetime-local
  const [reason, setReason] = useState("");

  // filters
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchDoctors = async () => {
    try {
      const data = await apiFetch("/users/doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg("Unable to load doctors. Please login again.");
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const data = await apiFetch("/appointments/my");
      setMyAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg("Unable to load appointments.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    setMsg("");
    Promise.all([fetchDoctors(), fetchMyAppointments()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRequestAppointment = async (e) => {
    e.preventDefault();

    if (!doctorId) return setMsg("Please select a doctor.");
    if (!date) return setMsg("Please select date & time.");
    if (!reason.trim()) return setMsg("Please enter the reason.");

    try {
      setLoading(true);
      setMsg("");

      // backend expects { doctorId, date(or appointmentDate), reason }
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          date,
          reason: reason.trim(),
        }),
      });

      setDoctorId("");
      setDate("");
      setReason("");

      setMsg("✅ Appointment requested (Pending).");
      await fetchMyAppointments();
    } catch (e2) {
      console.error(e2);
      setMsg("❌ Failed to request appointment. Check backend/role/token.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatus("all");
    setQ("");
  };

  const statusChip = (s) => {
    const val = (s || "pending").toLowerCase();
    const color =
      val === "approved" ? "success" : val === "rejected" ? "error" : "warning";
    return (
      <Chip
        size="small"
        label={val.toUpperCase()}
        color={color}
        variant="outlined"
      />
    );
  };

  // ✅ IMPORTANT: handle both possible field names
  // date: appointmentDate OR date
  // doctor: doctorId OR doctor
  const normalized = useMemo(() => {
    const list = Array.isArray(myAppointments) ? [...myAppointments] : [];
    return list
      .map((a) => {
        const apptDate = a.appointmentDate || a.date || a.createdAt || null;
        const doctorObj = a.doctorId || a.doctor || null;
        const doctorName =
          doctorObj?.name || a.doctorName || a.doctor || "Doctor";
        const notes = a.doctorNotes ?? a.notes ?? ""; // ✅ doctorNotes
        return {
          ...a,
          _apptDate: apptDate,
          _doctorName: doctorName,
          _notes: notes,
        };
      })
      .sort(
        (a, b) => new Date(b._apptDate || 0) - new Date(a._apptDate || 0)
      );
  }, [myAppointments]);

  const filteredAppointments = useMemo(() => {
    let list = [...normalized];

    if (status !== "all") {
      list = list.filter(
        (a) => (a.status || "").toLowerCase() === status.toLowerCase()
      );
    }

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter((a) => {
        const dt = a._apptDate ? new Date(a._apptDate).toLocaleString() : "";
        return (
          String(a._doctorName || "").toLowerCase().includes(qq) ||
          String(a.reason || "").toLowerCase().includes(qq) ||
          String(a.status || "").toLowerCase().includes(qq) ||
          String(a._notes || "").toLowerCase().includes(qq) ||
          String(dt).toLowerCase().includes(qq)
        );
      });
    }

    return list;
  }, [normalized, status, q]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9fc" }}>
      {/* Top Bar */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Patient Dashboard ✅
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              onClick={fetchMyAppointments}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        {msg ? (
          <Alert
            severity={msg.startsWith("✅") ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {msg}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          {/* Book Appointment */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Book Appointment
                </Typography>

                <Box component="form" onSubmit={onRequestAppointment}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Doctor</InputLabel>
                    <Select
                      label="Select Doctor"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>Select Doctor</em>
                      </MenuItem>
                      {doctors.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    label="Date & Time"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    label="Reason (e.g., fever, headache)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : "Request Appointment"}
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, color: "text.secondary" }}
                  >
                    Default status will be Pending until doctor approves/rejects.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Appointments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  My Appointments
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="doctor / reason / notes / status"
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    {/* ✅ Clear button aligned */}
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={clearFilters}
                      sx={{ height: 56 }}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Doctor</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          Doctor Notes
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                            No appointments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((a) => {
                          const dt = a._apptDate
                            ? new Date(a._apptDate).toLocaleString()
                            : "-";

                          return (
                            <TableRow key={a._id}>
                              <TableCell>{a._doctorName}</TableCell>
                              <TableCell>{dt}</TableCell>
                              <TableCell>{a.reason || "-"}</TableCell>
                              <TableCell>{statusChip(a.status)}</TableCell>

                              {/* ✅ doctor notes visible */}
                              <TableCell>
                                {a._notes && String(a._notes).trim()
                                  ? a._notes
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
