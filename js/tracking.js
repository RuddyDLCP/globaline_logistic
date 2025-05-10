// Global variables
let map
let marker
let directionsRenderer
let progressInterval
let currentProgress = 45 // Initial progress value
let currentStep = 3 // Current step in the timeline (1-based index)

// Coordinates for Santo Domingo
const originLocation = { lat: 18.4861, lng: -69.9312 } // Santo Domingo Este
const destinationLocation = { lat: 18.514, lng: -69.9772 } // Santo Domingo Oeste, Pantoja
let currentLocation = { ...originLocation } // Start at origin

// Initialize the map
function initMap() {
  // Create the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation,
    zoom: 13,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  })

  // Create the directions renderer
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#519F44",
      strokeWeight: 5,
      strokeOpacity: 0.7,
    },
  })

  // Create the vehicle marker
  marker = new google.maps.Marker({
    position: currentLocation,
    map: map,
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/truck.png",
      scaledSize: new google.maps.Size(32, 32),
    },
    title: "Vehículo de entrega",
  })

  // Add destination marker
  new google.maps.Marker({
    position: destinationLocation,
    map: map,
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new google.maps.Size(32, 32),
    },
    title: "Destino",
  })

  // Calculate and display route
  const directionsService = new google.maps.DirectionsService()
  directionsService.route(
    {
      origin: originLocation,
      destination: destinationLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result)
        // Start the simulation
        startSimulation()
      }
    },
  )
}

// Start the delivery simulation
function startSimulation() {
  // Get the tracking number from URL
  const urlParams = new URLSearchParams(window.location.search)
  const trackingNumber = urlParams.get("tracking")

  // Display tracking number
  document.querySelector("#tracking-number span").textContent = trackingNumber || "GL-12345678"

  // Update progress bar
  updateProgressBar(currentProgress)

  // Start progress interval
  progressInterval = setInterval(() => {
    // Increment progress
    currentProgress += 0.5

    // Update progress bar
    updateProgressBar(currentProgress)

    // Update vehicle position
    updateVehiclePosition()

    // Update delivery status based on progress
    updateDeliveryStatus()

    // Stop when delivery is complete
    if (currentProgress >= 100) {
      clearInterval(progressInterval)
    }
  }, 1000)
}

// Update the progress bar
function updateProgressBar(progress) {
  const progressFill = document.getElementById("progress-fill")
  const progressPercentage = document.getElementById("progress-percentage")

  // Limit progress to 100%
  const limitedProgress = Math.min(100, progress)

  // Update the progress bar width
  progressFill.style.width = `${limitedProgress}%`

  // Update the percentage text
  progressPercentage.textContent = `${Math.round(limitedProgress)}%`
}

// Update the vehicle position on the map
function updateVehiclePosition() {
  if (currentProgress <= 100) {
    // Calculate new position based on progress
    const newLat = originLocation.lat + (destinationLocation.lat - originLocation.lat) * (currentProgress / 100)
    const newLng = originLocation.lng + (destinationLocation.lng - originLocation.lng) * (currentProgress / 100)

    // Update current location
    currentLocation = { lat: newLat, lng: newLng }

    // Update marker position
    marker.setPosition(currentLocation)

    // Center map on vehicle (optional, comment out if you prefer a static view)
    // map.panTo(currentLocation);
  }
}

// Update delivery status based on progress
function updateDeliveryStatus() {
  const statusText = document.querySelector(".status-text")
  const statusDot = document.querySelector(".status-dot")

  // Update timeline based on progress
  if (currentProgress >= 75 && currentProgress < 100 && currentStep === 3) {
    // Update to "Entregando" status
    statusText.textContent = "Entregando"

    // Change dot color to indicate delivery in progress
    statusDot.style.backgroundColor = "#f59e0b" // Warning/amber color

    // Update timeline
    const timelineItems = document.querySelectorAll(".timeline-item")
    timelineItems[2].classList.remove("active")
    timelineItems[3].classList.add("active")

    // Update timeline details
    timelineItems[3].querySelector(".timeline-details p:last-child").innerHTML =
      '<i class="fas fa-clock"></i> Hoy, 2:25 PM'

    // Update current step
    currentStep = 4
  } else if (currentProgress >= 100 && currentStep === 4) {
    // Update to "Entregado" status
    statusText.textContent = "Entregado"
    statusDot.style.backgroundColor = "#10B981" // Success color

    // Add success animation
    statusDot.style.animation = "none" // Reset animation
    setTimeout(() => {
      statusDot.style.animation = "pulse 2s infinite"
    }, 10)

    // Update timeline
    const timelineItems = document.querySelectorAll(".timeline-item")
    timelineItems[3].classList.remove("active")
    timelineItems[4].classList.add("active")
    timelineItems[4].classList.add("completed")

    // Update timeline icon
    timelineItems[4].querySelector(".timeline-icon i").className = "fas fa-check"

    // Update timeline details
    timelineItems[4].querySelector(".timeline-details p:last-child").innerHTML =
      '<i class="fas fa-clock"></i> Hoy, 2:30 PM'

    // Update current step
    currentStep = 5
  }
}

// Handle mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
  const navMenu = document.querySelector(".nav-menu")
  const headerButtons = document.querySelector(".header-buttons")

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      headerButtons.classList.toggle("active")
    })
  }
})