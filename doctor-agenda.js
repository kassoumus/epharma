// ========================================
// DOCTOR AGENDA - APPOINTMENT MANAGEMENT
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAgenda();
    });
}

let currentDate = new Date();
let editingAppointmentId = null;

function initializeAgenda() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;

    // Load statistics
    loadStatistics();

    // Load calendar
    renderCalendar();

    // Load appointments list
    loadAppointmentsList();

    // Load patients for dropdown
    loadPatientsDropdown();

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('newAppointmentBtn').addEventListener('click', openNewAppointmentModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('appointmentForm').addEventListener('submit', saveAppointment);
    document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
    document.getElementById('searchInput').addEventListener('input', filterAppointments);
    document.getElementById('filterStatus').addEventListener('change', filterAppointments);
    document.getElementById('patientSelect').addEventListener('change', toggleNewPatientFields);

    // Close modal when clicking outside
    document.getElementById('appointmentModal').addEventListener('click', (e) => {
        if (e.target.id === 'appointmentModal') {
            closeModal();
        }
    });
}

function loadStatistics() {
    const appointments = getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];

    // Get week range
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    // Get month range
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const todayCount = appointments.filter(a => a.date === today && a.status !== 'cancelled').length;
    const weekCount = appointments.filter(a => {
        const date = new Date(a.date);
        return date >= startOfWeek && date <= endOfWeek && a.status !== 'cancelled';
    }).length;
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const monthCount = appointments.filter(a => {
        const date = new Date(a.date);
        return date >= startOfMonth && date <= endOfMonth && a.status !== 'cancelled';
    }).length;

    document.getElementById('statToday').textContent = todayCount;
    document.getElementById('statWeek').textContent = weekCount;
    document.getElementById('statPending').textContent = pendingCount;
    document.getElementById('statMonth').textContent = monthCount;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const appointments = getAppointments(session.doctorId);

    let calendarHTML = '<div class="calendar-header">';
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-cell empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        calendarHTML += `
            <div class="calendar-cell ${isToday ? 'today' : ''}" data-date="${dateStr}">
                <div class="calendar-date">${day}</div>
                ${dayAppointments.length > 0 ? `
                    <div class="calendar-appointments">
                        <div class="calendar-appointment-count">${dayAppointments.length} RDV</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calendarHTML += '</div>';
    document.getElementById('calendar').innerHTML = calendarHTML;

    // Add click listeners to calendar cells
    document.querySelectorAll('.calendar-cell:not(.empty)').forEach(cell => {
        cell.addEventListener('click', (e) => {
            const date = cell.dataset.date;
            if (date) {
                openNewAppointmentModal(date);
            }
        });
    });
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
    loadStatistics();
}

function loadAppointmentsList() {
    const appointments = getAppointments(session.doctorId);
    const tableBody = document.getElementById('appointmentsTable');

    // Sort by date and time
    appointments.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun rendez-vous</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    appointments.forEach(appointment => {
        const row = createAppointmentRow(appointment);
        tableBody.appendChild(row);
    });
}

function createAppointmentRow(appointment) {
    const row = document.createElement('tr');

    const statusClass = {
        'confirmed': 'status-confirmed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
    }[appointment.status] || 'status-pending';

    const statusLabel = {
        'confirmed': 'Confirmé',
        'pending': 'En attente',
        'cancelled': 'Annulé'
    }[appointment.status] || 'En attente';

    const formattedDate = new Date(appointment.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    row.innerHTML = `
        <td><strong>${formattedDate}</strong></td>
        <td><strong>${appointment.time}</strong></td>
        <td>
            <div>${appointment.patientName}</div>
            <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${appointment.phone}</div>
        </td>
        <td>${appointment.type}</td>
        <td>${appointment.reason}</td>
        <td><span class="admin-status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
            <div class="admin-table-actions">
                ${appointment.status === 'pending' ? `
                    <button class="admin-action-btn admin-action-confirm" onclick="confirmAppointment(${appointment.id})" title="Confirmer">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                ` : ''}
                ${appointment.status !== 'cancelled' ? `
                    <button class="admin-action-btn admin-action-edit" onclick="editAppointment(${appointment.id})" title="Modifier">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="admin-action-btn admin-action-delete" onclick="cancelAppointment(${appointment.id})" title="Annuler">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </td>
    `;

    return row;
}

function filterAppointments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const appointments = getAppointments(session.doctorId);

    const filtered = appointments.filter(appointment => {
        const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm) ||
            appointment.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const tableBody = document.getElementById('appointmentsTable');
    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun rendez-vous trouvé</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    filtered.forEach(appointment => {
        const row = createAppointmentRow(appointment);
        tableBody.appendChild(row);
    });
}

function loadPatientsDropdown() {
    const patients = getPatients(session.doctorId);
    const select = document.getElementById('patientSelect');

    // Clear existing options except first two
    while (select.options.length > 2) {
        select.remove(2);
    }

    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.name;
        select.appendChild(option);
    });
}

function toggleNewPatientFields() {
    const select = document.getElementById('patientSelect');
    const newPatientFields = document.getElementById('newPatientFields');

    if (select.value === 'new') {
        newPatientFields.style.display = 'block';
        document.getElementById('newPatientName').required = true;
        document.getElementById('newPatientPhone').required = true;
    } else {
        newPatientFields.style.display = 'none';
        document.getElementById('newPatientName').required = false;
        document.getElementById('newPatientPhone').required = false;
    }
}

function openNewAppointmentModal(date = null) {
    editingAppointmentId = null;
    document.getElementById('modalTitle').textContent = 'Nouveau rendez-vous';
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentId').value = '';

    if (date) {
        document.getElementById('appointmentDate').value = date;
    } else {
        document.getElementById('appointmentDate').value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('appointmentTime').value = '09:00';
    document.getElementById('appointmentDuration').value = '30';
    toggleNewPatientFields();

    document.getElementById('appointmentModal').classList.add('active');
}

function editAppointment(id) {
    const appointments = getAppointments(session.doctorId);
    const appointment = appointments.find(a => a.id === id);

    if (!appointment) return;

    editingAppointmentId = id;
    document.getElementById('modalTitle').textContent = 'Modifier le rendez-vous';
    document.getElementById('appointmentId').value = id;

    // Find patient
    const patients = getPatients(session.doctorId);
    const patient = patients.find(p => p.name === appointment.patientName);

    if (patient) {
        document.getElementById('patientSelect').value = patient.id;
    } else {
        document.getElementById('patientSelect').value = 'new';
        document.getElementById('newPatientName').value = appointment.patientName;
        document.getElementById('newPatientPhone').value = appointment.phone;
    }

    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('appointmentDuration').value = appointment.duration;
    document.getElementById('appointmentReason').value = appointment.reason;
    document.getElementById('appointmentNotes').value = appointment.notes || '';

    toggleNewPatientFields();
    document.getElementById('appointmentModal').classList.add('active');
}

function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
    editingAppointmentId = null;
}

function saveAppointment(e) {
    e.preventDefault();

    const patientSelect = document.getElementById('patientSelect').value;
    let patientName, patientPhone, patientEmail;

    if (patientSelect === 'new') {
        patientName = document.getElementById('newPatientName').value;
        patientPhone = document.getElementById('newPatientPhone').value;
        patientEmail = document.getElementById('newPatientEmail').value;

        // Add new patient
        const patients = getPatients(session.doctorId);
        const newPatient = {
            id: Date.now(),
            name: patientName,
            phone: patientPhone,
            email: patientEmail,
            age: null,
            lastVisit: document.getElementById('appointmentDate').value,
            nextAppointment: document.getElementById('appointmentDate').value
        };
        patients.push(newPatient);
        savePatients(session.doctorId, patients);
    } else {
        const patients = getPatients(session.doctorId);
        const patient = patients.find(p => p.id == patientSelect);
        if (patient) {
            patientName = patient.name;
            patientPhone = patient.phone;
            patientEmail = patient.email;
        }
    }

    const appointmentData = {
        id: editingAppointmentId || Date.now(),
        patientName: patientName,
        phone: patientPhone,
        email: patientEmail,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        type: document.getElementById('appointmentType').value,
        duration: parseInt(document.getElementById('appointmentDuration').value),
        reason: document.getElementById('appointmentReason').value,
        notes: document.getElementById('appointmentNotes').value,
        status: editingAppointmentId ?
            getAppointments(session.doctorId).find(a => a.id === editingAppointmentId).status :
            'pending'
    };

    const appointments = getAppointments(session.doctorId);

    if (editingAppointmentId) {
        const index = appointments.findIndex(a => a.id === editingAppointmentId);
        if (index !== -1) {
            appointments[index] = appointmentData;
        }
    } else {
        appointments.push(appointmentData);
    }

    saveAppointments(session.doctorId, appointments);

    closeModal();
    loadStatistics();
    renderCalendar();
    loadAppointmentsList();
    loadPatientsDropdown();

    showToast(editingAppointmentId ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès', 'success');
}

function confirmAppointment(id) {
    updateAppointmentStatus(id, 'confirmed');
    loadStatistics();
    renderCalendar();
    loadAppointmentsList();
    showToast('Rendez-vous confirmé', 'success');
}

function cancelAppointment(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        updateAppointmentStatus(id, 'cancelled');
        loadStatistics();
        renderCalendar();
        loadAppointmentsList();
        showToast('Rendez-vous annulé', 'info');
    }
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--primary-600)'};
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('📅 Doctor agenda initialized');
