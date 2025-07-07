// Global Variables
let currentRole = "voyager";
let currentUser = null;
let cart = [];
let orders = [];
let bookings = [];

// Default Users for Demo
let users = {
  voyager: [
    {
      username: "john_doe",
      password: "password123",
      email: "john@example.com",
    },
    {
      username: "jane_smith",
      password: "password123",
      email: "jane@example.com",
    },
  ],
  admin: [
    { username: "admin", password: "admin123", email: "admin@cruise.com" },
  ],
  manager: [
    {
      username: "manager",
      password: "manager123",
      email: "manager@cruise.com",
    },
  ],
  "head-cook": [
    { username: "headcook", password: "cook123", email: "cook@cruise.com" },
  ],
  supervisor: [
    {
      username: "supervisor",
      password: "super123",
      email: "supervisor@cruise.com",
    },
  ],
};

// Menu Items Data
let menuItems = {
  food: [
    {
      id: 1,
      name: "Grilled Salmon",
      price: 25.99,
      description: "Fresh Atlantic salmon with herbs",
    },
    {
      id: 2,
      name: "Beef Steak",
      price: 32.99,
      description: "Premium ribeye steak",
    },
    {
      id: 3,
      name: "Chicken Pasta",
      price: 18.99,
      description: "Creamy alfredo pasta",
    },
    {
      id: 4,
      name: "Caesar Salad",
      price: 12.99,
      description: "Fresh romaine lettuce",
    },
  ],
  beverages: [
    {
      id: 11,
      name: "Wine Selection",
      price: 15.99,
      description: "Premium house wine",
    },
    {
      id: 12,
      name: "Fresh Juice",
      price: 8.99,
      description: "Assorted fruit juices",
    },
    {
      id: 13,
      name: "Premium Coffee",
      price: 4.99,
      description: "Freshly brewed coffee",
    },
    {
      id: 14,
      name: "Signature Cocktails",
      price: 12.99,
      description: "House specialty cocktails",
    },
  ],
  snacks: [
    {
      id: 21,
      name: "Mixed Nuts",
      price: 6.99,
      description: "Assorted premium nuts",
    },
    {
      id: 22,
      name: "Fruit Platter",
      price: 9.99,
      description: "Fresh seasonal fruits",
    },
    {
      id: 23,
      name: "Cheese Board",
      price: 16.99,
      description: "Artisan cheese selection",
    },
    {
      id: 24,
      name: "Chocolate Treats",
      price: 8.99,
      description: "Gourmet chocolates",
    },
  ],
};

// Toast Function - Define early to avoid errors
function showToast(message, type = "success") {
  console.log(`🍞 Toast: [${type.toUpperCase()}] ${message}`);

  const toast = document.getElementById("toast");
  if (!toast) {
    console.warn("⚠️ Toast element not found, using console log");
    return;
  }

  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Storage Functions - Define early
function saveToStorage() {
  try {
    const data = { users, orders, bookings, currentUser };
    localStorage.setItem("cruiseData", JSON.stringify(data));
    console.log("💾 Data saved to localStorage");
  } catch (error) {
    console.error("❌ Failed to save to localStorage:", error);
  }
}

function loadFromStorage() {
  try {
    const data = JSON.parse(localStorage.getItem("cruiseData") || "{}");

    if (data.users) {
      users = { ...users, ...data.users }; // Merge with defaults
      console.log("📁 Users loaded from storage");
    }
    if (data.orders) orders = data.orders;
    if (data.bookings) bookings = data.bookings;
    if (data.currentUser) {
      currentUser = data.currentUser;
      console.log("👤 Current user loaded from storage:", currentUser);
      // Don't auto-show dashboard on load, let user login
    }

    console.log("📁 Data loaded from localStorage");
  } catch (error) {
    console.error("❌ Failed to load from localStorage:", error);
  }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚢 Cruise Ship Management System Starting...");
  console.log("👥 Available users:", users);

  // Load storage first
  loadFromStorage();

  // Setup event listeners
  setupEventListeners();

  // Initialize demo data
  initializeDemoData();

  console.log("✅ Application initialization complete");
});

// Setup Event Listeners
function setupEventListeners() {
  console.log("⚙️ Setting up event listeners...");

  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
    console.log("✅ Login form listener added");
  } else {
    console.error("❌ Login form not found");
  }

  // Registration Form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
    console.log("✅ Register form listener added");
  } else {
    console.error("❌ Register form not found");
  }

  // Modal overlay click to close
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeModal);
  }

  console.log("✅ Event listeners setup complete");
}

// Role Selection
function selectRole(role) {
  console.log(`🎭 Selecting role: ${role}`);
  currentRole = role;
  document
    .querySelectorAll(".role-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event && event.target) {
    event.target.classList.add("active");
  }
  console.log(`✅ Role selected: ${role}`);
}

// Authentication Functions
function handleLogin(e) {
  e.preventDefault();
  console.log("🔐 Login attempt started...");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (!usernameInput || !passwordInput) {
    console.error("❌ Username or password input not found");
    showToast("Form elements not found!", "error");
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  console.log(
    `📝 Login details - Username: "${username}", Role: "${currentRole}"`
  );

  if (!username || !password) {
    console.warn("⚠️ Username or password is empty");
    showToast("Please enter username and password", "error");
    return;
  }

  // Check authentication
  console.log(`🔍 Checking authentication for role: ${currentRole}`);

  if (authenticateUser(username, password, currentRole)) {
    console.log("✅ Authentication successful!");
    currentUser = { username, role: currentRole };
    saveToStorage();
    showDashboard(currentRole);
    showToast(`Welcome ${username}!`, "success");

    // Clear form
    usernameInput.value = "";
    passwordInput.value = "";
  } else {
    console.error("❌ Authentication failed");
    console.log(`🔍 Available users for ${currentRole}:`, users[currentRole]);
    showToast(
      "Invalid credentials! Please check username and password.",
      "error"
    );
  }
}

function authenticateUser(username, password, role) {
  console.log(`🔍 Authenticating user: ${username} for role: ${role}`);

  const roleUsers = users[role] || [];
  console.log(`📋 Users for role ${role}:`, roleUsers);

  const user = roleUsers.find((user) => {
    return user.username === username && user.password === password;
  });

  const isAuthenticated = !!user;
  console.log(`🎯 Authentication result: ${isAuthenticated}`);

  return isAuthenticated;
}

// Dashboard Functions
function showDashboard(role) {
  console.log(`📊 Attempting to show dashboard for role: ${role}`);

  // Hide auth container
  const authContainer = document.getElementById("authContainer");
  if (authContainer) {
    authContainer.style.display = "none";
    console.log("✅ Auth container hidden");
  }

  // Hide all dashboards first
  document.querySelectorAll(".dashboard").forEach((dashboard) => {
    dashboard.style.display = "none";
  });

  // Determine dashboard ID
  const dashboardId =
    role === "head-cook" ? "headcookDashboard" : role + "Dashboard";
  console.log(`🎯 Looking for dashboard: ${dashboardId}`);

  const dashboard = document.getElementById(dashboardId);

  if (dashboard) {
    dashboard.style.display = "block";
    dashboard.classList.add("fade-in");

    // Update welcome message
    const welcomeElement = dashboard.querySelector(".user-info span");
    if (welcomeElement && currentUser) {
      welcomeElement.textContent = `Welcome, ${currentUser.username}!`;
    }

    console.log(`✅ Dashboard ${dashboardId} displayed successfully`);
  } else {
    console.error(`❌ Dashboard not found: ${dashboardId}`);
    showToast("Dashboard not found for this role.", "error");
  }
}

function logout() {
  console.log("🚪 User logging out...");

  const username = currentUser?.username || "Unknown";

  // Clear data
  currentUser = null;
  currentRole = "voyager";
  cart = [];

  // Show auth container and hide dashboards
  document.querySelectorAll(".dashboard").forEach((dashboard) => {
    dashboard.style.display = "none";
  });

  const authContainer = document.getElementById("authContainer");
  if (authContainer) {
    authContainer.style.display = "block";
  }

  // Reset forms
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();

  showLogin();

  // Reset role selection
  document
    .querySelectorAll(".role-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const firstRoleBtn = document.querySelector(".role-btn");
  if (firstRoleBtn) firstRoleBtn.classList.add("active");

  saveToStorage();
  showToast(`${username} logged out successfully!`, "success");
  console.log(`✅ User ${username} logged out`);
}

// Show/Hide Forms
function showRegister() {
  console.log("📝 Showing registration form");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) loginForm.style.display = "none";
  if (registerForm) registerForm.style.display = "block";
}

function showLogin() {
  console.log("🔐 Showing login form");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (registerForm) registerForm.style.display = "none";
  if (loginForm) loginForm.style.display = "block";
}

// Registration Handler
// Find this function in app.js and update:
function handleRegister(e) {
  e.preventDefault();
  console.log("📝 Registration attempt started...");

  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const email = document.getElementById("regEmail").value.trim();

  console.log(
    `📝 Registration details - Username: "${username}", Email: "${email}"`
  );

  if (!username || !password || !email) {
    showToast("Please fill all fields", "error");
    return;
  }

  // UPDATED: Make password validation more flexible
  if (password.length < 3) {
    // Changed from 8 to 3
    showToast("Password must be at least 3 characters long", "error");
    return;
  }

  // Check if username already exists
  if (users.voyager.find((user) => user.username === username)) {
    showToast(
      "Username already exists! Please choose a different one.",
      "error"
    );
    return;
  }

  // Add new user
  users.voyager.push({ username, password, email });
  console.log("✅ New voyager registered:", username);

  saveToStorage();
  showToast(
    "Registration successful! Please login with your credentials.",
    "success"
  );
  showLogin();
}

// Modal Functions
function openModal(modalId) {
  console.log(`🔓 Opening modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  const overlay = document.getElementById("modalOverlay");

  if (modal && overlay) {
    overlay.style.display = "block";
    modal.style.display = "block";

    // Initialize modal content based on type
    switch (modalId) {
      case "cateringModal":
        initializeCateringModal();
        break;
      default:
        showToast(`${modalId} feature coming soon!`, "info");
        break;
    }
  }
}

function closeModal() {
  console.log("🔒 Closing modal");
  const overlay = document.getElementById("modalOverlay");
  const modals = document.querySelectorAll(".modal");

  if (overlay) overlay.style.display = "none";
  modals.forEach((modal) => (modal.style.display = "none"));
}

function initializeCateringModal() {
  // Initialize catering modal with food category
  showCategory("food");
  updateCart();
}

function showCategory(category) {
  console.log(`📋 Showing category: ${category}`);

  // Update active category button
  document
    .querySelectorAll(".category-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event && event.target) {
    event.target.classList.add("active");
  }

  const menuItemsContainer = document.getElementById("menuItems");
  if (!menuItemsContainer) {
    console.error("❌ Menu items container not found");
    return;
  }

  menuItemsContainer.innerHTML = "";

  if (menuItems[category]) {
    menuItems[category].forEach((item) => {
      const itemElement = createMenuItemElement(item);
      menuItemsContainer.appendChild(itemElement);
    });
  }
}

function createMenuItemElement(item) {
  const div = document.createElement("div");
  div.className = "menu-item";
  div.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <div class="price">$${item.price}</div>
        <button class="add-to-cart" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
            <i class="fas fa-plus"></i> Add to Cart
        </button>
    `;
  return div;
}

// Cart Functions
function addToCart(id, name, price) {
  console.log(`🛒 Adding to cart: ${name} ($${price})`);

  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  updateCart();
  showToast(`${name} added to cart!`, "success");
}

function removeFromCart(id) {
  const item = cart.find((item) => item.id === id);
  cart = cart.filter((item) => item.id !== id);
  updateCart();

  if (item) {
    showToast(`${item.name} removed from cart!`, "info");
  }
}

function updateCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  if (!cartItemsContainer || !cartTotalElement) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>
                $${(item.price * item.quantity).toFixed(2)}
                <button onclick="removeFromCart(${item.id})" 
                        style="margin-left: 10px; color: #ff6b6b; background: none; border: none; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        `;
    cartItemsContainer.appendChild(cartItem);
  });

  cartTotalElement.textContent = total.toFixed(2);
}

function placeOrder(type) {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to place order.", "error");
    return;
  }

  const order = {
    id: Date.now(),
    type: type,
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: "pending",
    timestamp: Date.now(),
    user: currentUser.username,
  };

  orders.push(order);
  cart = [];
  updateCart();
  saveToStorage();

  closeModal();
  showToast(`Order #${order.id} placed successfully!`, "success");
  console.log("✅ Order placed:", order);
}

// View Functions for Staff
function viewBookings(type) {
  console.log(`👀 Viewing ${type} bookings`);
  const typeBookings = bookings.filter((booking) => booking.type === type);
  const content = generateBookingsTable(typeBookings);
  showDataModal(
    `${type.charAt(0).toUpperCase() + type.slice(1)} Bookings`,
    content
  );
}

function viewOrders(type) {
  console.log(`👀 Viewing ${type} orders`);
  const typeOrders = orders.filter((order) => order.type === type);
  const content = generateOrdersTable(typeOrders);
  showDataModal(
    `${type.charAt(0).toUpperCase() + type.slice(1)} Orders`,
    content
  );
}

function generateBookingsTable(bookings) {
  if (bookings.length === 0) {
    return '<p style="text-align: center; padding: 40px; color: #666;">No bookings found.</p>';
  }

  let html =
    '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
  html +=
    '<thead><tr style="background: #f8f9fa;"><th style="padding: 10px; border: 1px solid #ddd;">ID</th><th style="padding: 10px; border: 1px solid #ddd;">User</th><th style="padding: 10px; border: 1px solid #ddd;">Details</th><th style="padding: 10px; border: 1px solid #ddd;">Status</th><th style="padding: 10px; border: 1px solid #ddd;">Date</th></tr></thead>';
  html += "<tbody>";

  bookings.forEach((booking) => {
    const detailsText =
      typeof booking.details === "object"
        ? Object.entries(booking.details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : booking.details;

    html += `<tr>
            <td style="padding: 10px; border: 1px solid #ddd;">#${
              booking.id
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              booking.user
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${detailsText}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: green;">${
              booking.status
            }</span></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
              booking.timestamp
            ).toLocaleDateString()}</td>
        </tr>`;
  });

  html += "</tbody></table>";
  return html;
}

function generateOrdersTable(orders) {
  if (orders.length === 0) {
    return '<p style="text-align: center; padding: 40px; color: #666;">No orders found.</p>';
  }

  let html =
    '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
  html +=
    '<thead><tr style="background: #f8f9fa;"><th style="padding: 10px; border: 1px solid #ddd;">ID</th><th style="padding: 10px; border: 1px solid #ddd;">User</th><th style="padding: 10px; border: 1px solid #ddd;">Items</th><th style="padding: 10px; border: 1px solid #ddd;">Total</th><th style="padding: 10px; border: 1px solid #ddd;">Status</th><th style="padding: 10px; border: 1px solid #ddd;">Date</th></tr></thead>';
  html += "<tbody>";

  orders.forEach((order) => {
    const itemsList = order.items
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");
    html += `<tr>
            <td style="padding: 10px; border: 1px solid #ddd;">#${order.id}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              order.user
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${itemsList}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">$${order.total.toFixed(
              2
            )}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: orange;">${
              order.status
            }</span></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
              order.timestamp
            ).toLocaleDateString()}</td>
        </tr>`;
  });

  html += "</tbody></table>";
  return html;
}

function showDataModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-table"></i> ${title}</h3>
                <span class="close" onclick="this.closest('.modal').remove(); document.getElementById('modalOverlay').style.display='none';">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  document.getElementById("modalOverlay").style.display = "block";
}

// Demo Data Initialization
function initializeDemoData() {
  console.log("🎭 Initializing demo data...");
  console.log("👥 Demo users available:");

  Object.keys(users).forEach((role) => {
    console.log(`  ${role.toUpperCase()}:`);
    users[role].forEach((user) => {
      console.log(
        `    - Username: ${user.username}, Password: ${user.password}`
      );
    });
  });

  // Add demo orders and bookings if none exist
  if (orders.length === 0) {
    orders.push({
      id: 1001,
      type: "catering",
      items: [{ name: "Grilled Salmon", price: 25.99, quantity: 1 }],
      total: 25.99,
      status: "pending",
      timestamp: Date.now() - 86400000,
      user: "john_doe",
    });
  }

  if (bookings.length === 0) {
    bookings.push({
      id: 2001,
      type: "movie",
      details: { movie: "Ocean Adventure", time: "8:00 PM" },
      status: "confirmed",
      timestamp: Date.now() - 43200000,
      user: "john_doe",
    });
  }

  saveToStorage();
  console.log("✅ Demo data initialized");
}

// Firebase Ready Callback
window.onFirebaseReady = function () {
  console.log("🔥 Firebase integration ready!");
  showToast("Connected to Firebase database!", "success");
};

// Error Handler
window.addEventListener("error", function (event) {
  console.error("❌ Application error:", event.error);
});

// Missing Booking Functions - Add these to app.js

// Global variables for selections
let selectedMovie = null;
let selectedService = null;
let selectedEquipment = null;
let selectedHall = null;

// Movie Booking Functions
function selectMovie(movie, time) {
  console.log(`🎬 Selecting movie: ${movie} at ${time}`);
  selectedMovie = { movie, time, price: 15 };

  // Update UI - mark selected
  document.querySelectorAll(".movie-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  console.log("✅ Movie selected:", selectedMovie);
}

function bookMovie() {
  console.log("🎬 Attempting to book movie...");

  if (!selectedMovie) {
    showToast("Please select a movie first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  makeBooking("movie", selectedMovie);
  closeModal();
}

// Beauty Salon Functions
function selectService(service, duration, price) {
  console.log(`💄 Selecting service: ${service}`);
  selectedService = { service, duration, price };

  document.querySelectorAll(".service-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  console.log("✅ Service selected:", selectedService);
}

function bookBeautySalon() {
  console.log("💄 Attempting to book beauty salon...");

  if (!selectedService) {
    showToast("Please select a service first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  makeBooking("beauty", selectedService);
  closeModal();
}

// Fitness Center Functions
function selectEquipment(equipment, duration, price) {
  console.log(`💪 Selecting equipment: ${equipment}`);
  selectedEquipment = { equipment, duration, price };

  document.querySelectorAll(".equipment-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  console.log("✅ Equipment selected:", selectedEquipment);
}

function bookFitnessCenter() {
  console.log("💪 Attempting to book fitness center...");

  if (!selectedEquipment) {
    showToast("Please select equipment first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  makeBooking("fitness", selectedEquipment);
  closeModal();
}

// Party Hall Functions
function selectHall(hall, capacity, price) {
  console.log(`🎉 Selecting hall: ${hall}`);
  selectedHall = { hall, capacity, price };

  document.querySelectorAll(".hall-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  console.log("✅ Hall selected:", selectedHall);
}

function bookPartyHall() {
  console.log("🎉 Attempting to book party hall...");

  if (!selectedHall) {
    showToast("Please select a hall first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  makeBooking("party", selectedHall);
  closeModal();
}

// Generic Booking Function
function makeBooking(type, details) {
  console.log(`📅 Making ${type} booking:`, details);

  const booking = {
    id: Date.now(),
    type: type,
    details: details,
    status: "confirmed",
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    user: currentUser.username,
    userId: currentUser.uid || currentUser.username,
  };

  // Save booking
  bookings.push(booking);
  saveToStorage();

  // Try Firebase save if available
  if (window.FirebaseHelper && window.FirebaseHelper.isReady()) {
    window.FirebaseHelper.saveBooking(booking)
      .then((result) => {
        if (result.success) {
          console.log("✅ Booking saved to Firebase:", result.bookingId);
        }
      })
      .catch((error) => {
        console.warn("⚠️ Firebase booking save failed:", error);
      });
  }

  showToast(
    `${type.charAt(0).toUpperCase() + type.slice(1)} booking confirmed!`,
    "success"
  );
  console.log("✅ Booking completed:", booking);

  // Reset selection
  resetSelections();
}

// Reset all selections
function resetSelections() {
  selectedMovie = null;
  selectedService = null;
  selectedEquipment = null;
  selectedHall = null;

  // Remove all selected classes
  document
    .querySelectorAll(".movie-item, .service-item, .equipment-item, .hall-item")
    .forEach((item) => {
      item.classList.remove("selected");
    });
}

// Stationery order function
function orderStationery(id, name, price) {
  console.log(`📝 Ordering stationery: ${name} ($${price})`);

  if (!currentUser) {
    showToast("Please login to place order.", "error");
    return;
  }

  const order = {
    id: Date.now(),
    type: "stationery",
    items: [{ id, name, price, quantity: 1 }],
    total: price,
    status: "pending",
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    user: currentUser.username,
    userId: currentUser.uid || currentUser.username,
  };

  orders.push(order);
  saveToStorage();

  // Try Firebase save if available
  if (window.FirebaseHelper && window.FirebaseHelper.isReady()) {
    window.FirebaseHelper.saveOrder(order)
      .then((result) => {
        if (result.success) {
          console.log("✅ Stationery order saved to Firebase:", result.orderId);
        }
      })
      .catch((error) => {
        console.warn("⚠️ Firebase order save failed:", error);
      });
  }

  closeModal();
  showToast(`${name} ordered successfully!`, "success");
  console.log("✅ Stationery order completed:", order);
}

// Enhanced Selection Functions - Add to app.js

// Movie Selection with UI Updates
function selectMovie(movie, time) {
  console.log(`🎬 Selecting movie: ${movie} at ${time}`);
  selectedMovie = { movie, time, price: 15 };

  // Update UI - mark selected
  document.querySelectorAll(".movie-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Update selection info
  const selectionInfo = document.getElementById("movieSelection");
  if (selectionInfo) {
    selectionInfo.innerHTML = `✅ Selected: <strong>${movie}</strong> at ${time} - $15`;
    selectionInfo.parentElement.classList.add("selected");
  }

  // Enable booking button
  const bookBtn = document.getElementById("bookMovieBtn");
  if (bookBtn) {
    bookBtn.disabled = false;
    bookBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Book ' + movie;
  }

  console.log("✅ Movie selected:", selectedMovie);
}

// Beauty Service Selection
function selectService(service, duration, price) {
  console.log(`💄 Selecting service: ${service}`);
  selectedService = { service, duration, price };

  document.querySelectorAll(".service-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Update selection info
  const selectionInfo = document.getElementById("serviceSelection");
  if (selectionInfo) {
    selectionInfo.innerHTML = `✅ Selected: <strong>${service}</strong> (${duration}) - ${price}`;
    selectionInfo.parentElement.classList.add("selected");
  }

  // Enable booking button
  const bookBtn = document.getElementById("bookBeautyBtn");
  if (bookBtn) {
    bookBtn.disabled = false;
    bookBtn.innerHTML = '<i class="fas fa-spa"></i> Book ' + service;
  }

  console.log("✅ Service selected:", selectedService);
}

// Fitness Equipment Selection
function selectEquipment(equipment, duration, price) {
  console.log(`💪 Selecting equipment: ${equipment}`);
  selectedEquipment = { equipment, duration, price };

  document.querySelectorAll(".equipment-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Update selection info
  const selectionInfo = document.getElementById("equipmentSelection");
  if (selectionInfo) {
    selectionInfo.innerHTML = `✅ Selected: <strong>${equipment}</strong> (${duration}) - ${price}`;
    selectionInfo.parentElement.classList.add("selected");
  }

  // Enable booking button
  const bookBtn = document.getElementById("bookFitnessBtn");
  if (bookBtn) {
    bookBtn.disabled = false;
    bookBtn.innerHTML = '<i class="fas fa-dumbbell"></i> Book ' + equipment;
  }

  console.log("✅ Equipment selected:", selectedEquipment);
}

// Party Hall Selection
function selectHall(hall, capacity, price) {
  console.log(`🎉 Selecting hall: ${hall}`);
  selectedHall = { hall, capacity, price };

  document.querySelectorAll(".hall-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Update selection info
  const selectionInfo = document.getElementById("hallSelection");
  if (selectionInfo) {
    selectionInfo.innerHTML = `✅ Selected: <strong>${hall}</strong> (${capacity}) - ${price}`;
    selectionInfo.parentElement.classList.add("selected");
  }

  // Enable booking button
  const bookBtn = document.getElementById("bookPartyBtn");
  if (bookBtn) {
    bookBtn.disabled = false;
    bookBtn.innerHTML = '<i class="fas fa-birthday-cake"></i> Book ' + hall;
  }

  console.log("✅ Hall selected:", selectedHall);
}

// Enhanced Booking Functions with Loading States
function bookMovie() {
  console.log("🎬 Attempting to book movie...");

  if (!selectedMovie) {
    showToast("Please select a movie first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  // Show loading state
  const bookBtn = document.getElementById("bookMovieBtn");
  if (bookBtn) {
    bookBtn.classList.add("loading");
    bookBtn.disabled = true;
  }

  // Simulate booking process
  setTimeout(() => {
    makeBooking("movie", selectedMovie);
    showBookingSuccess("Movie ticket booked successfully!");
    setTimeout(() => closeModal(), 2000);
  }, 1000);
}

function bookBeautySalon() {
  console.log("💄 Attempting to book beauty salon...");

  if (!selectedService) {
    showToast("Please select a service first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  const bookBtn = document.getElementById("bookBeautyBtn");
  if (bookBtn) {
    bookBtn.classList.add("loading");
    bookBtn.disabled = true;
  }

  setTimeout(() => {
    makeBooking("beauty", selectedService);
    showBookingSuccess("Beauty salon appointment booked!");
    setTimeout(() => closeModal(), 2000);
  }, 1000);
}

function bookFitnessCenter() {
  console.log("💪 Attempting to book fitness center...");

  if (!selectedEquipment) {
    showToast("Please select equipment first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  const bookBtn = document.getElementById("bookFitnessBtn");
  if (bookBtn) {
    bookBtn.classList.add("loading");
    bookBtn.disabled = true;
  }

  setTimeout(() => {
    makeBooking("fitness", selectedEquipment);
    showBookingSuccess("Fitness center time booked!");
    setTimeout(() => closeModal(), 2000);
  }, 1000);
}

function bookPartyHall() {
  console.log("🎉 Attempting to book party hall...");

  if (!selectedHall) {
    showToast("Please select a hall first!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please login to make booking.", "error");
    return;
  }

  const bookBtn = document.getElementById("bookPartyBtn");
  if (bookBtn) {
    bookBtn.classList.add("loading");
    bookBtn.disabled = true;
  }

  setTimeout(() => {
    makeBooking("party", selectedHall);
    showBookingSuccess("Party hall reserved successfully!");
    setTimeout(() => closeModal(), 2000);
  }, 1000);
}

// Show booking success message
function showBookingSuccess(message) {
  const modalBody = event.target.closest(".modal-body");
  if (modalBody) {
    const successDiv = document.createElement("div");
    successDiv.className = "booking-success";
    successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 2em; margin-bottom: 10px;"></i>
            <h4>${message}</h4>
            <p>Check your bookings in the dashboard!</p>
        `;
    modalBody.appendChild(successDiv);
  }
}

// Reset selections when opening modals
function resetModalSelections() {
  selectedMovie = null;
  selectedService = null;
  selectedEquipment = null;
  selectedHall = null;

  // Reset all UI states
  document.querySelectorAll(".selectable-item").forEach((item) => {
    item.classList.remove("selected");
  });

  document.querySelectorAll(".selection-info").forEach((info) => {
    info.classList.remove("selected");
  });

  // Reset selection info texts
  const movieSelection = document.getElementById("movieSelection");
  if (movieSelection)
    movieSelection.innerHTML = "👆 Please select a movie above";

  const serviceSelection = document.getElementById("serviceSelection");
  if (serviceSelection)
    serviceSelection.innerHTML = "👆 Please select a service above";

  const equipmentSelection = document.getElementById("equipmentSelection");
  if (equipmentSelection)
    equipmentSelection.innerHTML = "👆 Please select equipment above";

  const hallSelection = document.getElementById("hallSelection");
  if (hallSelection) hallSelection.innerHTML = "👆 Please select a hall above";

  // Disable all booking buttons
  const buttons = [
    "bookMovieBtn",
    "bookBeautyBtn",
    "bookFitnessBtn",
    "bookPartyBtn",
  ];
  buttons.forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = true;
      btn.classList.remove("loading");
    }
  });
}

// Enhanced modal opening with reset
function openModal(modalId) {
  console.log(`🔓 Opening modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  const overlay = document.getElementById("modalOverlay");

  if (modal && overlay) {
    overlay.style.display = "block";
    modal.style.display = "block";

    // Reset selections for booking modals
    if (
      ["movieModal", "beautyModal", "fitnessModal", "partyModal"].includes(
        modalId
      )
    ) {
      resetModalSelections();
    }

    // Initialize modal content based on type
    switch (modalId) {
      case "cateringModal":
        initializeCateringModal();
        break;
      case "stationeryModal":
        loadStationeryItems();
        break;
      case "movieModal":
        // Movie options are already in HTML
        break;
      case "beautyModal":
        // Beauty services are already in HTML
        break;
      case "fitnessModal":
        // Fitness equipment is already in HTML
        break;
      case "partyModal":
        // Party halls are already in HTML
        break;
      default:
        showToast(`${modalId} feature coming soon!`, "info");
        break;
    }
  }
}

// Enhanced close modal with cleanup
function closeModal() {
  console.log("🔒 Closing modal");
  const overlay = document.getElementById("modalOverlay");
  const modals = document.querySelectorAll(".modal");

  if (overlay) overlay.style.display = "none";
  modals.forEach((modal) => {
    modal.style.display = "none";
    // Remove any success messages
    const successMessages = modal.querySelectorAll(".booking-success");
    successMessages.forEach((msg) => msg.remove());
  });

  // Reset selections
  resetModalSelections();
}

// Add this function to app.js

function loadStationeryItems() {
  console.log("📝 Loading stationery items...");

  const container = document.querySelector("#stationeryModal .modal-body");
  if (!container) {
    console.error("❌ Stationery modal body not found");
    return;
  }

  container.innerHTML = "<h4>Stationery Items - Click to Order</h4>";

  const itemsGrid = document.createElement("div");
  itemsGrid.className = "stationery-items";

  const stationeryItems = [
    {
      id: 31,
      name: "Premium Gift Box",
      price: 19.99,
      description: "Luxury gift box with cruise memorabilia",
    },
    {
      id: 32,
      name: "Chocolate Collection",
      price: 24.99,
      description: "Artisan chocolate collection in elegant box",
    },
    {
      id: 33,
      name: "Adventure Books",
      price: 12.99,
      description: "Collection of adventure and romance novels",
    },
    {
      id: 34,
      name: "Cruise Souvenirs",
      price: 15.99,
      description: "Exclusive cruise ship memorabilia",
    },
    {
      id: 35,
      name: "Postcard Set",
      price: 7.99,
      description: "Beautiful cruise destination postcards",
    },
    {
      id: 36,
      name: "Travel Journal",
      price: 13.99,
      description: "Premium leather-bound travel journal",
    },
  ];

  stationeryItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "stationery-item selectable-item";
    itemElement.onclick = () => orderStationery(item.id, item.name, item.price);
    itemElement.innerHTML = `
            <div class="selection-indicator">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="item-price">$${item.price}</div>
            <button class="btn btn-sm" style="margin-top: 10px;">
                <i class="fas fa-shopping-cart"></i> Order Now
            </button>
        `;
    itemsGrid.appendChild(itemElement);
  });

  container.appendChild(itemsGrid);
  console.log("✅ Stationery items loaded successfully");
}

// Enhanced orderStationery function
function orderStationery(id, name, price) {
  console.log(`📝 Ordering stationery: ${name} ($${price})`);

  if (!currentUser) {
    showToast("Please login to place order.", "error");
    return;
  }

  // Show loading state
  const clickedElement = event.currentTarget;
  const button = clickedElement.querySelector("button");
  if (button) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ordering...';
    button.disabled = true;
  }

  // Create order
  const order = {
    id: Date.now(),
    type: "stationery",
    items: [{ id, name, price, quantity: 1 }],
    total: price,
    status: "pending",
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    user: currentUser.username,
    userId: currentUser.uid || currentUser.username,
  };

  // Simulate order processing
  setTimeout(() => {
    orders.push(order);
    saveToStorage();

    // Try Firebase save if available
    if (window.FirebaseHelper && window.FirebaseHelper.isReady()) {
      window.FirebaseHelper.saveOrder(order)
        .then((result) => {
          if (result.success) {
            console.log(
              "✅ Stationery order saved to Firebase:",
              result.orderId
            );
          }
        })
        .catch((error) => {
          console.warn("⚠️ Firebase order save failed:", error);
        });
    }

    // Show success
    if (button) {
      button.innerHTML = '<i class="fas fa-check"></i> Ordered!';
      button.style.background = "#00b894";
    }

    showToast(`${name} ordered successfully!`, "success");
    console.log("✅ Stationery order completed:", order);

    // Close modal after delay
    setTimeout(() => {
      closeModal();
    }, 1500);
  }, 1000);
}

// Admin Dashboard Functions - Add to app.js

// Add Item Modal Content
function showAddItemModal() {
  const modal = createAdminModal(
    "Add Item",
    `
        <form id="addItemForm" class="admin-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="itemCategory">Category</label>
                    <select id="itemCategory" required>
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="beverages">Beverages</option>
                        <option value="snacks">Snacks</option>
                        <option value="stationery">Stationery</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemName">Item Name</label>
                    <input type="text" id="itemName" required placeholder="Enter item name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="itemPrice">Price ($)</label>
                    <input type="number" id="itemPrice" step="0.01" required placeholder="0.00">
                </div>
                <div class="form-group">
                    <label for="itemStock">Stock Quantity</label>
                    <input type="number" id="itemStock" required placeholder="0">
                </div>
            </div>
            <div class="form-group">
                <label for="itemDescription">Description</label>
                <textarea id="itemDescription" required placeholder="Enter item description"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `
  );

  // Add form submit handler
  document
    .getElementById("addItemForm")
    .addEventListener("submit", handleAddItem);
}

// Manage Items Modal Content
function showManageItemsModal() {
  let itemsHtml = '<div class="items-management">';

  // Show food items
  itemsHtml +=
    '<div class="category-section"><h4><i class="fas fa-utensils"></i> Food Items</h4>';
  menuItems.food.forEach((item) => {
    itemsHtml += createItemManagementCard(item, "food");
  });
  itemsHtml += "</div>";

  // Show beverages
  itemsHtml +=
    '<div class="category-section"><h4><i class="fas fa-coffee"></i> Beverages</h4>';
  menuItems.beverages.forEach((item) => {
    itemsHtml += createItemManagementCard(item, "beverages");
  });
  itemsHtml += "</div>";

  // Show snacks
  itemsHtml +=
    '<div class="category-section"><h4><i class="fas fa-cookie-bite"></i> Snacks</h4>';
  menuItems.snacks.forEach((item) => {
    itemsHtml += createItemManagementCard(item, "snacks");
  });
  itemsHtml += "</div>";

  itemsHtml += "</div>";

  createAdminModal("Manage Items", itemsHtml);
}

// Maintain Menu Modal Content
function showMaintainMenuModal() {
  const modal = createAdminModal(
    "Maintain Menu",
    `
        <div class="menu-maintenance">
            <div class="menu-stats">
                <div class="stat-card">
                    <i class="fas fa-utensils"></i>
                    <h3>${menuItems.food.length}</h3>
                    <p>Food Items</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-coffee"></i>
                    <h3>${menuItems.beverages.length}</h3>
                    <p>Beverages</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-cookie-bite"></i>
                    <h3>${menuItems.snacks.length}</h3>
                    <p>Snacks</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>${orders.length}</h3>
                    <p>Total Orders</p>
                </div>
            </div>
            <div class="menu-actions">
                <button class="btn btn-primary" onclick="showAddItemModal()">
                    <i class="fas fa-plus"></i> Add New Item
                </button>
                <button class="btn btn-secondary" onclick="showManageItemsModal()">
                    <i class="fas fa-edit"></i> Edit Items
                </button>
                <button class="btn btn-info" onclick="exportMenuData()">
                    <i class="fas fa-download"></i> Export Menu
                </button>
            </div>
        </div>
    `
  );
}

// Voyager Registration Modal Content
function showVoyagerRegistrationModal() {
  let voyagersHtml = '<div class="voyager-management">';
  voyagersHtml += '<div class="voyager-stats">';
  voyagersHtml += `<h4><i class="fas fa-users"></i> Registered Voyagers (${users.voyager.length})</h4>`;
  voyagersHtml += "</div>";

  voyagersHtml += '<div class="voyager-list">';
  users.voyager.forEach((voyager, index) => {
    voyagersHtml += `
            <div class="voyager-card">
                <div class="voyager-info">
                    <h5><i class="fas fa-user"></i> ${voyager.username}</h5>
                    <p><i class="fas fa-envelope"></i> ${voyager.email}</p>
                </div>
                <div class="voyager-actions">
                    <button class="btn btn-sm btn-danger" onclick="removeVoyager(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
  });
  voyagersHtml += "</div>";

  voyagersHtml += `
        <div class="add-voyager-section">
            <h4>Add New Voyager</h4>
            <form id="addVoyagerForm" class="admin-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="voyagerUsername">Username</label>
                        <input type="text" id="voyagerUsername" required>
                    </div>
                    <div class="form-group">
                        <label for="voyagerEmail">Email</label>
                        <input type="email" id="voyagerEmail" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="voyagerPassword">Password</label>
                    <input type="password" id="voyagerPassword" required>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-user-plus"></i> Add Voyager
                </button>
            </form>
        </div>
    `;

  voyagersHtml += "</div>";

  createAdminModal("Voyager Registration", voyagersHtml);

  // Add form handler
  document
    .getElementById("addVoyagerForm")
    .addEventListener("submit", handleAddVoyager);
}

// Helper Functions
function createAdminModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "modal admin-modal";
  modal.style.display = "block";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-cog"></i> ${title}</h3>
                <span class="close" onclick="this.closest('.modal').remove(); document.getElementById('modalOverlay').style.display='none';">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  document.getElementById("modalOverlay").style.display = "block";
  return modal;
}

function createItemManagementCard(item, category) {
  return `
        <div class="item-card">
            <div class="item-info">
                <h5>${item.name}</h5>
                <p>${item.description}</p>
                <span class="item-price">$${item.price}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-primary" onclick="editItem(${item.id}, '${category}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id}, '${category}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Event Handlers
function handleAddItem(e) {
  e.preventDefault();

  const category = document.getElementById("itemCategory").value;
  const name = document.getElementById("itemName").value;
  const price = parseFloat(document.getElementById("itemPrice").value);
  const stock = parseInt(document.getElementById("itemStock").value);
  const description = document.getElementById("itemDescription").value;

  const newItem = {
    id: Date.now(),
    name: name,
    price: price,
    description: description,
    stock: stock,
  };

  if (category === "stationery") {
    // Add to stationery items
    const stationeryItems = JSON.parse(
      localStorage.getItem("stationeryItems") || "[]"
    );
    stationeryItems.push(newItem);
    localStorage.setItem("stationeryItems", JSON.stringify(stationeryItems));
  } else {
    // Add to menu items
    menuItems[category].push(newItem);
  }

  saveToStorage();
  showToast(`${name} added to ${category} successfully!`, "success");
  closeModal();

  console.log("✅ Item added:", newItem);
}

function handleAddVoyager(e) {
  e.preventDefault();

  const username = document.getElementById("voyagerUsername").value;
  const email = document.getElementById("voyagerEmail").value;
  const password = document.getElementById("voyagerPassword").value;

  // Check if username already exists
  if (users.voyager.find((user) => user.username === username)) {
    showToast("Username already exists!", "error");
    return;
  }

  const newVoyager = { username, email, password };
  users.voyager.push(newVoyager);
  saveToStorage();

  showToast(`Voyager ${username} added successfully!`, "success");
  closeModal();

  console.log("✅ Voyager added:", newVoyager);
}

function editItem(itemId, category) {
  const item = menuItems[category].find((item) => item.id === itemId);
  if (item) {
    const newName = prompt("Enter new name:", item.name);
    const newPrice = prompt("Enter new price:", item.price);
    const newDescription = prompt("Enter new description:", item.description);

    if (newName && newPrice && newDescription) {
      item.name = newName;
      item.price = parseFloat(newPrice);
      item.description = newDescription;

      saveToStorage();
      showToast("Item updated successfully!", "success");
      closeModal();
      showManageItemsModal(); // Refresh the modal
    }
  }
}

function deleteItem(itemId, category) {
  if (confirm("Are you sure you want to delete this item?")) {
    menuItems[category] = menuItems[category].filter(
      (item) => item.id !== itemId
    );
    saveToStorage();
    showToast("Item deleted successfully!", "success");
    closeModal();
    showManageItemsModal(); // Refresh the modal
  }
}

function removeVoyager(index) {
  if (confirm("Are you sure you want to remove this voyager?")) {
    const removedVoyager = users.voyager.splice(index, 1)[0];
    saveToStorage();
    showToast(
      `Voyager ${removedVoyager.username} removed successfully!`,
      "success"
    );
    closeModal();
    showVoyagerRegistrationModal(); // Refresh the modal
  }
}

function exportMenuData() {
  const menuData = {
    food: menuItems.food,
    beverages: menuItems.beverages,
    snacks: menuItems.snacks,
    exportDate: new Date().toISOString(),
    totalItems:
      menuItems.food.length +
      menuItems.beverages.length +
      menuItems.snacks.length,
  };

  const dataStr = JSON.stringify(menuData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "cruise-menu-data.json";
  link.click();

  showToast("Menu data exported successfully!", "success");
}

// Update openModal function to handle admin modals
const originalOpenModal = window.openModal;
window.openModal = function (modalId) {
  console.log(`🔓 Opening modal: ${modalId}`);

  switch (modalId) {
    case "addItemModal":
      showAddItemModal();
      break;
    case "manageItemsModal":
      showManageItemsModal();
      break;
    case "menuModal":
      showMaintainMenuModal();
      break;
    case "voyagerRegModal":
      showVoyagerRegistrationModal();
      break;
    default:
      // Call original function for other modals
      if (originalOpenModal) {
        originalOpenModal(modalId);
      }
      break;
  }
};

console.log("✅ Admin dashboard functions loaded successfully!");

console.log("✅ Enhanced selection functions loaded!");
console.log("✅ Booking functions loaded successfully!");

console.log("✅ Cruise Ship Management System loaded successfully!");
