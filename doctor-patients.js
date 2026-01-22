// ========================================
// DOCTOR PATIENTS - PATIENT MANAGEMENT (SUPABASE VERSION)
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializePatients();
    });
}

let currentPatient = null;
let allPatients = [];

async function initializePatients() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;

    // Load statistics
    await loadStatistics();

    // Load patients list
    await loadPatientsList();

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closePatientModalBtn').addEventListener('click', closeModal);
    document.getElementById('searchInput').addEventListener('input', filterPatients);
    document.getElementById('filterPeriod').addEventListener('change', filterPatients);

    // Close modal when clicking outside
    document.getElementById('patientModal').addEventListener('click', (e) => {
        if (e.target.id === 'patientModal') {
            closeModal();
        }
    });
}

async function loadStatistics() {
    const patients = await getPatients(session.doctorId);
    const appointments = await getAppointments(session.doctorId);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayStr = today.toISOString().split('T')[0];

    // Total patients
    const totalPatients = patients.length;

    // New patients this month
    const newThisMonth = patients.filter(p => {
        if (!p.lastVisit) return false;
        const visitDate = new Date(p.lastVisit);
        return visitDate >= startOfMonth;
    }).length;

    // Upcoming appointments
    const upcomingAppointments = appointments.filter(a => {
        return a.date >= todayStr && a.status !== 'cancelled';
    }).length;

    // Consultations this month
    const consultationsThisMonth = appointments.filter(a => {
        const apptDate = new Date(a.date);
        return apptDate >= startOfMonth && a.status === 'confirmed';
    }).length;

    document.getElementById('statTotal').textContent = totalPatients;
    document.getElementById('statNewMonth').textContent = newThisMonth;
    document.getElementById('statUpcoming').textContent = upcomingAppointments;
    document.getElementById('statConsultations').textContent = consultationsThisMonth;
}

async function loadPatientsList() {
    allPatients = await getPatients(session.doctorId);
    filterPatients();
}

function filterPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const periodFilter = document.getElementById('filterPeriod').value;

    const today = new Date();
    let startDate;

    switch (periodFilter) {
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        default:
            startDate = null;
    }

    const filtered = allPatients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm));

        let matchesPeriod = true;
        if (startDate && patient.lastVisit) {
            const visitDate = new Date(patient.lastVisit);
            matchesPeriod = visitDate >= startDate;
        } else if (startDate && !patient.lastVisit) {
            matchesPeriod = false;
        }

        return matchesSearch && matchesPeriod;
    });

    displayPatientsList(filtered);
}

function displayPatientsList(patients) {
    const tableBody = document.getElementById('patientsTable');

    if (patients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun patient trouvé</td></tr>';
        return;
    }

    // Sort by last visit (most recent first)
    patients.sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return new Date(b.lastVisit) - new Date(a.lastVisit);
    });

    tableBody.innerHTML = '';
    patients.forEach(patient => {
        const row = createPatientRow(patient);
        tableBody.appendChild(row);
    });
}

function createPatientRow(patient) {
    const row = document.createElement('tr');

    const lastVisit = patient.lastVisit ?
        new Date(patient.lastVisit).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : 'Jamais';

    const nextAppointment = patient.nextAppointment ?
        new Date(patient.nextAppointment).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : '-';

    row.innerHTML = `
        <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="patient-avatar" style="width: 40px; height: 40px; font-size: var(--font-size-base);">
                    ${patient.name.charAt(0).toUpperCase()}
                </div>
                <strong>${patient.name}</strong>
            </div>
        </td>
        <td>${patient.age || '-'}</td>
        <td>${patient.phone}</td>
        <td>${patient.email || '-'}</td>
        <td>${lastVisit}</td>
        <td>${nextAppointment}</td>
        <td>
            <div class="admin-table-actions">
                <button class="admin-action-btn admin-action-view" onclick="viewPatientDetails('${patient.id}')" title="Voir détails">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <a href="doctor-agenda.html" class="admin-action-btn admin-action-edit" title="Nouveau RDV">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" />
                    </svg>
                </a>
            </div>
        </td>
    `;

    return row;
}

async function viewPatientDetails(patientId) {
    const patient = allPatients.find(p => p.id === patientId);

    if (!patient) return;

    currentPatient = patient;

    // Fill patient info
    document.getElementById('patientName').textContent = patient.name;
    document.getElementById('patientAge').textContent = patient.age ? `${patient.age} ans` : 'Non renseigné';
    document.getElementById('patientPhone').textContent = patient.phone;
    document.getElementById('patientEmail').textContent = patient.email || 'Non renseigné';

    // Load consultation history
    await loadConsultationHistory(patient);

    // Load upcoming appointments
    await loadUpcomingAppointments(patient);

    // Show modal
    document.getElementById('patientModal').classList.add('active');
}

async function loadConsultationHistory(patient) {
    const appointments = await getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];

    // Get past confirmed appointments for this patient
    const history = appointments.filter(a => {
        return a.patientName === patient.name &&
            a.status === 'confirmed' &&
            a.date < today;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('consultationHistory');

    if (history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Aucune consultation passée</p>';
        return;
    }

    let tableHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Durée</th>
                </tr>
            </thead>
            <tbody>
    `;

    history.forEach(appt => {
        const formattedDate = new Date(appt.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        tableHTML += `
            <tr>
                <td><strong>${formattedDate}</strong></td>
                <td>${appt.type}</td>
                <td>${appt.reason}</td>
                <td>${appt.duration} min</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

async function loadUpcomingAppointments(patient) {
    const appointments = await getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];

    // Get future appointments for this patient
    const upcoming = appointments.filter(a => {
        return a.patientName === patient.name &&
            a.date >= today &&
            a.status !== 'cancelled';
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById('upcomingAppointments');

    if (upcoming.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Aucun rendez-vous à venir</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

    upcoming.forEach(appt => {
        const formattedDate = new Date(appt.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const statusClass = appt.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
        const statusLabel = appt.status === 'confirmed' ? 'Confirmé' : 'En attente';

        html += `
            <div style="padding: 1rem; background: var(--gray-50); border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-base); margin-bottom: 0.25rem;">
                            ${formattedDate} à ${appt.time}
                        </div>
                        <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                            ${appt.type} • ${appt.duration} min
                        </div>
                    </div>
                    <span class="admin-status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                    Motif: ${appt.reason}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function closeModal() {
    document.getElementById('patientModal').classList.remove('active');
    currentPatient = null;
}

console.log('👥 Doctor patients initialized (Supabase)');
