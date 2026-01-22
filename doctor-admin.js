// ========================================
// DOCTOR ADMIN - AUTHENTICATION & DATA (SUPABASE VERSION)
// ========================================

// === AUTHENTICATION ===
async function login(email, password) {
    const result = await window.supabaseAPI.signIn(email, password);

    if (result.success) {
        // Get doctor profile
        const doctorProfile = await window.supabaseAPI.getDoctorProfileByUserId(result.user.id);

        if (!doctorProfile) {
            return null;
        }

        const session = {
            doctorId: doctorProfile.id,
            userId: result.user.id,
            doctorName: doctorProfile.name,
            email: result.user.email,
            specialty: doctorProfile.specialty,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('doctorSession', JSON.stringify(session));
        return session;
    }

    return null;
}

function logout() {
    window.supabaseAPI.signOut();
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

// === DATA MANAGEMENT (SUPABASE) ===
async function getAppointments(doctorId) {
    try {
        const appointments = await window.supabaseAPI.getAppointmentsByDoctor(doctorId);
        return appointments.map(appt => ({
            id: appt.id,
            patientName: appt.patient_name,
            phone: appt.patient_phone,
            email: appt.patient_email,
            date: appt.appointment_date,
            time: appt.appointment_time,
            duration: appt.duration,
            type: appt.type,
            reason: appt.reason,
            notes: appt.notes || '',
            status: appt.status
        }));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

async function saveAppointments(doctorId, appointments) {
    // This function is deprecated - use createAppointment or updateAppointment instead
    console.warn('saveAppointments is deprecated. Use createAppointment or updateAppointment.');
}

async function createAppointmentRecord(doctorId, appointmentData) {
    const data = {
        doctor_id: doctorId,
        patient_name: appointmentData.patientName,
        patient_phone: appointmentData.phone,
        patient_email: appointmentData.email || null,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        duration: appointmentData.duration,
        type: appointmentData.type,
        reason: appointmentData.reason,
        notes: appointmentData.notes || null,
        status: appointmentData.status || 'pending'
    };

    return await window.supabaseAPI.createAppointment(data);
}

async function updateAppointmentRecord(appointmentId, updates) {
    const data = {};

    if (updates.patientName) data.patient_name = updates.patientName;
    if (updates.phone) data.patient_phone = updates.phone;
    if (updates.email) data.patient_email = updates.email;
    if (updates.date) data.appointment_date = updates.date;
    if (updates.time) data.appointment_time = updates.time;
    if (updates.duration) data.duration = updates.duration;
    if (updates.type) data.type = updates.type;
    if (updates.reason) data.reason = updates.reason;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.status) data.status = updates.status;

    return await window.supabaseAPI.updateAppointment(appointmentId, data);
}

async function getPatients(doctorId) {
    try {
        const patients = await window.supabaseAPI.getPatientsByDoctor(doctorId);
        return patients.map(patient => ({
            id: patient.id,
            name: patient.name,
            age: patient.age,
            phone: patient.phone,
            email: patient.email,
            lastVisit: patient.last_visit,
            nextAppointment: patient.next_appointment
        }));
    } catch (error) {
        console.error('Error fetching patients:', error);
        return [];
    }
}

async function savePatients(doctorId, patients) {
    // This function is deprecated - use createPatient or updatePatient instead
    console.warn('savePatients is deprecated. Use createPatient or updatePatient.');
}

async function createPatientRecord(doctorId, patientData) {
    const data = {
        doctor_id: doctorId,
        name: patientData.name,
        age: patientData.age || null,
        phone: patientData.phone,
        email: patientData.email || null,
        last_visit: patientData.lastVisit || new Date().toISOString().split('T')[0],
        next_appointment: patientData.nextAppointment || null
    };

    return await window.supabaseAPI.createPatient(data);
}

async function updatePatientRecord(patientId, updates) {
    const data = {};

    if (updates.name) data.name = updates.name;
    if (updates.age !== undefined) data.age = updates.age;
    if (updates.phone) data.phone = updates.phone;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.lastVisit) data.last_visit = updates.lastVisit;
    if (updates.nextAppointment !== undefined) data.next_appointment = updates.nextAppointment;

    return await window.supabaseAPI.updatePatient(patientId, data);
}

async function getDoctorProfile(doctorId) {
    try {
        const profile = await window.supabaseAPI.getDoctorProfile(doctorId);
        if (!profile) return null;

        return {
            id: profile.id,
            userId: profile.user_id,
            name: profile.name,
            specialty: profile.specialty,
            type: profile.type,
            gender: profile.gender,
            address: profile.address,
            city: profile.city,
            postalCode: profile.postal_code,
            phone: profile.phone,
            email: profile.email,
            sector: profile.sector,
            consultationPrice: profile.consultation_price,
            acceptsNewPatients: profile.accepts_new_patients,
            experienceYears: profile.experience_years,
            rating: profile.rating,
            reviewsCount: profile.reviews_count
        };
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
    }
}

async function updateDoctorProfile(doctorId, profileData) {
    const data = {};

    if (profileData.name) data.name = profileData.name;
    if (profileData.specialty) data.specialty = profileData.specialty;
    if (profileData.type) data.type = profileData.type;
    if (profileData.gender) data.gender = profileData.gender;
    if (profileData.address) data.address = profileData.address;
    if (profileData.city) data.city = profileData.city;
    if (profileData.postalCode) data.postal_code = profileData.postalCode;
    if (profileData.phone) data.phone = profileData.phone;
    if (profileData.email) data.email = profileData.email;
    if (profileData.sector !== undefined) data.sector = profileData.sector;
    if (profileData.consultationPrice !== undefined) data.consultation_price = profileData.consultationPrice;
    if (profileData.acceptsNewPatients !== undefined) data.accepts_new_patients = profileData.acceptsNewPatients;
    if (profileData.experienceYears !== undefined) data.experience_years = profileData.experienceYears;

    return await window.supabaseAPI.updateDoctorProfile(doctorId, data);
}

async function updateAppointmentStatus(appointmentId, newStatus) {
    return await window.supabaseAPI.updateAppointmentStatus(appointmentId, newStatus);
}

async function deleteAppointment(appointmentId) {
    return await window.supabaseAPI.deleteAppointment(appointmentId);
}

// === STATISTICS ===
async function getStatistics(doctorId) {
    try {
        const appointments = await getAppointments(doctorId);
        const patients = await getPatients(doctorId);

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
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return {
            totalPatients: 0,
            todayAppointments: 0,
            confirmedToday: 0,
            pendingAppointments: 0,
            weekAppointments: 0,
            averageRating: 0
        };
    }
}

// === LOGIN FORM HANDLER ===
if (document.getElementById('doctorLoginForm')) {
    document.getElementById('doctorLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        const session = await login(email, password);

        if (session) {
            window.location.href = 'doctor-dashboard.html';
        } else {
            alert('Email ou mot de passe incorrect');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
}

console.log('👨‍⚕️ Doctor admin system initialized (Supabase)');
