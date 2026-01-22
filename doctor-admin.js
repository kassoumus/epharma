// ========================================
// DOCTOR ADMIN - AUTHENTICATION & DATA
// ========================================

// === DEMO DOCTOR DATA ===
const demoDoctor = {
    id: 1,
    email: 'dr.dubois@cabinet-sante.fr',
    password: 'demo123',
    name: 'Dr. Marie Dubois',
    specialty: 'Médecin généraliste',
    phone: '01 45 67 89 01',
    address: '45 Rue de la Santé, 75014 Paris',
    sector: 1,
    consultationPrice: 25,
    experience: 15,
    languages: ['Français', 'Anglais'],
    services: ['Cabinet', 'Téléconsultation', 'Visite à domicile']
};

// === DEMO APPOINTMENTS ===
const demoAppointments = [
    {
        id: 1,
        patientName: 'Jean Dupont',
        date: '2025-12-05',
        time: '09:00',
        duration: 30,
        type: 'Consultation',
        status: 'confirmed',
        reason: 'Consultation de suivi',
        phone: '06 12 34 56 78'
    },
    {
        id: 2,
        patientName: 'Marie Martin',
        date: '2025-12-05',
        time: '10:00',
        duration: 30,
        type: 'Première consultation',
        status: 'confirmed',
        reason: 'Douleurs abdominales',
        phone: '06 23 45 67 89'
    },
    {
        id: 3,
        patientName: 'Pierre Leroy',
        date: '2025-12-05',
        time: '14:30',
        duration: 30,
        type: 'Téléconsultation',
        status: 'pending',
        reason: 'Renouvellement ordonnance',
        phone: '06 34 56 78 90'
    },
    {
        id: 4,
        patientName: 'Sophie Bernard',
        date: '2025-12-06',
        time: '09:30',
        duration: 30,
        type: 'Consultation',
        status: 'confirmed',
        reason: 'Certificat médical',
        phone: '06 45 67 89 01'
    },
    {
        id: 5,
        patientName: 'Luc Moreau',
        date: '2025-12-06',
        time: '11:00',
        duration: 45,
        type: 'Consultation',
        status: 'confirmed',
        reason: 'Bilan de santé',
        phone: '06 56 78 90 12'
    }
];

// === DEMO PATIENTS ===
const demoPatients = [
    {
        id: 1,
        name: 'Jean Dupont',
        age: 45,
        lastVisit: '2025-11-20',
        nextAppointment: '2025-12-05',
        phone: '06 12 34 56 78',
        email: 'jean.dupont@email.fr'
    },
    {
        id: 2,
        name: 'Marie Martin',
        age: 32,
        lastVisit: '2025-10-15',
        nextAppointment: '2025-12-05',
        phone: '06 23 45 67 89',
        email: 'marie.martin@email.fr'
    },
    {
        id: 3,
        name: 'Pierre Leroy',
        age: 58,
        lastVisit: '2025-11-30',
        nextAppointment: '2025-12-05',
        phone: '06 34 56 78 90',
        email: 'pierre.leroy@email.fr'
    }
];

// === AUTHENTICATION ===
function login(email, password) {
    if (email === demoDoctor.email && password === demoDoctor.password) {
        const session = {
            doctorId: demoDoctor.id,
            doctorName: demoDoctor.name,
            email: demoDoctor.email,
            specialty: demoDoctor.specialty,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('doctorSession', JSON.stringify(session));
        return session;
    }
    return null;
}

function logout() {
    localStorage.removeItem('doctorSession');
    window.location.href = 'doctor-login.html';
}

function requireAuth() {
    const sessionData = localStorage.getItem('doctorSession');
    if (!sessionData) {
        window.location.href = 'doctor-login.html';
        return null;
    }
    return JSON.parse(sessionData);
}

// === DATA MANAGEMENT ===
function getAppointments(doctorId) {
    const stored = localStorage.getItem(`doctor_${doctorId}_appointments`);
    return stored ? JSON.parse(stored) : demoAppointments;
}

function saveAppointments(doctorId, appointments) {
    localStorage.setItem(`doctor_${doctorId}_appointments`, JSON.stringify(appointments));
}

function getPatients(doctorId) {
    const stored = localStorage.getItem(`doctor_${doctorId}_patients`);
    return stored ? JSON.parse(stored) : demoPatients;
}

function savePatients(doctorId, patients) {
    localStorage.setItem(`doctor_${doctorId}_patients`, JSON.stringify(patients));
}

function getDoctorProfile(doctorId) {
    const stored = localStorage.getItem(`doctor_${doctorId}_profile`);
    if (stored) {
        return JSON.parse(stored);
    }
    // Return demo doctor data as default
    return {
        ...demoDoctor,
        availability: {
            monday: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
            tuesday: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
            wednesday: [{ start: '08:00', end: '12:00' }],
            thursday: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
            friday: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
            saturday: [],
            sunday: []
        }
    };
}

function updateDoctorProfile(doctorId, profileData) {
    localStorage.setItem(`doctor_${doctorId}_profile`, JSON.stringify(profileData));
}

function updateAppointmentStatus(appointmentId, newStatus) {
    const session = requireAuth();
    if (!session) return;

    const appointments = getAppointments(session.doctorId);
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        saveAppointments(session.doctorId, appointments);
    }
}

function deleteAppointment(appointmentId) {
    const session = requireAuth();
    if (!session) return;

    const appointments = getAppointments(session.doctorId);
    const filtered = appointments.filter(a => a.id !== appointmentId);
    saveAppointments(session.doctorId, filtered);
}

// === STATISTICS ===
function getStatistics(doctorId) {
    const appointments = getAppointments(doctorId);
    const patients = getPatients(doctorId);

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

    return {
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        confirmedToday: confirmedToday,
        pendingAppointments: pendingAppointments,
        weekAppointments: appointments.length,
        averageRating: 4.8
    };
}

// === LOGIN FORM HANDLER ===
if (document.getElementById('doctorLoginForm')) {
    document.getElementById('doctorLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const session = login(email, password);

        if (session) {
            window.location.href = 'doctor-dashboard.html';
        } else {
            alert('Email ou mot de passe incorrect');
        }
    });
}

console.log('👨‍⚕️ Doctor admin system initialized');
