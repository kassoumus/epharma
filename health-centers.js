// ========================================
// EPHARMA - HEALTH CENTERS
// ========================================

// === HEALTH CENTERS DATA - NIAMEY, NIGER ===
let healthCenters = [];
let isLoading = false;

// === MAP INITIALIZATION ===
let map;
let markers = [];
let currentFilter = 'all';

// === LOAD HEALTH CENTERS FROM SUPABASE ===
async function loadHealthCenters() {
    if (isLoading) return;

    isLoading = true;
    showLoadingState(true);

    try {
        const data = await window.supabaseAPI.getHealthCenters({
            publicOnly: true // Only show approved and active centers
        });

        // Map Supabase data to UI format
        healthCenters = data.map((center, index) => ({
            id: center.id,
            name: center.name,
            type: mapCenterType(center.type),
            category: center.type === 'hospital' ? 'public' : 'private',
            address: center.address,
            lat: parseFloat(center.latitude) || 13.5137,
            lng: parseFloat(center.longitude) || 2.1098,
            distance: calculateDistance(center.latitude, center.longitude), // Calculate from default location
            phone: center.phone,
            email: center.email || '',
            services: Array.isArray(center.services) ? center.services : [],
            specialties: Array.isArray(center.specialties) ? center.specialties : [],
            hasEmergency: center.has_emergency || false,
            hasParking: true, // Default value
            rating: 4.0 + (Math.random() * 0.8), // Mock rating for now
            reviewsCount: Math.floor(100 + Math.random() * 400)
        }));

        console.log(`✅ ${healthCenters.length} centres de santé chargés depuis Supabase`);

        // Initialize map and render centers
        if (!map) {
            initMap();
        }
        renderHealthCenters();

    } catch (error) {
        console.error('❌ Erreur chargement centres:', error);
        showErrorMessage('Impossible de charger les centres de santé. Veuillez réessayer.');
    } finally {
        isLoading = false;
        showLoadingState(false);
    }
}

// Helper function to map center type from schema to UI
function mapCenterType(schemaType) {
    const typeMapping = {
        'hospital': 'hospital',
        'clinic': 'clinic',
        'community_health_center': 'clinic',
        'specialized_center': 'medical-center',
        'maternity': 'clinic',
        'dispensary': 'clinic'
    };
    return typeMapping[schemaType] || 'clinic';
}

// Helper function to calculate distance (rough estimation)
function calculateDistance(lat, lng) {
    if (!lat || !lng) return 0;

    // Default center: Niamey (13.5137, 2.1098)
    const defaultLat = 13.5137;
    const defaultLng = 2.1098;

    const R = 6371; // Earth's radius in km
    const dLat = (lat - defaultLat) * Math.PI / 180;
    const dLng = (lng - defaultLng) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(defaultLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

// Show/hide loading state
function showLoadingState(show) {
    const container = document.getElementById('healthCentersList');
    if (!container) return;

    if (show) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6B7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px; font-weight: 500;">Chargement des centres de santé...</div>
            </div>
        `;
    }
}

// Show error message
function showErrorMessage(message) {
    const container = document.getElementById('healthCentersList');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #EF4444;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 18px; font-weight: 500; margin-bottom: 12px;">${message}</div>
            <button onclick="loadHealthCenters()" style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Réessayer
            </button>
        </div>
    `;
}


// Initialize map
function initMap() {
    map = L.map('map').setView([13.5137, 2.1098], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers
    addMarkers();
}

function addMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    healthCenters.forEach(center => {
        const marker = L.marker([center.lat, center.lng]).addTo(map);

        marker.bindPopup(`
            <div class="map-popup">
                <strong>${center.name}</strong><br>
                ${center.address}<br>
                ${center.hasEmergency ? '🚨 Urgences 24/7' : ''}
            </div>
        `);

        marker.on('click', () => {
            highlightHealthCenter(center.id);
        });

        markers.push(marker);
    });
}

// === RENDER HEALTH CENTERS ===
function renderHealthCenters() {
    const filtered = filterHealthCenters();
    const container = document.getElementById('healthCentersList');

    document.getElementById('resultsCount').textContent = filtered.length;

    container.innerHTML = filtered.map(center => `
        <div class="pharmacy-card" data-id="${center.id}">
            <div class="pharmacy-header">
                <div class="pharmacy-info">
                    <h3 class="pharmacy-name">${center.name}</h3>
                    <p class="pharmacy-address">${center.address}</p>
                </div>
                <div class="pharmacy-badge ${center.hasEmergency ? 'badge-emergency' : 'badge-normal'}">
                    ${center.hasEmergency ? '🚨 Urgences' : getTypeLabel(center.type)}
                </div>
            </div>
            
            <div class="pharmacy-details">
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${center.distance} km</span>
                </div>
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${center.rating} (${center.reviewsCount} avis)</span>
                </div>
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V19.92C22 20.4832 21.5544 20.9582 20.9922 20.9924C18.9478 21.1388 16.9006 20.7805 15.0275 19.9477C13.2739 19.1731 11.7101 18.0217 10.4543 16.5789C9.19854 15.1361 8.28128 13.4422 7.76712 11.6184C6.93339 9.74319 6.57473 7.69352 6.72028 5.64692C6.75447 5.08481 7.22953 4.63806 7.79275 4.63904H10.7928C11.3549 4.63393 11.8313 5.05152 11.8928 5.60904C11.9478 6.13604 12.0478 6.65704 12.1928 7.16704C12.3478 7.72904 12.1678 8.33104 11.7328 8.71104L10.4628 9.98104C11.5628 11.8151 13.1778 13.4301 15.0128 14.5301L16.2828 13.2601C16.6628 12.8251 17.2648 12.6451 17.8268 12.8001C18.3368 12.9451 18.8578 13.0451 19.3848 13.1001C19.9478 13.1616 20.3678 13.6451 20.3628 14.2101V16.92H22Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${center.phone}</span>
                </div>
            </div>
            
            <div class="pharmacy-services">
                ${center.services.slice(0, 3).map(service => `<span class="service-tag">${service}</span>`).join('')}
            </div>
            
            <div class="pharmacy-actions">
                <button class="pharmacy-btn-secondary" onclick="window.location.href='tel:${center.phone.replace(/\s/g, '')}'">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V19.92C22 20.4832 21.5544 20.9582 20.9922 20.9924C18.9478 21.1388 16.9006 20.7805 15.0275 19.9477C13.2739 19.1731 11.7101 18.0217 10.4543 16.5789C9.19854 15.1361 8.28128 13.4422 7.76712 11.6184C6.93339 9.74319 6.57473 7.69352 6.72028 5.64692C6.75447 5.08481 7.22953 4.63806 7.79275 4.63904H10.7928C11.3549 4.63393 11.8313 5.05152 11.8928 5.60904C11.9478 6.13604 12.0478 6.65704 12.1928 7.16704C12.3478 7.72904 12.1678 8.33104 11.7328 8.71104L10.4628 9.98104C11.5628 11.8151 13.1778 13.4301 15.0128 14.5301L16.2828 13.2601C16.6628 12.8251 17.2648 12.6451 17.8268 12.8001C18.3368 12.9451 18.8578 13.0451 19.3848 13.1001C19.9478 13.1616 20.3678 13.6451 20.3628 14.2101V16.92H22Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Appeler
                </button>
                <button class="pharmacy-btn-primary" onclick="viewHealthCenter(${center.id})">
                    Voir détails
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function getTypeLabel(type) {
    const labels = {
        'hospital': '🏥 Hôpital',
        'clinic': '🏨 Clinique',
        'medical-center': '🏢 Centre médical'
    };
    return labels[type] || type;
}

// === FILTERS ===
function filterHealthCenters() {
    return healthCenters.filter(center => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'hospital') return center.type === 'hospital';
        if (currentFilter === 'clinic') return center.type === 'clinic';
        if (currentFilter === 'emergency') return center.hasEmergency;
        return true;
    });
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    // Load health centers from Supabase
    loadHealthCenters();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderHealthCenters();
        });
    });
});

function viewHealthCenter(id) {
    alert(`Page de détails pour le centre ${id} - À implémenter`);
}

function highlightHealthCenter(id) {
    document.querySelectorAll('.pharmacy-card').forEach(card => {
        card.classList.remove('highlighted');
    });
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

console.log('🏥 Health Centers page initialized with Supabase - NIAMEY, NIGER');

