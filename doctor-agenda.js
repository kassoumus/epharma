// ========================================
// DOCTOR AGENDA - APPOINTMENT MANAGEMENT (SUPABASE VERSION)
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAgenda();
    });
}

let currentMonth = new Date();
let currentAppointment = null;
let allAppointments = [];

async function initializeAgenda() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;

    // Load data
    await loadStatistics();
    await loadAppointments();

    // Render calendar
    renderCalendar();

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('newAppointmentBtn').addEventListener('click', openNewAppointmentModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('appointmentForm').addEventListener('submit', saveAppointment);
    document.getElementById('searchInput').addEventListener('input', filterAppointments);
    document.getElementById('filterStatus').addEventListener('change', filterAppointments);
    document.getElementById('patientType').addEventListener('change', togglePatientFields);

    // Close modal when clicking outside
    document.getElementById('appointmentModal').addEventListener('click', (e) => {
        if (e.target.id === 'appointmentModal') {
            closeModal();
        }
    });
}

async function loadStatistics() {
    const stats = await getStatistics(session.doctorId);

    document.getElementById('statToday').textContent = stats.todayAppointments;
    document.getElementById('statWeek').textContent = stats.weekAppointments;
    document.getElementById('statPending').textContent = stats.pendingAppointments;
    document.getElementById('statMonth').textContent = stats.weekAppointments; // Simplified
}

async function loadAppointments() {
    allAppointments = await getAppointments(session.doctorId);
    filterAppointments();
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Update month/year display
    document.getElementById('currentMonthYear').textContent =
        currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell empty';
        calendarDays.appendChild(cell);
    }

    // Days of the month
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];

        const cell = document.createElement('div');
        cell.className = 'calendar-cell';

        if (dateStr === todayStr) {
            cell.classList.add('today');
        }

        // Count appointments for this day
        const dayAppointments = allAppointments.filter(a => a.date === dateStr);

        cell.innerHTML = `
            <div class="calendar-date">${day}</div>
            ${dayAppointments.length > 0 ? `
                <div class="calendar-appointments">
                    <div class="calendar-appointment-count">${dayAppointments.length} RDV</div>
                </div>
            ` : ''}
        `;

        cell.addEventListener('click', () => openNewAppointmentModal(dateStr));
        calendarDays.appendChild(cell);
    }
}

function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

function filterAppointments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    let filtered = allAppointments;

    if (searchTerm) {
        filtered = filtered.filter(a =>
            a.patientName.toLowerCase().includes(searchTerm)
        );
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === statusFilter);
    }

    displayAppointmentsList(filtered);
}

function displayAppointmentsList(appointments) {
    const tbody = document.getElementById('appointmentsTable');
    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun rendez-vous</td></tr>';
        return;
    }

    // Sort by date and time
    appointments.sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        return a.time.localeCompare(b.time);
    });

    appointments.forEach(appointment => {
        const row = createAppointmentRow(appointment);
        tbody.appendChild(row);
    });
}

function createAppointmentRow(appointment) {
    const row = document.createElement('tr');

    const formattedDate = new Date(appointment.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const statusClass = appointment.status === 'confirmed' ? 'status-confirmed' :
        appointment.status === 'pending' ? 'status-pending' : 'status-cancelled';
    const statusLabel = appointment.status === 'confirmed' ? 'Confirmé' :
        appointment.status === 'pending' ? 'En attente' : 'Annulé';

    row.innerHTML = `
        <td><strong>${appointment.patientName}</strong></td>
        <td>${formattedDate}</td>
        <td>${appointment.time}</td>
        <td>${appointment.type}</td>
        <td><span class="admin-status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
            <div class="admin-table-actions">
                <button class="admin-action-btn admin-action-edit" onclick="editAppointment('${appointment.id}')" title="Modifier">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                ${appointment.status === 'pending' ? `
                    <button class="admin-action-btn admin-action-view" onclick="confirmAppointmentFromList('${appointment.id}')" title="Confirmer">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="admin-action-btn admin-action-delete" onclick="cancelAppointmentFromList('${appointment.id}')" title="Annuler">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </td>
    `;

    return row;
}

function openNewAppointmentModal(date = null) {
    currentAppointment = null;
    document.getElementById('modalTitle').textContent = 'Nouveau rendez-vous';
    document.getElementById('appointmentForm').reset();

    if (date) {
        document.getElementById('appointmentDate').value = date;
    }

    document.getElementById('appointmentModal').classList.add('active');
}

async function editAppointment(appointmentId) {
    const appointment = allAppointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    currentAppointment = appointment;
    document.getElementById('modalTitle').textContent = 'Modifier le rendez-vous';

    // Fill form
    document.getElementById('patientType').value = 'existing';
    togglePatientFields();

    document.getElementById('patientName').value = appointment.patientName;
    document.getElementById('patientPhone').value = appointment.phone;
    document.getElementById('patientEmail').value = appointment.email || '';
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('appointmentDuration').value = appointment.duration;
    document.getElementById('appointmentReason').value = appointment.reason;
    document.getElementById('appointmentNotes').value = appointment.notes || '';

    document.getElementById('appointmentModal').classList.add('active');
}

function togglePatientFields() {
    const patientType = document.getElementById('patientType').value;
    const existingPatientField = document.getElementById('existingPatientField');
    const newPatientFields = document.getElementById('newPatientFields');

    if (patientType === 'existing') {
        existingPatientField.style.display = 'block';
        newPatientFields.style.display = 'none';
        loadPatientsDropdown();
    } else {
        existingPatientField.style.display = 'none';
        newPatientFields.style.display = 'block';
    }
}

async function loadPatientsDropdown() {
    const patients = await getPatients(session.doctorId);
    const select = document.getElementById('existingPatient');

    select.innerHTML = '<option value="">Sélectionner un patient</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} - ${patient.phone}`;
        option.dataset.phone = patient.phone;
        option.dataset.email = patient.email || '';
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('patientName').value = selectedOption.textContent.split(' - ')[0];
            document.getElementById('patientPhone').value = selectedOption.dataset.phone;
            document.getElementById('patientEmail').value = selectedOption.dataset.email;
        }
    });
}

async function saveAppointment(e) {
    e.preventDefault();

    const patientType = document.getElementById('patientType').value;
    let patientName, patientPhone, patientEmail;

    if (patientType === 'existing') {
        patientName = document.getElementById('patientName').value;
        patientPhone = document.getElementById('patientPhone').value;
        patientEmail = document.getElementById('patientEmail').value;
    } else {
        patientName = document.getElementById('newPatientName').value;
        patientPhone = document.getElementById('newPatientPhone').value;
        patientEmail = document.getElementById('newPatientEmail').value;

        // Create new patient
        await createPatientRecord(session.doctorId, {
            name: patientName,
            phone: patientPhone,
            email: patientEmail,
            lastVisit: document.getElementById('appointmentDate').value
        });
    }

    const appointmentData = {
        patientName: patientName,
        phone: patientPhone,
        email: patientEmail,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        type: document.getElementById('appointmentType').value,
        duration: parseInt(document.getElementById('appointmentDuration').value),
        reason: document.getElementById('appointmentReason').value,
        notes: document.getElementById('appointmentNotes').value,
        status: 'pending'
    };

    let result;
    if (currentAppointment) {
        // Update existing appointment
        result = await updateAppointmentRecord(currentAppointment.id, appointmentData);
    } else {
        // Create new appointment
        result = await createAppointmentRecord(session.doctorId, appointmentData);
    }

    if (result.success) {
        showToast(currentAppointment ? 'Rendez-vous modifié' : 'Rendez-vous créé', 'success');
        closeModal();
        await loadAppointments();
        await loadStatistics();
        renderCalendar();
    } else {
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

async function confirmAppointmentFromList(appointmentId) {
    const result = await updateAppointmentStatus(appointmentId, 'confirmed');
    if (result.success) {
        showToast('Rendez-vous confirmé', 'success');
        await loadAppointments();
        await loadStatistics();
        renderCalendar();
    } else {
        showToast('Erreur lors de la confirmation', 'error');
    }
}

async function cancelAppointmentFromList(appointmentId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        return;
    }

    const result = await updateAppointmentStatus(appointmentId, 'cancelled');
    if (result.success) {
        showToast('Rendez-vous annulé', 'success');
        await loadAppointments();
        await loadStatistics();
        renderCalendar();
    } else {
        showToast('Erreur lors de l\'annulation', 'error');
    }
}

function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
    currentAppointment = null;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    if (type === 'error') toast.classList.add('error');

    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            ${type === 'success' ?
            '<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>' :
            '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>'
        }
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('📅 Doctor agenda initialized (Supabase)');
