import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Divider,
} from "@mui/material";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      setMsg("");
      const data = await apiFetch("/appointments/doctor"); // GET /api/appointments/doctor
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load doctor appointments.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action, doctorNotes) => {
  try {
    setLoading(true);
    setMsg("");

    const newStatus = action === "approve" ? "approved" : "rejected";

    // ✅ Most common backend pattern: PUT /api/appointments/:id/status
    await apiFetch(`/appointments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: newStatus,
        doctorNotes: doctorNotes || "",
      }),
    });

    await fetchDoctorAppointments();
    setMsg(newStatus === "approved" ? "✅ Approved!" : "✅ Rejected!");
  } catch (e) {
    console.error(e);
    setMsg("Update failed. Check backend route/role/token.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    fetchDoctorAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAppointments = useMemo(() => {
    const s = search.trim().toLowerCase();

    return appointments.filter((a) => {
      const status = (a.status || "pending").toLowerCase();
      const statusOk = statusFilter === "all" ? true : status === statusFilter;

      if (!s) return statusOk;

      const patientName = (a.patientId?.name || a.patient?.name || "").toLowerCase();
      const patientEmail = (a.patientId?.email || a.patient?.email || "").toLowerCase();
      const reason = (a.reason || "").toLowerCase();
      const notes = (a.doctorNotes || "").toLowerCase();
      const dateText = (a.date || a.appointmentDate || "").toString().toLowerCase();

      const searchOk =
        patientName.includes(s) ||
        patientEmail.includes(s) ||
        reason.includes(s) ||
        notes.includes(s) ||
        status.includes(s) ||
        dateText.includes(s);

      return statusOk && searchOk;
    });
  }, [appointments, statusFilter, search]);

  const statusChip = (statusRaw) => {
    const status = (statusRaw || "pending").toLowerCase();

    const props =
      status === "approved"
        ? { label: "APPROVED", color: "success" }
        : status === "rejected"
        ? { label: "REJECTED", color: "error" }
        : { label: "PENDING", color: "warning" };

    return <Chip size="small" variant="outlined" {...props} />;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Doctor Dashboard ✅
          </Typography>
          <Button color="inherit" onClick={fetchDoctorAppointments} disabled={loading}>
            Refresh
          </Button>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {msg ? (
          <Alert severity={msg.includes("Failed") || msg.includes("Update failed") ? "error" : "success"} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        ) : null}

        <Card variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search"
                placeholder="patient / email / reason / status"
                fullWidth
              />

              <Button variant="outlined" onClick={() => setSearch("")}>
                Clear
              </Button>

              <Box sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                Showing: {filteredAppointments.length} / {appointments.length}
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Patient</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Date</b></TableCell>
                    <TableCell><b>Reason</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Doctor Notes</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAppointments.map((a) => (
                    <DoctorRow
                      key={a._id}
                      appt={a}
                      loading={loading}
                      statusChip={statusChip}
                      onApprove={(notes) => updateStatus(a._id, "approve", notes)}
                      onReject={(notes) => updateStatus(a._id, "reject", notes)}
                    />
                  ))}

                  {filteredAppointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

function DoctorRow({ appt, onApprove, onReject, loading, statusChip }) {
  const [notes, setNotes] = useState(appt.doctorNotes || "");
  const status = (appt.status || "pending").toLowerCase();

  const patientName = appt.patientId?.name || appt.patient?.name || "N/A";
  const patientEmail = appt.patientId?.email || appt.patient?.email || "N/A";
  const dateVal = appt.date || appt.appointmentDate;

  return (
    <TableRow hover>
      <TableCell>{patientName}</TableCell>
      <TableCell>{patientEmail}</TableCell>
      <TableCell>{dateVal ? new Date(dateVal).toLocaleString() : "N/A"}</TableCell>
      <TableCell>{appt.reason || ""}</TableCell>
      <TableCell>{statusChip(status)}</TableCell>
      <TableCell sx={{ minWidth: 260 }}>
        <TextField
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          size="small"
          placeholder="Add note..."
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => onApprove(notes)}
            disabled={loading || status === "approved"}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onReject(notes)}
            disabled={loading || status === "rejected"}
          >
            Reject
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
