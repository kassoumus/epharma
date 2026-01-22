// ========================================
// DOCTOR DASHBOARD (SUPABASE VERSION)
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDashboard();
    });
}

async function initializeDashboard() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;
    document.getElementById('welcomeName').textContent = session.doctorName;

    // Load statistics
    await loadStatistics();

    // Load today's appointments
    await loadTodayAppointments();

    // Load alerts
    await loadAlerts();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function loadStatistics() {
    const stats = await getStatistics(session.doctorId);

    document.getElementById('statTodayAppointments').textContent = stats.todayAppointments;
    document.getElementById('statTotalPatients').textContent = stats.totalPatients;
    document.getElementById('statRating').textContent = stats.averageRating;
    document.getElementById('statPending').textContent = stats.pendingAppointments;
}

async function loadTodayAppointments() {
    const appointments = await getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    const container = document.getElementById('todayAppointments');
    container.innerHTML = '';

    if (todayAppointments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Aucun rendez-vous aujourd\'hui</p>';
        return;
    }

    todayAppointments.forEach(appointment => {
        const card = createAppointmentCard(appointment);
        container.appendChild(card);
    });
}

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';

    const statusClass = appointment.status === 'confirmed' ? 'status-confirmed' :
        appointment.status === 'pending' ? 'status-pending' : 'status-cancelled';
    const statusLabel = appointment.status === 'confirmed' ? 'Confirmé' :
        appointment.status === 'pending' ? 'En attente' : 'Annulé';

    card.innerHTML = `
        <div class="appointment-card-header">
            <div>
                <h4>${appointment.patientName}</h4>
                <p>${appointment.time} • ${appointment.duration} min</p>
            </div>
            <span class="admin-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="appointment-card-body">
            <div class="appointment-detail">
                <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px; color: var(--text-secondary);">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 3V5M17 3V5M3 9H21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${appointment.type}</span>
            </div>
            <div class="appointment-detail">
                <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px; color: var(--text-secondary);">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${appointment.reason}</span>
            </div>
        </div>
        ${appointment.status === 'pending' ? `
        <div class="appointment-card-actions">
            <button class="btn-confirm" onclick="confirmAppointment('${appointment.id}')">Confirmer</button>
            <button class="btn-cancel" onclick="cancelAppointment('${appointment.id}')">Annuler</button>
        </div>
        ` : ''}
    `;

    return card;
}

async function confirmAppointment(appointmentId) {
    const result = await updateAppointmentStatus(appointmentId, 'confirmed');
    if (result.success) {
        await loadTodayAppointments();
        await loadStatistics();
        showToast('Rendez-vous confirmé', 'success');
    } else {
        showToast('Erreur lors de la confirmation', 'error');
    }
}

async function cancelAppointment(appointmentId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        return;
    }

    const result = await updateAppointmentStatus(appointmentId, 'cancelled');
    if (result.success) {
        await loadTodayAppointments();
        await loadStatistics();
        showToast('Rendez-vous annulé', 'success');
    } else {
        showToast('Erreur lors de l\'annulation', 'error');
    }
}

async function loadAlerts() {
    const appointments = await getAppointments(session.doctorId);
    const today = new Date().toISOString().split('T')[0];

    const pendingAppointments = appointments.filter(a =>
        a.status === 'pending' && a.date >= today
    );

    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';

    if (pendingAppointments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">Aucune alerte</p>';
        return;
    }

    pendingAppointments.slice(0, 5).forEach(appointment => {
        const alert = document.createElement('div');
        alert.className = 'alert-item';
        alert.innerHTML = `
            <div class="alert-icon">
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <div class="alert-content">
                <strong>Rendez-vous en attente</strong>
                <p>${appointment.patientName} - ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.time}</p>
            </div>
        `;
        container.appendChild(alert);
    });
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

console.log('📊 Doctor dashboard initialized (Supabase)');
