// app.js

let selectedSlotId = null;
let selectedSlotText = '';

document.addEventListener('DOMContentLoaded', () => {
  // Cargar horarios inicialmente
  loadSlots();

  // Filtros de horarios
  const filterSlotsForm = document.getElementById('filterSlotsForm');
  const clearFiltersBtn = document.getElementById('clearFilters');

  filterSlotsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadSlots();
  });

  clearFiltersBtn.addEventListener('click', () => {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterType').value = '';
    loadSlots();
  });

  // Manejar selección de horario en la tabla (delegación de eventos)
  const slotsTable = document.getElementById('slotsTable');
  slotsTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-select-slot')) {
      const slotId = e.target.getAttribute('data-slot-id');
      const slotInfo = e.target.getAttribute('data-slot-info');
      setSelectedSlot(slotId, slotInfo);
    }
  });

  // Formulario de agendamiento
  const appointmentForm = document.getElementById('appointmentForm');
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitAppointment();
  });

  // Buscar visitas por RUT
  const searchAppointmentsForm = document.getElementById('searchAppointmentsForm');
  searchAppointmentsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await loadAppointments();
  });

  // Buscar exámenes por RUT
  const searchExamsForm = document.getElementById('searchExamsForm');
  searchExamsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await loadExams();
  });
});

// --------------- FUNCIONES ---------------

async function loadSlots() {
  const date = document.getElementById('filterDate').value;
  const type = document.getElementById('filterType').value;

  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (type) params.append('type', type);

  const url = '/api/slots' + (params.toString() ? `?${params.toString()}` : '');

  try {
    const res = await fetch(url);
    const data = await res.json();

    const tbody = document.querySelector('#slotsTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      document.getElementById('slotsMessage').textContent =
        'No hay horarios disponibles para los filtros seleccionados.';
      return;
    }

    document.getElementById('slotsMessage').textContent = '';

    data.forEach((slot) => {
      const tr = document.createElement('tr');
      const infoText = `${slot.date} a las ${slot.time} (${slot.type})`;

      tr.innerHTML = `
        <td>${slot.date}</td>
        <td>${slot.time}</td>
        <td>${slot.type}</td>
        <td>
          <button
            class="btn btn-sm btn-outline-success btn-select-slot"
            data-slot-id="${slot.id}"
            data-slot-info="${infoText}"
          >
            Seleccionar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    document.getElementById('slotsMessage').textContent =
      'Ocurrió un error al cargar los horarios.';
  }
}

function setSelectedSlot(slotId, infoText) {
  selectedSlotId = slotId;
  selectedSlotText = infoText;

  const infoBox = document.getElementById('selectedSlotInfo');
  const infoSpan = document.getElementById('selectedSlotText');

  infoSpan.textContent = selectedSlotText;
  infoBox.classList.remove('d-none');
}

async function submitAppointment() {
  const patientName = document.getElementById('patientName').value.trim();
  const patientRut = document.getElementById('patientRut').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const reason = document.getElementById('reason').value.trim();

  const messageEl = document.getElementById('appointmentMessage');
  messageEl.textContent = '';

  if (!selectedSlotId) {
    messageEl.textContent = 'Debes seleccionar un horario en la tabla de horarios.';
    messageEl.className = 'mt-2 small text-danger';
    return;
  }

  if (!patientName || !patientRut) {
    messageEl.textContent = 'Nombre y RUT son obligatorios.';
    messageEl.className = 'mt-2 small text-danger';
    return;
  }

  const payload = {
    patientName,
    patientRut,
    email,
    phone,
    reason,
    slotId: Number(selectedSlotId)
  };

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.textContent = data.message || 'No se pudo agendar la visita.';
      messageEl.className = 'mt-2 small text-danger';
      return;
    }

    messageEl.textContent = 'Visita agendada correctamente.';
    messageEl.className = 'mt-2 small text-success';

    // Reset de formulario y selección de horario
    document.getElementById('appointmentForm').reset();
    selectedSlotId = null;
    selectedSlotText = '';
    document.getElementById('selectedSlotInfo').classList.add('d-none');

    // Recargar horarios y visitas
    loadSlots();
    document.getElementById('searchRutAppointments').value = patientRut;
    loadAppointments();
  } catch (error) {
    console.error(error);
    messageEl.textContent = 'Ocurrió un error al agendar la visita.';
    messageEl.className = 'mt-2 small text-danger';
  }
}

async function loadAppointments() {
  const rut = document.getElementById('searchRutAppointments').value.trim();
  const messageEl = document.getElementById('appointmentsMessage');
  messageEl.textContent = '';

  const params = new URLSearchParams();
  if (rut) params.append('patientRut', rut);

  const url = '/api/appointments' + (params.toString() ? `?${params.toString()}` : '');

  try {
    const res = await fetch(url);
    const data = await res.json();

    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      messageEl.textContent = 'No se encontraron visitas para el RUT indicado.';
      return;
    }

    data.forEach((appt) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${appt.date}</td>
        <td>${appt.time}</td>
        <td>${appt.type}</td>
        <td>${appt.patientName}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    messageEl.textContent = 'Ocurrió un error al cargar las visitas.';
  }
}

async function loadExams() {
  const rut = document.getElementById('searchRutExams').value.trim();
  const messageEl = document.getElementById('examsMessage');
  messageEl.textContent = '';

  if (!rut) {
    messageEl.textContent = 'Debes ingresar un RUT para buscar exámenes.';
    return;
  }

  const params = new URLSearchParams();
  params.append('patientRut', rut);

  const url = `/api/exams?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const tbody = document.querySelector('#examsTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      messageEl.textContent = 'No se encontraron exámenes para el RUT indicado.';
      return;
    }

    data.forEach((exam) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${exam.date}</td>
        <td>${exam.name}</td>
        <td>${exam.status}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    messageEl.textContent = 'Ocurrió un error al cargar los exámenes.';
  }
}
