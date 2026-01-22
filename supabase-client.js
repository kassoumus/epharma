// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================

// Load environment variables from .env.local
const SUPABASE_URL = 'https://jdsjpdpdcbbphelrohjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2pwZHBkY2JicGhlbHJvaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDc3MzUsImV4cCI6MjA4MDUyMzczNX0.0n_xBZWVcR_Y93UC00Pspbov23Df6v3_xffoITDhOJg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

async function signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData
        }
    });

    if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
}

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ========================================
// PHARMACIES FUNCTIONS
// ========================================

async function getPharmacies(filters = {}) {
    let query = supabase
        .from('pharmacies')
        .select('*');

    if (filters.city) {
        query = query.eq('city', filters.city);
    }

    if (filters.is_open_24_7) {
        query = query.eq('is_open_24_7', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching pharmacies:', error);
        return [];
    }

    return data;
}

async function getPharmacyById(id) {
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching pharmacy:', error);
        return null;
    }

    return data;
}

async function searchPharmaciesByProduct(productName, location) {
    // Search for pharmacies that have the product in stock
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            pharmacies (*)
        `)
        .ilike('name', `%${productName}%`)
        .eq('stock_status', 'in_stock');

    if (error) {
        console.error('Error searching pharmacies:', error);
        return [];
    }

    return data;
}

// ========================================
// HEALTH CENTERS FUNCTIONS
// ========================================

async function getHealthCenters(filters = {}) {
    let query = supabase
        .from('health_centers')
        .select('*');

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.has_emergency) {
        query = query.eq('has_emergency', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching health centers:', error);
        return [];
    }

    return data;
}

// ========================================
// DOCTORS FUNCTIONS
// ========================================

async function getDoctors(filters = {}) {
    let query = supabase
        .from('doctors')
        .select('*');

    if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
    }

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.accepts_new_patients) {
        query = query.eq('accepts_new_patients', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }

    return data;
}

async function getDoctorById(id) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching doctor:', error);
        return null;
    }

    return data;
}

// ========================================
// APPOINTMENTS FUNCTIONS
// ========================================

async function createAppointment(appointmentData) {
    const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();

    if (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function getAppointmentsByDoctor(doctorId) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }

    return data;
}

async function updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status: status })
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function deleteAppointment(appointmentId) {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ========================================
// PRODUCTS FUNCTIONS
// ========================================

async function getProductsByPharmacy(pharmacyId) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('pharmacy_id', pharmacyId);

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

async function updateProduct(productId, updates) {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select();

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product: data[0] };
}

async function createProduct(productData) {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product: data[0] };
}

async function deleteProduct(productId) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ========================================
// REVIEWS FUNCTIONS
// ========================================

async function getReviews(entityType, entityId) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data;
}

async function createReview(reviewData) {
    const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select();

    if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: error.message };
    }

    return { success: true, review: data[0] };
}

// ========================================
// PATIENTS FUNCTIONS
// ========================================

async function getPatientsByDoctor(doctorId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('last_visit', { ascending: false });

    if (error) {
        console.error('Error fetching patients:', error);
        return [];
    }

    return data;
}

async function createPatient(patientData) {
    const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

    if (error) {
        console.error('Error creating patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, patient: data[0] };
}

async function updatePatient(patientId, updates) {
    const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select();

    if (error) {
        console.error('Error updating patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, patient: data[0] };
}

async function deletePatient(patientId) {
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

    if (error) {
        console.error('Error deleting patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function getPatientById(patientId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

    if (error) {
        console.error('Error fetching patient:', error);
        return null;
    }

    return data;
}

// ========================================
// ENHANCED APPOINTMENTS FUNCTIONS
// ========================================

async function updateAppointment(appointmentId, updates) {
    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function getAppointmentsByDateRange(doctorId, startDate, endDate) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments by date range:', error);
        return [];
    }

    return data;
}

// ========================================
// DOCTOR PROFILE FUNCTIONS
// ========================================

async function getDoctorProfile(doctorId) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

    if (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
    }

    return data;
}

async function getDoctorProfileByUserId(userId) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching doctor profile by user ID:', error);
        return null;
    }

    return data;
}

async function updateDoctorProfile(doctorId, profileData) {
    const { data, error } = await supabase
        .from('doctors')
        .update(profileData)
        .eq('id', doctorId)
        .select();

    if (error) {
        console.error('Error updating doctor profile:', error);
        return { success: false, error: error.message };
    }

    return { success: true, profile: data[0] };
}

// Export functions
window.supabaseAPI = {
    // Auth
    signUp,
    signIn,
    signOut,
    getCurrentUser,

    // Pharmacies
    getPharmacies,
    getPharmacyById,
    searchPharmaciesByProduct,

    // Health Centers
    getHealthCenters,

    // Doctors
    getDoctors,
    getDoctorById,
    getDoctorProfile,
    getDoctorProfileByUserId,
    updateDoctorProfile,

    // Appointments
    createAppointment,
    getAppointmentsByDoctor,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange,

    // Patients
    getPatientsByDoctor,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,

    // Products
    getProductsByPharmacy,
    updateProduct,
    createProduct,
    deleteProduct,

    // Reviews
    getReviews,
    createReview
};

console.log('✅ Supabase API initialized');
