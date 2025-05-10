// Authentication verification utility
function verifyAdminAuth() {
  // Get authentication data from localStorage
  const userRole = localStorage.getItem("userRole")
  const authToken = localStorage.getItem("authToken")

  // Debug information
  console.log("Auth Check - Role:", userRole)
  console.log("Auth Check - Token exists:", !!authToken)

  // Verify admin role and token existence
  if (!authToken || !userRole || userRole !== "ADMIN") {
    console.error("Authentication verification failed")
    return false
  }

  // Parse token to check if it's valid
  try {
    // Most tokens are in format: Bearer base64string
    // We're just checking basic structure here
    if (authToken.startsWith("Bearer ") && authToken.length > 10) {
      return true
    } else {
      console.error("Token format is invalid")
      return false
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    return false
  }
}

// Function to fix the redirect loop issue
function fixAdminRedirectIssue() {
  // Flag to prevent multiple redirects
  const redirectAttempted = sessionStorage.getItem("redirectAttempted")

  // If we've already tried to redirect once in this session, don't try again
  if (redirectAttempted === "true") {
    console.log("Preventing redirect loop - already attempted redirect")
    return
  }

  // Check if we're on the admin dashboard page
  const isAdminPage = window.location.href.includes("Dashboard_admin.html")

  if (isAdminPage) {
    // Set the flag to prevent future redirects in this session
    sessionStorage.setItem("redirectAttempted", "true")

    // Only redirect if authentication fails
    if (!verifyAdminAuth()) {
      console.log("Authentication failed, redirecting to login")
      window.location.href = "../html/login.html"
    } else {
      console.log("Authentication successful, staying on admin page")
    }
  }
}

// Run the fix when the DOM is loaded
document.addEventListener("DOMContentLoaded", fixAdminRedirectIssue)