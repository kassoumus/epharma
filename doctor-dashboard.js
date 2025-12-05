// ========================================
// DOCTOR DASHBOARD
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDashboard();
    });
}

function initializeDashboard() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;
    document.getElementById('welcomeName').textContent = session.doctorName;

    // Load statistics
    loadStatistics();

    // Load today's appointments
    loadTodayAppointments();

    // Load alerts
    loadAlerts();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function loadStatistics() {
    const stats = getStatistics(session.doctorId);

    document.getElementById('statTodayAppointments').textContent = stats.todayAppointments;
    document.getElementById('statTotalPatients').textContent = stats.totalPatients;
    document.getElementById('statRating').textContent = stats.averageRating;
    document.getElementById('statPending').textContent = stats.pendingAppointments;
}

function loadTodayAppointments() {
    const appointments = getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    const tableBody = document.getElementById('appointmentsTable');
    tableBody.innerHTML = '';

    if (todayAppointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun rendez-vous aujourd\'hui</td></tr>';
        return;
    }

    todayAppointments.forEach(appointment => {
        const row = document.createElement('tr');
        const statusClass = appointment.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
        const statusLabel = appointment.status === 'confirmed' ? 'Confirmé' : 'En attente';

        row.innerHTML = `
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
                        <button class="admin-action-btn admin-action-confirm" onclick="confirmAppointment(${appointment.id})">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="admin-action-btn admin-action-delete" onclick="cancelAppointment(${appointment.id})">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadAlerts() {
    const appointments = getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const todayAppointments = appointments.filter(a => a.date === today);

    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    // Pending appointments alert
    if (pendingAppointments.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'admin-alert admin-alert-warning';
        alert.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div>
                <strong>Rendez-vous en attente</strong>
                <p>Vous avez ${pendingAppointments.length} rendez-vous en attente de confirmation</p>
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // Today's appointments info
    if (todayAppointments.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'admin-alert admin-alert-info';
        alert.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div>
                <strong>Rendez-vous du jour</strong>
                <p>Vous avez ${todayAppointments.length} rendez-vous programmés aujourd'hui</p>
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // No alerts
    if (pendingAppointments.length === 0 && todayAppointments.length === 0) {
        alertsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Aucune alerte pour le moment</p>';
    }
}

function confirmAppointment(id) {
    updateAppointmentStatus(id, 'confirmed');
    loadTodayAppointments();
    loadStatistics();
    loadAlerts();
}

function cancelAppointment(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        deleteAppointment(id);
        loadTodayAppointments();
        loadStatistics();
        loadAlerts();
    }
}

function updateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentTime').textContent = now.toLocaleDateString('fr-FR', options);
}

console.log('👨‍⚕️ Doctor dashboard initialized');
