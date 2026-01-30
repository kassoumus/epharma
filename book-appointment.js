// ========================================
// BOOK APPOINTMENT - PATIENT INTERFACE
// ========================================

let currentStep = 1;
let selectedDoctor = null;
let selectedDate = null;
let selectedTime = null;
let availableSlots = [];
let allDoctors = [];

// Initialize booking system
document.addEventListener('DOMContentLoaded', async () => {
    await initializeBooking();
    setupEventListeners();
});

async function initializeBooking() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctor');

    if (doctorId) {
        // Direct booking from doctor profile
        selectedDoctor = await window.supabaseAPI.getDoctorById(doctorId);
        if (selectedDoctor) {
            goToStep(2);
        } else {
            await loadDoctors();
        }
    } else {
        // Show doctor selection
        await loadDoctors();
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.min = today;
    }
}

function setupEventListeners() {
    // Step navigation
    document.getElementById('step1Next').addEventListener('click', () => goToStep(2));
    document.getElementById('step2Back').addEventListener('click', () => goToStep(1));
    document.getElementById('step2Next').addEventListener('click', () => goToStep(3));
    document.getElementById('step3Back').addEventListener('click', () => goToStep(2));
    document.getElementById('step3Next').addEventListener('click', handleStep3Submit);
    document.getElementById('step4Back').addEventListener('click', () => goToStep(3));
    document.getElementById('confirmBooking').addEventListener('click', handleConfirmBooking);

    // Date change
    document.getElementById('appointmentDate').addEventListener('change', handleDateChange);
}

// ========================================
// STEP 1: DOCTOR SELECTION
// ========================================

async function loadDoctors() {
    const doctorsList = document.getElementById('doctorsList');
    doctorsList.innerHTML = '<p style="text-align: center; padding: 2rem;">⏳ Chargement des médecins...</p>';

    try {
        allDoctors = await window.supabaseAPI.getDoctors();

        if (allDoctors.length === 0) {
            doctorsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun médecin disponible pour le moment</p>';
            return;
        }

        doctorsList.innerHTML = '';
        allDoctors.forEach(doctor => {
            const card = createDoctorCard(doctor);
            doctorsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
        doctorsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--error);">Erreur lors du chargement des médecins</p>';
    }
}

function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.style.cursor = 'pointer';

    const initials = (doctor.first_name[0] + doctor.last_name[0]).toUpperCase();
    const specialties = Array.isArray(doctor.specialties) ? doctor.specialties.join(', ') : 'Médecine générale';
    const fee = doctor.consultation_fee ? `${doctor.consultation_fee} FCFA` : 'Tarif non spécifié';

    card.innerHTML = `
        <div class="doctor-avatar">${initials}</div>
        <div style="flex: 1;">
            <h3 style="margin: 0 0 0.25rem 0;">Dr. ${doctor.first_name} ${doctor.last_name}</h3>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">${specialties}</p>
            <p style="margin: 0.5rem 0 0 0; color: var(--primary); font-weight: 600; font-size: 0.875rem;">${fee}</p>
        </div>
        <div style="margin-left: 1rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
    `;

    card.addEventListener('click', () => selectDoctor(doctor, card));
    return card;
}

function selectDoctor(doctor, cardElement) {
    // Remove previous selection
    document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));

    // Select new doctor
    cardElement.classList.add('selected');
    selectedDoctor = doctor;

    // Enable next button
    document.getElementById('step1Next').disabled = false;
}

// ========================================
// STEP 2: DATE & TIME SELECTION
// ========================================

async function handleDateChange(e) {
    const date = e.target.value;
    if (!date || !selectedDoctor) return;

    selectedDate = date;
    selectedTime = null;

    // Show loading
    const container = document.getElementById('timeSlotsContainer');
    const slotsDiv = document.getElementById('timeSlots');
    container.style.display = 'block';
    slotsDiv.innerHTML = '<p style="text-align: center; padding: 1rem;">⏳ Chargement des créneaux...</p>';

    try {
        // Fetch available slots
        availableSlots = await window.supabaseAPI.getAvailableSlots(selectedDoctor.id, date);

        if (availableSlots.length === 0) {
            slotsDiv.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--text-secondary);">Aucun créneau disponible pour cette date</p>';
            return;
        }

        // Render slots
        slotsDiv.innerHTML = '';
        availableSlots.forEach(slot => {
            const slotElement = createTimeSlot(slot);
            slotsDiv.appendChild(slotElement);
        });
    } catch (error) {
        console.error('Error loading slots:', error);
        slotsDiv.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--error);">Erreur lors du chargement des créneaux</p>';
    }
}

function createTimeSlot(slot) {
    const div = document.createElement('div');
    div.className = 'time-slot';

    if (!slot.is_available) {
        div.classList.add('disabled');
    }

    // Format time (HH:MM:SS to HH:MM)
    const timeStr = slot.time_slot.substring(0, 5);
    div.textContent = timeStr;

    if (slot.is_available) {
        div.addEventListener('click', () => selectTimeSlot(timeStr, div));
    }

    return div;
}

function selectTimeSlot(time, slotElement) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));

    // Select new slot
    slotElement.classList.add('selected');
    selectedTime = time;

    // Enable next button
    document.getElementById('step2Next').disabled = false;
}

// ========================================
// STEP 3: PATIENT INFORMATION
// ========================================

function handleStep3Submit() {
    const form = document.getElementById('patientForm');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    goToStep(4);
}

// ========================================
// STEP 4: CONFIRMATION
// ========================================

function showBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const specialties = Array.isArray(selectedDoctor.specialties) ? selectedDoctor.specialties.join(', ') : 'Médecine générale';
    const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Médecin</span>
            <span class="summary-value">Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Spécialité</span>
            <span class="summary-value">${specialties}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Date</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Heure</span>
            <span class="summary-value">${selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Patient</span>
            <span class="summary-value">${document.getElementById('patientName').value}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Téléphone</span>
            <span class="summary-value">${document.getElementById('patientPhone').value}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Type</span>
            <span class="summary-value">${document.getElementById('consultationType').value}</span>
        </div>
        ${document.getElementById('consultationReason').value ? `
        <div class="summary-item">
            <span class="summary-label">Motif</span>
            <span class="summary-value">${document.getElementById('consultationReason').value}</span>
        </div>
        ` : ''}
    `;
}

async function handleConfirmBooking() {
    const confirmBtn = document.getElementById('confirmBooking');
    const confirmText = document.getElementById('confirmText');
    const confirmLoading = document.getElementById('confirmLoading');

    // Disable button and show loading
    confirmBtn.disabled = true;
    confirmText.style.display = 'none';
    confirmLoading.style.display = 'inline';

    try {
        const appointmentData = {
            patient_name: document.getElementById('patientName').value,
            patient_phone: document.getElementById('patientPhone').value,
            patient_email: document.getElementById('patientEmail').value || null,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            type: document.getElementById('consultationType').value,
            reason: document.getElementById('consultationReason').value || null
        };

        const result = await window.supabaseAPI.bookAppointment(selectedDoctor.id, appointmentData);

        if (result.success) {
            showSuccess(result.appointmentId);
        } else {
            throw new Error(result.error || 'Erreur lors de la réservation');
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('Erreur lors de la réservation: ' + error.message);

        // Re-enable button
        confirmBtn.disabled = false;
        confirmText.style.display = 'inline';
        confirmLoading.style.display = 'none';
    }
}

function showSuccess(appointmentId) {
    const details = document.getElementById('successDetails');
    const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    details.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Date</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Heure</span>
            <span class="summary-value">${selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Médecin</span>
            <span class="summary-value">Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Patient</span>
            <span class="summary-value">${document.getElementById('patientName').value}</span>
        </div>
    `;

    // Hide all cards
    document.querySelectorAll('.booking-card').forEach(card => {
        card.classList.remove('active');
    });

    // Show success card
    document.getElementById('stepSuccess').classList.add('active');

    // Update progress to 100%
    updateProgress(100);
}

// ========================================
// NAVIGATION & PROGRESS
// ========================================

function goToStep(step) {
    // Hide all cards
    document.querySelectorAll('.booking-card').forEach(card => {
        card.classList.remove('active');
    });

    // Show target card
    document.getElementById(`step${step}`).classList.add('active');

    // Update progress
    updateProgress((step - 1) * 33.33);

    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });

    currentStep = step;

    // Special actions for specific steps
    if (step === 2 && selectedDoctor) {
        showDoctorInfo();
    } else if (step === 4) {
        showBookingSummary();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(percentage) {
    const progressLine = document.getElementById('progressLine');
    progressLine.style.width = percentage + '%';
}

function showDoctorInfo() {
    const infoDiv = document.getElementById('doctorInfo');
    const specialties = Array.isArray(selectedDoctor.specialties) ? selectedDoctor.specialties.join(', ') : 'Médecine générale';

    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; padding: 1rem; background: #f9fafb; border-radius: 8px;">
            <div class="doctor-avatar" style="width: 50px; height: 50px; font-size: 1.25rem;">
                ${(selectedDoctor.first_name[0] + selectedDoctor.last_name[0]).toUpperCase()}
            </div>
            <div style="margin-left: 1rem;">
                <h3 style="margin: 0;">Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}</h3>
                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">${specialties}</p>
            </div>
        </div>
    `;
}

console.log('📅 Book appointment initialized');
