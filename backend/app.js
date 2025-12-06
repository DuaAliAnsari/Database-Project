require("dotenv").config(); 

const express = require("express");

// Routes
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientsRoutes");
const appointmentRoutes = require("./routes/AppointmentRoutes");

const db = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/", (req, res) => {
  res.json({ 
    message: "Hospital Management System API is running!",
    endpoints: {
      doctors: "/api/doctors",
      patients: "/api/patients",
      appointments: "/api/appointments",
       billing: "/api/billing"
      // labTests: "/api/lab-tests",
      // medicalHistory: "/api/medical-history",
      // nurses: "/api/nurses",
      // nurseAssignments: "/api/nurse-assignments",
      // rooms: "/api/rooms",
      // roomAssignments: "/api/room-assignments",
      // prescriptions: "/api/prescriptions",
      // visitRecords: "/api/visit-records",
      // walkins: "/api/walkins"
    }
  });
});

const PORT = process.env.PORT || 3001;
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});