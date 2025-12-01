// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos (front-end)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Datos en memoria (para demo/portafolio)
 * En un sistema real esto vendría de una BD.
 */

// Horarios disponibles (slots)
let slots = [
  // Fecha en formato YYYY-MM-DD
  { id: 1, date: '2025-12-01', time: '09:00', type: 'Médico familiar', available: true },
  { id: 2, date: '2025-12-01', time: '09:30', type: 'Médico familiar', available: true },
  { id: 3, date: '2025-12-01', time: '10:00', type: 'Control crónico', available: true },
  { id: 4, date: '2025-12-02', time: '11:00', type: 'Toma de exámenes', available: true },
  { id: 5, date: '2025-12-02', time: '11:30', type: 'Toma de exámenes', available: true }
];

// Visitas agendadas
let appointments = [];

// Exámenes (demo)
let exams = [
  {
    id: 1,
    patientRut: '11111111-1',
    name: 'Hemograma',
    date: '2025-11-20',
    status: 'Disponible para retiro'
  },
  {
    id: 2,
    patientRut: '22222222-2',
    name: 'Perfil lipídico',
    date: '2025-11-18',
    status: 'En proceso'
  }
];

// ---------- RUTAS API ----------

// Obtener horarios disponibles (slots)
app.get('/api/slots', (req, res) => {
  const { date, type } = req.query;

  let filtered = slots.filter(s => s.available);

  if (date) {
    filtered = filtered.filter(s => s.date === date);
  }
  if (type) {
    filtered = filtered.filter(s => s.type === type);
  }

  res.json(filtered);
});

// Crear una nueva visita (appointment)
app.post('/api/appointments', (req, res) => {
  const { patientName, patientRut, email, phone, slotId, reason } = req.body;

  if (!patientName || !patientRut || !slotId) {
    return res.status(400).json({ message: 'Faltan datos obligatorios.' });
  }

  const slot = slots.find(s => s.id === Number(slotId));

  if (!slot) {
    return res.status(404).json({ message: 'Horario no encontrado.' });
  }

  if (!slot.available) {
    return res.status(400).json({ message: 'Horario ya reservado.' });
  }

  const newAppointment = {
    id: appointments.length + 1,
    patientName,
    patientRut,
    email: email || '',
    phone: phone || '',
    reason: reason || '',
    slotId: slot.id,
    date: slot.date,
    time: slot.time,
    type: slot.type
  };

  appointments.push(newAppointment);
  slot.available = false;

  res.status(201).json(newAppointment);
});

// Obtener visitas (todas o por RUT)
app.get('/api/appointments', (req, res) => {
  const { patientRut } = req.query;

  if (patientRut) {
    const filtered = appointments.filter(
      a => a.patientRut.toLowerCase() === patientRut.toLowerCase()
    );
    return res.json(filtered);
  }

  res.json(appointments);
});

// Obtener exámenes (por RUT)
app.get('/api/exams', (req, res) => {
  const { patientRut } = req.query;

  if (!patientRut) {
    return res.status(400).json({ message: 'Debe indicar un RUT de paciente.' });
  }

  const filtered = exams.filter(
    e => e.patientRut.toLowerCase() === patientRut.toLowerCase()
  );

  res.json(filtered);
});

// ---------- INICIO DEL SERVIDOR ----------
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
