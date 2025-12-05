// ========================================
// EPHARMA - HEALTH CENTERS
// ========================================

// === HEALTH CENTERS DATA ===
const healthCenters = [
    {
        id: 1,
        name: "Hôpital Saint-Louis",
        type: "hospital",
        category: "public",
        address: "1 Avenue Claude Vellefaux, 75010 Paris",
        lat: 48.8717,
        lng: 2.3698,
        distance: 0.8,
        phone: "01 42 49 49 49",
        email: "contact@hopital-stlouis.fr",
        services: ["Urgences 24/7", "Maternité", "Chirurgie", "Radiologie", "Cardiologie"],
        specialties: ["Cardiologie", "Pédiatrie", "Oncologie", "Dermatologie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.3,
        reviewsCount: 892
    },
    {
        id: 2,
        name: "Hôpital Bichat-Claude Bernard",
        type: "hospital",
        category: "public",
        address: "46 Rue Henri Huchard, 75018 Paris",
        lat: 48.8978,
        lng: 2.3307,
        distance: 1.2,
        phone: "01 40 25 80 80",
        email: "contact@hopital-bichat.fr",
        services: ["Urgences 24/7", "Réanimation", "Chirurgie", "Laboratoire"],
        specialties: ["Urgences", "Réanimation", "Infectiologie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.1,
        reviewsCount: 654
    },
    {
        id: 3,
        name: "Clinique du Parc Monceau",
        type: "clinic",
        category: "private",
        address: "21 Rue de Chazelles, 75017 Paris",
        lat: 48.8814,
        lng: 2.3089,
        distance: 0.5,
        phone: "01 56 21 21 21",
        email: "contact@clinique-monceau.fr",
        services: ["Consultations", "Chirurgie ambulatoire", "Imagerie médicale"],
        specialties: ["Chirurgie esthétique", "Ophtalmologie", "ORL"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.7,
        reviewsCount: 234
    },
    {
        id: 4,
        name: "Centre Médical Europe",
        type: "medical-center",
        category: "private",
        address: "55 Rue Saint-Lazare, 75009 Paris",
        lat: 48.8762,
        lng: 2.3296,
        distance: 0.3,
        phone: "01 48 74 75 76",
        email: "contact@centre-europe.fr",
        services: ["Consultations", "Analyses", "Radiologie", "Kinésithérapie"],
        specialties: ["Médecine générale", "Radiologie", "Kinésithérapie"],
        hasEmergency: false,
        hasParking: false,
        rating: 4.5,
        reviewsCount: 187
    },
    {
        id: 5,
        name: "Hôpital Lariboisière",
        type: "hospital",
        category: "public",
        address: "2 Rue Ambroise Paré, 75010 Paris",
        lat: 48.8811,
        lng: 2.3525,
        distance: 0.9,
        phone: "01 49 95 65 65",
        email: "contact@hopital-lariboisiere.fr",
        services: ["Urgences 24/7", "Maternité", "Neurologie", "Cardiologie"],
        specialties: ["Neurologie", "Cardiologie", "Urgences"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.2,
        reviewsCount: 756
    },
    {
        id: 6,
        name: "Clinique Sainte-Isabelle",
        type: "clinic",
        category: "private",
        address: "77 Rue de la Pompe, 75016 Paris",
        lat: 48.8654,
        lng: 2.2794,
        distance: 1.5,
        phone: "01 45 53 33 33",
        email: "contact@clinique-isabelle.fr",
        services: ["Maternité", "Pédiatrie", "Chirurgie"],
        specialties: ["Obstétrique", "Pédiatrie", "Néonatologie"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.8,
        reviewsCount: 421
    },
    {
        id: 7,
        name: "Centre de Santé Montmartre",
        type: "medical-center",
        category: "public",
        address: "12 Rue Ramey, 75018 Paris",
        lat: 48.8897,
        lng: 2.3456,
        distance: 0.6,
        phone: "01 42 54 32 10",
        email: "contact@cs-montmartre.fr",
        services: ["Consultations", "Dentaire", "Ophtalmologie"],
        specialties: ["Médecine générale", "Dentaire", "Ophtalmologie"],
        hasEmergency: false,
        hasParking: false,
        rating: 4.4,
        reviewsCount: 156
    },
    {
        id: 8,
        name: "Hôpital Cochin",
        type: "hospital",
        category: "public",
        address: "27 Rue du Faubourg Saint-Jacques, 75014 Paris",
        lat: 48.8388,
        lng: 2.3394,
        distance: 2.1,
        phone: "01 58 41 41 41",
        email: "contact@hopital-cochin.fr",
        services: ["Urgences 24/7", "Maternité", "Cardiologie", "Orthopédie"],
        specialties: ["Cardiologie", "Maternité", "Orthopédie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.3,
        reviewsCount: 983
    },
    {
        id: 9,
        name: "Clinique du Sport Paris V",
        type: "clinic",
        category: "private",
        address: "36 Boulevard Saint-Marcel, 75005 Paris",
        lat: 48.8389,
        lng: 2.3567,
        distance: 1.8,
        phone: "01 43 31 77 77",
        email: "contact@clinique-sport.fr",
        services: ["Traumatologie", "Rééducation", "Chirurgie orthopédique"],
        specialties: ["Médecine du sport", "Orthopédie", "Rééducation"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.6,
        reviewsCount: 298
    },
    {
        id: 10,
        name: "Centre Médical Bastille",
        type: "medical-center",
        category: "private",
        address: "15 Rue de la Roquette, 75011 Paris",
        lat: 48.8556,
        lng: 2.3722,
        distance: 0.4,
        phone: "01 43 57 89 90",
        email: "contact@cm-bastille.fr",
        services: ["Consultations", "Analyses", "Échographie"],
        specialties: ["Médecine générale", "Gynécologie", "Échographie"],
        hasEmergency: false,
        hasParking: false,
        rating: 4.5,
        reviewsCount: 203
    }
];

// === MAP INITIALIZATION ===
let map;
let markers = [];
let currentFilter = 'all';

// Initialize map
function initMap() {
    map = L.map('map').setView([48.8656, 2.3698], 13);

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
    initMap();
    renderHealthCenters();

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

console.log('🏥 Health Centers page initialized');
