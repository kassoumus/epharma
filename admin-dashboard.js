// ========================================
// ADMIN DASHBOARD
// ========================================

// Check authentication
const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    // Initialize dashboard
    document.addEventListener('DOMContentLoaded', () => {
        initializeDashboard();
    });
}

function initializeDashboard() {
    // Update pharmacy info
    document.getElementById('pharmacyName').textContent = session.pharmacyName;
    document.getElementById('pharmacyEmail').textContent = session.email;

    // Load statistics
    loadStatistics();

    // Load reservations
    loadReservations();

    // Load alerts
    loadAlerts();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Setup sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
}

function loadStatistics() {
    const stats = getStatistics(session.pharmacyId);

    document.getElementById('statReservations').textContent = stats.reservationsToday;
    document.getElementById('statProducts').textContent = stats.totalProducts;
    document.getElementById('statLowStock').textContent = stats.lowStockProducts;
    document.getElementById('statRating').textContent = stats.averageRating;
    document.getElementById('statViews').textContent = stats.weeklyViews;
}

function loadReservations() {
    const reservations = getReservations(session.pharmacyId);
    const recentReservations = reservations.slice(0, 5);

    const tableBody = document.getElementById('reservationsTable');
    tableBody.innerHTML = '';

    if (recentReservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucune réservation</td></tr>';
        return;
    }

    recentReservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${reservation.customerName}</strong></td>
            <td>${reservation.phone}</td>
            <td>${reservation.products}</td>
            <td>${reservation.time}</td>
            <td><span class="admin-status-badge status-${reservation.status}">${getStatusLabel(reservation.status)}</span></td>
            <td>
                <div class="admin-table-actions">
                    ${reservation.status === 'pending' ? `
                        <button class="admin-action-btn admin-action-confirm" onclick="confirmReservation(${reservation.id})">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="admin-action-btn admin-action-delete" onclick="cancelReservation(${reservation.id})">
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
    const products = getProducts(session.pharmacyId);
    const reservations = getReservations(session.pharmacyId);
    const lowStockProducts = products.filter(p => p.stock <= p.threshold);
    const pendingReservations = reservations.filter(r => r.status === 'pending');

    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    // Low stock alert
    if (lowStockProducts.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'admin-alert admin-alert-warning';
        alert.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div>
                <div class="admin-alert-title">Stock bas</div>
                <div class="admin-alert-message">${lowStockProducts.length} produit(s) en stock bas. <a href="admin-stock.html">Gérer le stock →</a></div>
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // Pending reservations alert
    if (pendingReservations.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'admin-alert admin-alert-info';
        alert.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div>
                <div class="admin-alert-title">Réservations en attente</div>
                <div class="admin-alert-message">${pendingReservations.length} réservation(s) en attente de confirmation.</div>
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // No alerts
    if (lowStockProducts.length === 0 && pendingReservations.length === 0) {
        alertsContainer.innerHTML = `
            <div class="admin-alert admin-alert-success">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div>
                    <div class="admin-alert-title">Tout va bien !</div>
                    <div class="admin-alert-message">Aucune alerte pour le moment.</div>
                </div>
            </div>
        `;
    }
}

function getStatusLabel(status) {
    const labels = {
        pending: 'En attente',
        confirmed: 'Confirmée',
        completed: 'Récupérée',
        cancelled: 'Annulée'
    };
    return labels[status] || status;
}

function confirmReservation(id) {
    updateReservationStatus(id, 'confirmed');
    loadReservations();
    loadAlerts();
}

function cancelReservation(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        updateReservationStatus(id, 'cancelled');
        loadReservations();
        loadAlerts();
    }
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

function toggleSidebar() {
    document.getElementById('adminSidebar').classList.toggle('collapsed');
}

console.log('📊 Dashboard initialized');
