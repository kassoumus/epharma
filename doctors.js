// ========================================
// EPHARMA - DOCTORS
// ========================================

// === DOCTORS DATA ===
const doctors = [
    {
        id: 1,
        name: "Dr. Marie Dubois",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "F",
        address: "45 Rue de la Santé, 75014 Paris",
        lat: 48.8356,
        lng: 2.3394,
        distance: 0.5,
        phone: "01 45 67 89 01",
        email: "dr.dubois@cabinet-sante.fr",
        languages: ["Français", "Anglais"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation"],
        rating: 4.8,
        reviewsCount: 156,
        experience: 15,
        nextAvailability: "Demain 14h30"
    },
    {
        id: 2,
        name: "Dr. Jean Martin",
        specialty: "Cardiologue",
        type: "specialiste",
        gender: "M",
        address: "12 Avenue de la République, 75011 Paris",
        lat: 48.8656,
        lng: 2.3798,
        distance: 0.3,
        phone: "01 43 55 22 33",
        email: "dr.martin@cardio-paris.fr",
        languages: ["Français"],
        sector: 2,
        consultationPrice: 50,
        acceptsNewPatients: true,
        services: ["Cabinet", "Échographie cardiaque"],
        rating: 4.9,
        reviewsCount: 234,
        experience: 22,
        nextAvailability: "Lundi 10h00"
    },
    {
        id: 3,
        name: "Dr. Sophie Bernard",
        specialty: "Pédiatre",
        type: "specialiste",
        gender: "F",
        address: "78 Rue de Charonne, 75011 Paris",
        lat: 48.8534,
        lng: 2.3856,
        distance: 0.7,
        phone: "01 43 71 45 67",
        email: "dr.bernard@pediatrie.fr",
        languages: ["Français", "Espagnol"],
        sector: 1,
        consultationPrice: 30,
        acceptsNewPatients: true,
        services: ["Cabinet", "Vaccinations"],
        rating: 4.7,
        reviewsCount: 189,
        experience: 12,
        nextAvailability: "Aujourd'hui 16h00"
    },
    {
        id: 4,
        name: "Dr. Pierre Lefebvre",
        specialty: "Dermatologue",
        type: "specialiste",
        gender: "M",
        address: "23 Boulevard Voltaire, 75011 Paris",
        lat: 48.8589,
        lng: 2.3789,
        distance: 0.4,
        phone: "01 48 05 67 89",
        email: "dr.lefebvre@dermato.fr",
        languages: ["Français", "Anglais", "Allemand"],
        sector: 2,
        consultationPrice: 60,
        acceptsNewPatients: false,
        services: ["Cabinet", "Laser", "Chirurgie dermatologique"],
        rating: 4.6,
        reviewsCount: 145,
        experience: 18,
        nextAvailability: "Dans 2 semaines"
    },
    {
        id: 5,
        name: "Dr. Claire Rousseau",
        specialty: "Gynécologue",
        type: "specialiste",
        gender: "F",
        address: "56 Rue de la Roquette, 75011 Paris",
        lat: 48.8556,
        lng: 2.3722,
        distance: 0.6,
        phone: "01 43 57 12 34",
        email: "dr.rousseau@gyneco.fr",
        languages: ["Français", "Anglais"],
        sector: 1,
        consultationPrice: 35,
        acceptsNewPatients: true,
        services: ["Cabinet", "Échographie", "Suivi grossesse"],
        rating: 4.9,
        reviewsCount: 278,
        experience: 16,
        nextAvailability: "Mercredi 09h30"
    },
    {
        id: 6,
        name: "Dr. Thomas Petit",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "M",
        address: "89 Avenue Parmentier, 75011 Paris",
        lat: 48.8634,
        lng: 2.3745,
        distance: 0.2,
        phone: "01 43 55 78 90",
        email: "dr.petit@medecine-generale.fr",
        languages: ["Français"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Visite à domicile", "Téléconsultation"],
        rating: 4.5,
        reviewsCount: 123,
        experience: 8,
        nextAvailability: "Aujourd'hui 18h00"
    },
    {
        id: 7,
        name: "Dr. Isabelle Moreau",
        specialty: "Ophtalmologue",
        type: "specialiste",
        gender: "F",
        address: "34 Rue Saint-Maur, 75011 Paris",
        lat: 48.8623,
        lng: 2.3812,
        distance: 0.5,
        phone: "01 43 57 89 12",
        email: "dr.moreau@ophtalmo.fr",
        languages: ["Français", "Italien"],
        sector: 2,
        consultationPrice: 55,
        acceptsNewPatients: true,
        services: ["Cabinet", "Examens de vue", "Chirurgie réfractive"],
        rating: 4.7,
        reviewsCount: 167,
        experience: 20,
        nextAvailability: "Vendredi 11h00"
    },
    {
        id: 8,
        name: "Dr. Laurent Durand",
        specialty: "ORL",
        type: "specialiste",
        gender: "M",
        address: "67 Rue Oberkampf, 75011 Paris",
        lat: 48.8645,
        lng: 2.3789,
        distance: 0.4,
        phone: "01 43 38 45 67",
        email: "dr.durand@orl-paris.fr",
        languages: ["Français", "Anglais"],
        sector: 1,
        consultationPrice: 40,
        acceptsNewPatients: true,
        services: ["Cabinet", "Audiométrie", "Fibroscopie"],
        rating: 4.6,
        reviewsCount: 134,
        experience: 14,
        nextAvailability: "Mardi 15h30"
    },
    {
        id: 9,
        name: "Dr. Nathalie Simon",
        specialty: "Psychiatre",
        type: "specialiste",
        gender: "F",
        address: "45 Rue de Montreuil, 75011 Paris",
        lat: 48.8512,
        lng: 2.3889,
        distance: 0.8,
        phone: "01 43 71 23 45",
        email: "dr.simon@psy.fr",
        languages: ["Français", "Anglais", "Espagnol"],
        sector: 2,
        consultationPrice: 70,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Thérapie de couple"],
        rating: 4.8,
        reviewsCount: 198,
        experience: 19,
        nextAvailability: "Jeudi 14h00"
    },
    {
        id: 10,
        name: "Dr. Marc Leroy",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "M",
        address: "12 Rue Jean-Pierre Timbaud, 75011 Paris",
        lat: 48.8667,
        lng: 2.3734,
        distance: 0.3,
        phone: "01 43 55 34 56",
        email: "dr.leroy@cabinet.fr",
        languages: ["Français", "Portugais"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Certificats médicaux"],
        rating: 4.4,
        reviewsCount: 98,
        experience: 10,
        nextAvailability: "Demain 09h00"
    },
    {
        id: 11,
        name: "Dr. Émilie Garnier",
        specialty: "Rhumatologue",
        type: "specialiste",
        gender: "F",
        address: "90 Boulevard Richard-Lenoir, 75011 Paris",
        lat: 48.8589,
        lng: 2.3723,
        distance: 0.5,
        phone: "01 43 38 67 89",
        email: "dr.garnier@rhumato.fr",
        languages: ["Français"],
        sector: 2,
        consultationPrice: 50,
        acceptsNewPatients: true,
        services: ["Cabinet", "Infiltrations", "Échographie ostéo-articulaire"],
        rating: 4.7,
        reviewsCount: 142,
        experience: 17,
        nextAvailability: "Lundi 16h00"
    },
    {
        id: 12,
        name: "Dr. Alexandre Blanc",
        specialty: "Gastro-entérologue",
        type: "specialiste",
        gender: "M",
        address: "23 Rue de la Fontaine au Roi, 75011 Paris",
        lat: 48.8678,
        lng: 2.3712,
        distance: 0.6,
        phone: "01 43 57 78 90",
        email: "dr.blanc@gastro.fr",
        languages: ["Français", "Anglais"],
        sector: 1,
        consultationPrice: 45,
        acceptsNewPatients: true,
        services: ["Cabinet", "Endoscopie", "Coloscopie"],
        rating: 4.8,
        reviewsCount: 176,
        experience: 21,
        nextAvailability: "Mercredi 10h30"
    },
    {
        id: 13,
        name: "Dr. Valérie Mercier",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "F",
        address: "56 Avenue de la République, 75011 Paris",
        lat: 48.8634,
        lng: 2.3789,
        distance: 0.3,
        phone: "01 43 55 90 12",
        email: "dr.mercier@medecine.fr",
        languages: ["Français", "Arabe"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Médecine du travail"],
        rating: 4.6,
        reviewsCount: 112,
        experience: 13,
        nextAvailability: "Aujourd'hui 17h30"
    },
    {
        id: 14,
        name: "Dr. Julien Fontaine",
        specialty: "Urologue",
        type: "specialiste",
        gender: "M",
        address: "78 Rue Amelot, 75011 Paris",
        lat: 48.8598,
        lng: 2.3701,
        distance: 0.4,
        phone: "01 43 38 12 34",
        email: "dr.fontaine@urologie.fr",
        languages: ["Français"],
        sector: 2,
        consultationPrice: 55,
        acceptsNewPatients: false,
        services: ["Cabinet", "Échographie", "Chirurgie urologique"],
        rating: 4.5,
        reviewsCount: 89,
        experience: 16,
        nextAvailability: "Dans 3 semaines"
    },
    {
        id: 15,
        name: "Dr. Céline Roux",
        specialty: "Endocrinologue",
        type: "specialiste",
        gender: "F",
        address: "34 Rue du Chemin Vert, 75011 Paris",
        lat: 48.8567,
        lng: 2.3823,
        distance: 0.6,
        phone: "01 43 71 56 78",
        email: "dr.roux@endocrino.fr",
        languages: ["Français", "Anglais"],
        sector: 1,
        consultationPrice: 40,
        acceptsNewPatients: true,
        services: ["Cabinet", "Diabétologie", "Nutrition"],
        rating: 4.9,
        reviewsCount: 203,
        experience: 18,
        nextAvailability: "Mardi 11h00"
    },
    {
        id: 16,
        name: "Dr. Olivier Vincent",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "M",
        address: "12 Passage Saint-Pierre Amelot, 75011 Paris",
        lat: 48.8612,
        lng: 2.3734,
        distance: 0.3,
        phone: "01 43 55 23 45",
        email: "dr.vincent@cabinet.fr",
        languages: ["Français", "Chinois"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Médecine chinoise", "Acupuncture"],
        rating: 4.7,
        reviewsCount: 167,
        experience: 20,
        nextAvailability: "Demain 10h30"
    },
    {
        id: 17,
        name: "Dr. Sandrine Perrin",
        specialty: "Neurologue",
        type: "specialiste",
        gender: "F",
        address: "45 Rue Popincourt, 75011 Paris",
        lat: 48.8623,
        lng: 2.3789,
        distance: 0.5,
        phone: "01 43 38 78 90",
        email: "dr.perrin@neuro.fr",
        languages: ["Français", "Anglais"],
        sector: 2,
        consultationPrice: 60,
        acceptsNewPatients: true,
        services: ["Cabinet", "EEG", "EMG"],
        rating: 4.8,
        reviewsCount: 154,
        experience: 19,
        nextAvailability: "Vendredi 14h30"
    },
    {
        id: 18,
        name: "Dr. François Lambert",
        specialty: "Pneumologue",
        type: "specialiste",
        gender: "M",
        address: "67 Rue de Charonne, 75011 Paris",
        lat: 48.8534,
        lng: 2.3845,
        distance: 0.7,
        phone: "01 43 71 34 56",
        email: "dr.lambert@pneumo.fr",
        languages: ["Français"],
        sector: 1,
        consultationPrice: 45,
        acceptsNewPatients: true,
        services: ["Cabinet", "Spirométrie", "Tests allergologiques"],
        rating: 4.6,
        reviewsCount: 128,
        experience: 15,
        nextAvailability: "Lundi 09h30"
    },
    {
        id: 19,
        name: "Dr. Aurélie Bonnet",
        specialty: "Médecin généraliste",
        type: "generaliste",
        gender: "F",
        address: "89 Rue Saint-Maur, 75011 Paris",
        lat: 48.8645,
        lng: 2.3823,
        distance: 0.4,
        phone: "01 43 57 45 67",
        email: "dr.bonnet@medecine.fr",
        languages: ["Français", "Russe"],
        sector: 1,
        consultationPrice: 25,
        acceptsNewPatients: true,
        services: ["Cabinet", "Téléconsultation", "Homéopathie"],
        rating: 4.5,
        reviewsCount: 134,
        experience: 11,
        nextAvailability: "Aujourd'hui 19h00"
    },
    {
        id: 20,
        name: "Dr. Christophe Girard",
        specialty: "Allergologue",
        type: "specialiste",
        gender: "M",
        address: "23 Boulevard Beaumarchais, 75011 Paris",
        lat: 48.8578,
        lng: 2.3678,
        distance: 0.5,
        phone: "01 43 38 56 78",
        email: "dr.girard@allergo.fr",
        languages: ["Français", "Anglais"],
        sector: 2,
        consultationPrice: 50,
        acceptsNewPatients: true,
        services: ["Cabinet", "Tests cutanés", "Désensibilisation"],
        rating: 4.7,
        reviewsCount: 145,
        experience: 17,
        nextAvailability: "Jeudi 10h00"
    }
];

// === MAP INITIALIZATION ===
let map;
let markers = [];
let currentFilter = 'all';

function initMap() {
    map = L.map('map').setView([48.8656, 2.3798], 13);

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

console.log('👨‍⚕️ Doctors page initialized');
