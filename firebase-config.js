// firebase-config.js - Corrected Firebase Configuration

const firebaseConfig = {
  apiKey: "AIzaSyDjzP_K_ywa4fFV3SEmbkKEmu3ducgVNv0",
  authDomain: "cruise-ship-management-cc4a4.firebaseapp.com",
  databaseURL:
    "https://cruise-ship-management-cc4a4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cruise-ship-management-cc4a4",
  storageBucket: "cruise-ship-management-cc4a4.firebasestorage.app",
  messagingSenderId: "162773094793",
  appId: "1:162773094793:web:76468cb88e8cd101f05158",
  measurementId: "G-38LHWCSBRV",
};

// Firebase SDK imports and initialization
let app, database, auth;

async function initializeFirebase() {
  try {
    console.log("🔄 Loading Firebase SDK...");

    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
    );
    const { getDatabase, ref, push, set, get, onValue, off } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
    );
    const {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
    } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
    );

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);

    console.log("✅ Firebase successfully initialized!");
    console.log("📊 Database URL:", firebaseConfig.databaseURL);
    console.log("🔐 Auth Domain:", firebaseConfig.authDomain);

    window.firebaseApp = app;
    window.firebaseDB = database;
    window.firebaseAuth = auth;
    window.firebaseUtils = {
      ref,
      push,
      set,
      get,
      onValue,
      off,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
    };

    await testFirebaseConnection();
    return true;
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    showToast("Firebase connection failed. Using offline mode.", "error");
    return false;
  }
}

async function testFirebaseConnection() {
  try {
    const { ref, get } = window.firebaseUtils;
    const testRef = ref(database, ".info/connected");
    const snapshot = await get(testRef);

    if (snapshot.exists()) {
      console.log("🌐 Firebase connection successful!");
      showToast("Connected to Firebase!", "success");
    }
  } catch (error) {
    console.warn("⚠️ Firebase connection test failed:", error);
  }
}

// Firebase Helper Functions
window.FirebaseHelper = {
  async registerUser(email, password, userData) {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { createUserWithEmailAndPassword } = window.firebaseUtils;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const { ref, set } = window.firebaseUtils;
      await set(ref(database, `users/voyagers/${user.uid}`), {
        ...userData,
        email: email,
        uid: user.uid,
        createdAt: Date.now(),
      });

      console.log("✅ User registered successfully:", user.uid);
      logAction(`User registered: ${userData.username}`);
      return { success: true, user };
    } catch (error) {
      console.error("❌ Registration failed:", error);
      return { success: false, error: error.message };
    }
  },

  async loginUser(email, password) {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { signInWithEmailAndPassword } = window.firebaseUtils;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const { ref, get } = window.firebaseUtils;
      const userDataRef = ref(database, `users/voyagers/${user.uid}`);
      const snapshot = await get(userDataRef);

      let userData = null;
      if (snapshot.exists()) {
        userData = snapshot.val();
      }

      console.log("✅ User logged in successfully:", user.uid);
      logAction(`User logged in: ${user.email}`);
      return { success: true, user, userData };
    } catch (error) {
      console.error("❌ Login failed:", error);
      return { success: false, error: error.message };
    }
  },

  async logoutUser() {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { signOut } = window.firebaseUtils;
      await signOut(auth);
      console.log("✅ User logged out successfully");
      logAction("User logged out");
      return { success: true };
    } catch (error) {
      console.error("❌ Logout failed:", error);
      return { success: false, error: error.message };
    }
  },

  async saveOrder(orderData) {
    try {
      if (!window.firebaseUtils) {
        console.warn("Firebase not available, saving to localStorage");
        return { success: false, error: "Firebase not initialized" };
      }

      const { ref, push, set } = window.firebaseUtils;
      const ordersRef = ref(database, "orders");
      const newOrderRef = push(ordersRef);

      const orderWithId = {
        ...orderData,
        id: newOrderRef.key,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      await set(newOrderRef, orderWithId);

      console.log("✅ Order saved successfully:", newOrderRef.key);
      logAction(`Order saved: ${orderData.type} - $${orderData.total}`);
      return { success: true, orderId: newOrderRef.key, order: orderWithId };
    } catch (error) {
      console.error("❌ Save order failed:", error);
      return { success: false, error: error.message };
    }
  },

  async saveBooking(bookingData) {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { ref, push, set } = window.firebaseUtils;
      const bookingsRef = ref(database, "bookings");
      const newBookingRef = push(bookingsRef);

      const bookingWithId = {
        ...bookingData,
        id: newBookingRef.key,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      await set(newBookingRef, bookingWithId);

      console.log("✅ Booking saved successfully:", newBookingRef.key);
      logAction(`Booking saved: ${bookingData.type}`);
      return {
        success: true,
        bookingId: newBookingRef.key,
        booking: bookingWithId,
      };
    } catch (error) {
      console.error("❌ Save booking failed:", error);
      return { success: false, error: error.message };
    }
  },

  async getOrders(filters = {}) {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { ref, get } = window.firebaseUtils;
      const ordersRef = ref(database, "orders");
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
          const order = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };

          // Apply filters
          if (filters.type && order.type !== filters.type) return;
          if (filters.userId && order.userId !== filters.userId) return;
          if (filters.status && order.status !== filters.status) return;

          orders.push(order);
        });

        // Sort by timestamp (newest first)
        orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log(`📊 Retrieved ${orders.length} orders from Firebase`);
        return { success: true, orders };
      }

      return { success: true, orders: [] };
    } catch (error) {
      console.error("❌ Get orders failed:", error);
      return { success: false, error: error.message };
    }
  },

  async getBookings(filters = {}) {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { ref, get } = window.firebaseUtils;
      const bookingsRef = ref(database, "bookings");
      const snapshot = await get(bookingsRef);

      if (snapshot.exists()) {
        const bookings = [];
        snapshot.forEach((childSnapshot) => {
          const booking = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };

          // Apply filters
          if (filters.type && booking.type !== filters.type) return;
          if (filters.userId && booking.userId !== filters.userId) return;
          if (filters.status && booking.status !== filters.status) return;

          bookings.push(booking);
        });

        // Sort by timestamp (newest first)
        bookings.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log(`📊 Retrieved ${bookings.length} bookings from Firebase`);
        return { success: true, bookings };
      }

      return { success: true, bookings: [] };
    } catch (error) {
      console.error("❌ Get bookings failed:", error);
      return { success: false, error: error.message };
    }
  },

  async updateOrderStatus(orderId, status, notes = "") {
    try {
      if (!window.firebaseUtils) {
        return { success: false, error: "Firebase not initialized" };
      }

      const { ref, set } = window.firebaseUtils;
      const orderRef = ref(database, `orders/${orderId}/status`);
      await set(orderRef, status);

      if (notes) {
        const notesRef = ref(database, `orders/${orderId}/notes`);
        await set(notesRef, notes);
      }

      const updatedRef = ref(database, `orders/${orderId}/updatedAt`);
      await set(updatedRef, Date.now());

      console.log("✅ Order status updated:", orderId, status);
      return { success: true };
    } catch (error) {
      console.error("❌ Update order status failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Check if Firebase is ready
  isReady() {
    return !!(window.firebaseApp && window.firebaseDB && window.firebaseAuth);
  },

  // Get current user
  getCurrentUser() {
    if (auth && auth.currentUser) {
      return auth.currentUser;
    }
    return null;
  },
};

// Utility function for logging
function logAction(action) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action}`);

  // Save to Firebase logs (optional)
  if (window.firebaseUtils && auth.currentUser) {
    const { ref, push, set } = window.firebaseUtils;
    const logsRef = ref(database, "logs");
    const newLogRef = push(logsRef);

    set(newLogRef, {
      userId: auth.currentUser.uid,
      action: action,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    }).catch((error) => console.warn("Log save failed:", error));
  }
}

// Page load hone pe Firebase initialize karte hain
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starting Cruise Ship Management System...");
  console.log("🔄 Initializing Firebase...");

  const success = await initializeFirebase();

  if (success) {
    console.log("🎉 Firebase is ready to use!");

    // Auth state listener setup karte hain
    if (window.firebaseUtils) {
      const { onAuthStateChanged } = window.firebaseUtils;
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("👤 User is signed in:", user.uid);
        } else {
          console.log("👤 User is signed out");
        }
      });
    }

    // Agar app.js mein koi onFirebaseReady function hai toh call karte hain
    if (typeof window.onFirebaseReady === "function") {
      window.onFirebaseReady();
    }
  } else {
    console.warn(
      "⚠️ Firebase initialization failed. Using localStorage fallback."
    );
  }
});

// Show toast notification (app.js se use karenge)
function showToast(message, type = "info") {
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Export for other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { firebaseConfig, initializeFirebase };
}
