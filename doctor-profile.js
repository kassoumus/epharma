// ========================================
// DOCTOR PROFILE - PROFILE MANAGEMENT (SUPABASE VERSION)
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeProfile();
    });
}

async function initializeProfile() {
    // Update doctor info
    document.getElementById('doctorName').textContent = session.doctorName;
    document.getElementById('doctorSpecialty').textContent = session.specialty;

    // Load profile data
    await loadProfileData();

    // Setup tabs
    setupTabs();

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    document.getElementById('profilePhoto').addEventListener('change', handlePhotoUpload);
    document.getElementById('onlineConsultation').addEventListener('change', toggleOnlineFeeField);

    // Generate availability schedule
    generateAvailabilitySchedule();
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');
            document.querySelector(`.admin-tab-content[data-tab="${tabName}"]`).classList.add('active');
        });
    });
}

async function loadProfileData() {
    const profile = await getDoctorProfile(session.doctorId);

    if (!profile) {
        showToast('Erreur lors du chargement du profil', 'error');
        return;
    }

    // Personal Information
    const names = profile.name.split(' ');
    document.getElementById('firstName').value = names[0] || '';
    document.getElementById('lastName').value = names.slice(1).join(' ') || '';
    document.getElementById('email').value = profile.email || session.email;
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('address').value = profile.address || '';

    // Professional Information
    document.getElementById('specialty').value = profile.specialty || session.specialty;

    // Consultation
    document.getElementById('consultationFee').value = profile.consultationPrice || 25000;
    document.getElementById('acceptsNewPatients').checked = profile.acceptsNewPatients !== false;

    toggleOnlineFeeField();
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const photoData = event.target.result;
        displayProfilePhoto(photoData);
    };
    reader.readAsDataURL(file);
}

function displayProfilePhoto(photoData) {
    const preview = document.getElementById('profilePhotoPreview');
    preview.style.backgroundImage = `url(${photoData})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
    preview.innerHTML = ''; // Remove SVG icon
}

function toggleOnlineFeeField() {
    const isOnline = document.getElementById('onlineConsultation').checked;
    const feeGroup = document.getElementById('onlineFeeGroup');

    if (feeGroup) {
        feeGroup.style.display = isOnline ? 'block' : 'none';
    }
}

function generateAvailabilitySchedule() {
    const container = document.getElementById('availabilityContainer');
    const days = [
        { key: 'monday', label: 'Lundi' },
        { key: 'tuesday', label: 'Mardi' },
        { key: 'wednesday', label: 'Mercredi' },
        { key: 'thursday', label: 'Jeudi' },
        { key: 'friday', label: 'Vendredi' },
        { key: 'saturday', label: 'Samedi' },
        { key: 'sunday', label: 'Dimanche' }
    ];

    days.forEach(day => {
        const dayHTML = `
            <div class="availability-day" data-day="${day.key}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="font-weight: 600; font-size: var(--font-size-base);">${day.label}</h4>
                    <button type="button" class="admin-btn-secondary" onclick="addTimeSlot('${day.key}')">
                        <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px;">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Ajouter une plage
                    </button>
                </div>
                <div class="time-slots-container" id="slots-${day.key}">
                    <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Aucune plage horaire définie</p>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', dayHTML);
    });
}

function addTimeSlot(day) {
    addTimeSlotWithData(day, '09:00', '17:00');
}

function addTimeSlotWithData(day, startTime = '09:00', endTime = '17:00', index = null) {
    const container = document.getElementById(`slots-${day}`);

    // Remove "no slots" message if present
    const noSlotsMsg = container.querySelector('p');
    if (noSlotsMsg) {
        noSlotsMsg.remove();
    }

    const slotId = index !== null ? index : Date.now();
    const slotHTML = `
        <div class="time-slot" data-slot-id="${slotId}">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="flex: 1;">
                    <label style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Début</label>
                    <input type="time" class="admin-input slot-start" value="${startTime}" required>
                </div>
                <div style="flex: 1;">
                    <label style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Fin</label>
                    <input type="time" class="admin-input slot-end" value="${endTime}" required>
                </div>
                <button type="button" class="admin-action-btn admin-action-delete" onclick="removeTimeSlot(this)" title="Supprimer" style="margin-top: 1.5rem;">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', slotHTML);
}

function removeTimeSlot(button) {
    const slot = button.closest('.time-slot');
    const container = slot.parentElement;
    slot.remove();

    // Add "no slots" message if no slots left
    if (container.querySelectorAll('.time-slot').length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Aucune plage horaire définie</p>';
    }
}

async function saveProfile(e) {
    e.preventDefault();

    // Collect form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const fullName = `${firstName} ${lastName}`;

    const profileData = {
        name: fullName,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        specialty: document.getElementById('specialty').value,
        consultationPrice: parseFloat(document.getElementById('consultationFee').value) || 0,
        acceptsNewPatients: document.getElementById('acceptsNewPatients').checked
    };

    // Update profile
    const result = await updateDoctorProfile(session.doctorId, profileData);

    if (result.success) {
        // Update session
        session.doctorName = fullName;
        session.specialty = profileData.specialty;
        localStorage.setItem('doctorSession', JSON.stringify(session));

        // Update sidebar
        document.getElementById('doctorName').textContent = fullName;
        document.getElementById('doctorSpecialty').textContent = profileData.specialty;

        showToast('Profil mis à jour avec succès', 'success');
    } else {
        showToast('Erreur lors de la mise à jour du profil', 'error');
    }
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

console.log('👤 Doctor profile initialized (Supabase)');
