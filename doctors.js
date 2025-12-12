// ========================================
// EPHARMA - DOCTORS
// ========================================

// === DOCTORS DATA - NIAMEY, NIGER ===
const doctors = [
    {
        id: 1,
        name: "Dr. Amadou Diallo",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "M",
        address: "Quartier Plateau, Niamey",
        lat: 13.5289,
        lng: 2.1123,
        distance: 0.5,
        phone: "(+227) 90 12 34 56",
        email: "dr.diallo@medecine-niamey.ne",
        languages: ["Français", "Haoussa"],
        sector: 1,
        consultationPrice: 5000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Visite à domicile"],
        rating: 4.7,
        reviewsCount: 142,
        experience: 12,
        nextAvailability: "Aujourd'hui 15h00"
    },
    {
        id: 2,
        name: "Dr. Aïcha Moussa",
        specialty: "Pédiatre",
        type: "specialiste",
        gender: "F",
        address: "Avenue de l'Indépendance, Niamey",
        lat: 13.5137,
        lng: 2.1098,
        distance: 0.3,
        phone: "(+227) 91 23 45 67",
        email: "dr.moussa@pediatrie.ne",
        languages: ["Français", "Zarma"],
        sector: 1,
        consultationPrice: 8000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Vaccinations", "Suivi enfant"],
        rating: 4.9,
        reviewsCount: 234,
        experience: 15,
        nextAvailability: "Demain 10h00"
    },
    {
        id: 3,
        name: "Dr. Ibrahim Sani",
        specialty: "Cardiologue",
        type: "specialiste",
        gender: "M",
        address: "Quartier Gawèye, Niamey",
        lat: 13.5334,
        lng: 2.0976,
        distance: 1.8,
        phone: "(+227) 92 34 56 78",
        email: "dr.sani@cardio.ne",
        languages: ["Français", "Anglais"],
        sector: 2,
        consultationPrice: 15000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Échographie cardiaque", "ECG"],
        rating: 4.8,
        reviewsCount: 187,
        experience: 20,
        nextAvailability: "Lundi 09h30"
    },
    {
        id: 4,
        name: "Dr. Fatouma Abdou",
        specialty: "Gynécologue",
        type: "specialiste",
        gender: "F",
        address: "Rue de la Libération, Niamey",
        lat: 13.5089,
        lng: 2.1234,
        distance: 0.8,
        phone: "(+227) 93 45 67 89",
        email: "dr.abdou@gyneco.ne",
        languages: ["Français", "Haoussa"],
        sector: 1,
        consultationPrice: 10000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Échographie", "Suivi grossesse"],
        rating: 4.8,
        reviewsCount: 198,
        experience: 14,
        nextAvailability: "Mercredi 14h00"
    },
    {
        id: 5,
        name: "Dr. Moussa Issoufou",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "M",
        address: "Quartier Tchangarey, Niamey",
        lat: 13.5245,
        lng: 2.0985,
        distance: 1.2,
        phone: "(+227) 94 56 78 90",
        email: "dr.issoufou@medecine.ne",
        languages: ["Français", "Zarma", "Peul"],
        sector: 1,
        consultationPrice: 5000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Certificats médicaux"],
        rating: 4.6,
        reviewsCount: 156,
        experience: 10,
        nextAvailability: "Aujourd'hui 17h00"
    },
    {
        id: 6,
        name: "Dr. Mariama Hamidou",
        specialty: "Ophtalmologue",
        type: "specialiste",
        gender: "F",
        address: "Rue YN-27, Niamey",
        lat: 13.5198,
        lng: 2.1156,
        distance: 0.6,
        phone: "(+227) 95 67 89 01",
        email: "dr.hamidou@ophtalmo.ne",
        languages: ["Français"],
        sector: 2,
        consultationPrice: 12000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Examens de vue", "Chirurgie oculaire"],
        rating: 4.7,
        reviewsCount: 167,
        experience: 18,
        nextAvailability: "Vendredi 11h00"
    },
    {
        id: 7,
        name: "Dr. Ousmane Garba",
        specialty: "Dermatologue",
        type: "specialiste",
        gender: "M",
        address: "Quartier Bobiel, Niamey",
        lat: 13.5067,
        lng: 2.1189,
        distance: 0.9,
        phone: "(+227) 96 78 90 12",
        email: "dr.garba@dermato.ne",
        languages: ["Français", "Haoussa"],
        sector: 1,
        consultationPrice: 10000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Dermatologie", "Allergologie"],
        rating: 4.5,
        reviewsCount: 134,
        experience: 13,
        nextAvailability: "Mardi 15h30"
    },
    {
        id: 8,
        name: "Dr. Hawa Souley",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "F",
        address: "Boulevard Mali-Bero, Niamey",
        lat: 13.5118,
        lng: 2.1436,
        distance: 1.5,
        phone: "(+227) 97 89 01 23",
        email: "dr.souley@medecine.ne",
        languages: ["Français", "Zarma"],
        sector: 1,
        consultationPrice: 5000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Médecine familiale"],
        rating: 4.6,
        reviewsCount: 123,
        experience: 9,
        nextAvailability: "Aujourd'hui 18h30"
    },
    {
        id: 9,
        name: "Dr. Abdoulaye Mahamane",
        specialty: "Chirurgien",
        type: "specialiste",
        gender: "M",
        address: "Avenue de l'Indépendance, Niamey",
        lat: 13.5137,
        lng: 2.1098,
        distance: 0.3,
        phone: "(+227) 98 90 12 34",
        email: "dr.mahamane@chirurgie.ne",
        languages: ["Français", "Anglais"],
        sector: 2,
        consultationPrice: 20000,
        acceptsNewPatients: false,
        services: ["Cabinet", "Chirurgie générale", "Urgences chirurgicales"],
        rating: 4.9,
        reviewsCount: 212,
        experience: 22,
        nextAvailability: "Jeudi 10h00"
    },
    {
        id: 10,
        name: "Dr. Zeinabou Ali",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "F",
        address: "Quartier Plateau, Niamey",
        lat: 13.5178,
        lng: 2.1267,
        distance: 0.7,
        phone: "(+227) 99 01 23 45",
        email: "dr.ali@medecine.ne",
        languages: ["Français", "Haoussa", "Zarma"],
        sector: 1,
        consultationPrice: 5000,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Homéopathie"],
        rating: 4.7,
        reviewsCount: 178,
        experience: 11,
        nextAvailability: "Demain 09h00"
    }
];

// === MAP INITIALIZATION ===
let map;
let markers = [];
let currentFilter = 'all';

function initMap() {
    map = L.map('map').setView([13.5137, 2.1098], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    addMarkers();
}

function addMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    doctors.forEach(doctor => {
        const marker = L.marker([doctor.lat, doctor.lng]).addTo(map);

        marker.bindPopup(`
            <div class="map-popup">
                <strong>${doctor.name}</strong><br>
                ${doctor.specialty}<br>
                ${doctor.acceptsNewPatients ? '✅ Accepte nouveaux patients' : '❌ Complet'}
            </div>
        `);

        marker.on('click', () => {
            highlightDoctor(doctor.id);
        });

        markers.push(marker);
    });
}

// === RENDER DOCTORS ===
function renderDoctors() {
    const filtered = filterDoctors();
    const container = document.getElementById('doctorsList');

    document.getElementById('resultsCount').textContent = filtered.length;

    container.innerHTML = filtered.map(doctor => `
        <div class="pharmacy-card doctor-card" data-id="${doctor.id}">
            <div class="pharmacy-header">
                <div class="pharmacy-info">
                    <h3 class="pharmacy-name">${doctor.name}</h3>
                    <p class="pharmacy-address">${doctor.specialty}</p>
                    <p class="pharmacy-address">${doctor.address}</p>
                </div>
                <div class="pharmacy-badge ${doctor.acceptsNewPatients ? 'badge-available' : 'badge-full'}">
                    ${doctor.acceptsNewPatients ? '✅ Disponible' : '❌ Complet'}
                </div>
            </div>
            
            <div class="pharmacy-details">
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${doctor.distance} km</span>
                </div>
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${doctor.rating} (${doctor.reviewsCount} avis)</span>
                </div>
                <div class="pharmacy-detail-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${doctor.nextAvailability}</span>
                </div>
            </div>
            
            <div class="doctor-info-row">
                <span class="doctor-price">Secteur ${doctor.sector} - ${doctor.consultationPrice}€</span>
                <span class="doctor-experience">${doctor.experience} ans d'expérience</span>
            </div>
            
            <div class="pharmacy-services">
                ${doctor.services.slice(0, 3).map(service => `<span class="service-tag">${service}</span>`).join('')}
            </div>
            
            <div class="pharmacy-actions">
                <button class="pharmacy-btn-secondary" onclick="window.location.href='tel:${doctor.phone.replace(/\s/g, '')}'">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V19.92C22 20.4832 21.5544 20.9582 20.9922 20.9924C18.9478 21.1388 16.9006 20.7805 15.0275 19.9477C13.2739 19.1731 11.7101 18.0217 10.4543 16.5789C9.19854 15.1361 8.28128 13.4422 7.76712 11.6184C6.93339 9.74319 6.57473 7.69352 6.72028 5.64692C6.75447 5.08481 7.22953 4.63806 7.79275 4.63904H10.7928C11.3549 4.63393 11.8313 5.05152 11.8928 5.60904C11.9478 6.13604 12.0478 6.65704 12.1928 7.16704C12.3478 7.72904 12.1678 8.33104 11.7328 8.71104L10.4628 9.98104C11.5628 11.8151 13.1778 13.4301 15.0128 14.5301L16.2828 13.2601C16.6628 12.8251 17.2648 12.6451 17.8268 12.8001C18.3368 12.9451 18.8578 13.0451 19.3848 13.1001C19.9478 13.1616 20.3678 13.6451 20.3628 14.2101V16.92H22Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Appeler
                </button>
                <button class="pharmacy-btn-primary" onclick="viewDoctor(${doctor.id})">
                    Prendre RDV
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// === FILTERS ===
function filterDoctors() {
    return doctors.filter(doctor => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'generaliste') return doctor.type === 'generaliste';
        if (currentFilter === 'specialiste') return doctor.type === 'specialiste';
        if (currentFilter === 'disponible') return doctor.acceptsNewPatients;
        return true;
    });
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderDoctors();

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderDoctors();
        });
    });
});

function viewDoctor(id) {
    alert(`Prise de rendez-vous avec le médecin ${id} - À implémenter`);
}

function highlightDoctor(id) {
    document.querySelectorAll('.pharmacy-card').forEach(card => {
        card.classList.remove('highlighted');
    });
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

console.log('👨‍⚕️ Doctors page initialized - NIAMEY, NIGER');
