// ========================================
// EPHARMA - HEALTH CENTERS
// ========================================

// === HEALTH CENTERS DATA - NIAMEY, NIGER ===
const healthCenters = [
    {
        id: 1,
        name: "Hôpital National de Niamey",
        type: "hospital",
        category: "public",
        address: "Avenue de l'Indépendance, Niamey",
        lat: 13.5137,
        lng: 2.1098,
        distance: 0.3,
        phone: "(+227) 20 72 22 53",
        email: "honani@intnet.ne",
        services: ["Urgences 24/7", "Chirurgie", "Cardiologie", "Maternité", "Radiologie"],
        specialties: ["Cardiologie", "Chirurgie générale", "Oncologie", "Traumatologie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.2,
        reviewsCount: 523
    },
    {
        id: 2,
        name: "Hôpital National de Lamordé (CHU)",
        type: "hospital",
        category: "public",
        address: "Rue de la Libération, Niamey",
        lat: 13.5089,
        lng: 2.1234,
        distance: 0.8,
        phone: "(+227) 20 73 47 27",
        email: "hopnala@intnet.ne",
        services: ["Urgences 24/7", "Maternité", "Pédiatrie", "Néonatologie"],
        specialties: ["Obstétrique", "Gynécologie", "Pédiatrie", "Néonatologie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.3,
        reviewsCount: 412
    },
    {
        id: 3,
        name: "Hôpital Général de Référence",
        type: "hospital",
        category: "public",
        address: "Quartier Tchangarey, Niamey",
        lat: 13.5245,
        lng: 2.0985,
        distance: 1.2,
        phone: "(+227) 81 32 32 96",
        email: "contact@hgr-niamey.ne",
        services: ["Urgences 24/7", "Chirurgie", "Réanimation", "Laboratoire"],
        specialties: ["Urgences", "Réanimation", "Chirurgie"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.1,
        reviewsCount: 389
    },
    {
        id: 4,
        name: "Polyclinique Iran",
        type: "clinic",
        category: "private",
        address: "Rue YN-27, Niamey",
        lat: 13.5198,
        lng: 2.1156,
        distance: 0.6,
        phone: "(+227) 20 72 50 84",
        email: "contact@polyclinique-iran.ne",
        services: ["Consultations", "Chirurgie", "Imagerie médicale", "Analyses"],
        specialties: ["Chirurgie générale", "Radiologie", "Médecine interne"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.5,
        reviewsCount: 267
    },
    {
        id: 5,
        name: "Polyclinique Lahiya",
        type: "clinic",
        category: "private",
        address: "Niamey",
        lat: 13.5067,
        lng: 2.1189,
        distance: 0.9,
        phone: "(+227) 20 74 09 68",
        email: "lahiya@intnet.ne",
        services: ["Consultations", "Analyses", "Échographie", "Kinésithérapie"],
        specialties: ["Médecine générale", "Échographie", "Kinésithérapie"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.4,
        reviewsCount: 198
    },
    {
        id: 6,
        name: "Clinique Gamkalley",
        type: "clinic",
        category: "private",
        address: "Rue Hali Koda, Niamey",
        lat: 13.5118,
        lng: 2.1436,
        distance: 1.5,
        phone: "(+227) 20 73 20 33",
        email: "gamkalleyco@gmail.com",
        services: ["Urgences", "Consultations", "Hospitalisation", "Laboratoire"],
        specialties: ["Médecine générale", "Chirurgie", "Urgences"],
        hasEmergency: true,
        hasParking: true,
        rating: 4.6,
        reviewsCount: 312
    },
    {
        id: 7,
        name: "Clinique Jean Kaba",
        type: "clinic",
        category: "private",
        address: "Rue du Président Henrich Lubke, Gaweye, Niamey",
        lat: 13.5334,
        lng: 2.0976,
        distance: 1.8,
        phone: "(+227) 20 73 21 08",
        email: "contact@clinique-kaba.com",
        services: ["Consultations", "Chirurgie", "Laboratoire", "Radiologie"],
        specialties: ["Chirurgie", "Médecine générale", "Radiologie"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.7,
        reviewsCount: 245
    },
    {
        id: 8,
        name: "Clinique Bani Koubey",
        type: "medical-center",
        category: "private",
        address: "Boulevard Tanimoune, Niamey",
        lat: 13.5156,
        lng: 2.1089,
        distance: 0.5,
        phone: "(+227) 20 32 05 16",
        email: "contact@banikoubey.com",
        services: ["Diabétologie", "Pédiatrie", "Consultations", "Analyses"],
        specialties: ["Diabétologie", "Pédiatrie", "Médecine générale"],
        hasEmergency: false,
        hasParking: false,
        rating: 4.5,
        reviewsCount: 187
    },
    {
        id: 9,
        name: "Clinique du Plateau",
        type: "clinic",
        category: "private",
        address: "Quartier Plateau, Niamey",
        lat: 13.5289,
        lng: 2.1123,
        distance: 1.0,
        phone: "(+227) 20 75 34 72",
        email: "contact@clinique-plateau.ne",
        services: ["Consultations", "Chirurgie", "Maternité", "Imagerie"],
        specialties: ["Obstétrique", "Chirurgie", "Médecine générale"],
        hasEmergency: false,
        hasParking: true,
        rating: 4.6,
        reviewsCount: 223
    },
    {
        id: 10,
        name: "Centre Médical Al-Fayçal",
        type: "medical-center",
        category: "private",
        address: "Niamey",
        lat: 13.5178,
        lng: 2.1267,
        distance: 0.7,
        phone: "(+227) 20 73 44 20",
        email: "contact@alfaycal.ne",
        services: ["Consultations", "Analyses", "Radiologie", "Échographie"],
        specialties: ["Médecine générale", "Radiologie", "Analyses médicales"],
        hasEmergency: false,
        hasParking: false,
        rating: 4.3,
        reviewsCount: 156
    }
];

// === MAP INITIALIZATION ===
let map;
let markers = [];
let currentFilter = 'all';

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

console.log('🏥 Health Centers page initialized - NIAMEY, NIGER');
