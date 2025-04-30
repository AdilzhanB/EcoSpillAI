 // Set active navigation link based on current page
 document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  });
  
  // Initialize the map
  const map = L.map('map', {
    zoomControl: false,
    center: [42, 50], // Centered closer to Caspian Sea
    zoom: 5,
    minZoom: 2,
    worldCopyJump: true
  });
  
  // Add zoom control to custom position
  L.control.zoom({
    position: 'topright'
  }).addTo(map);
  
  // Use a light-themed tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  
  const monitoringHardware = [
    { 
      id: "15",
      apiEndpoint: "15",
      videoEndpoint: "https://videostream.com/station/15/live",
      status: "normal"
    },
    { 
      id: "16",
      apiEndpoint: "16",
      videoEndpoint: "https://videostream.com/station/16/live",
      status: "normal"
    },
    { 
      id: "arduino-uno1",
      apiEndpoint: "arduino-uno1",
      videoEndpoint: "https://videostream.com/station/16/live",
      status: "normal"
    }
  ];
  
  // Global markers object to keep track of all markers
  const deviceMarkers = {};
  
  // Function to add a new hardware device
  function addHardwareDevice(device) {
    monitoringHardware.push(device);
    addMarkerForDevice(device);
  }
  
  // Function to remove a hardware device
  function removeHardwareDevice(deviceId) {
    const index = monitoringHardware.findIndex(device => device.id === deviceId);
    if (index !== -1) {
      monitoringHardware.splice(index, 1);
      
      // Remove marker from map
      if (deviceMarkers[deviceId]) {
        map.removeLayer(deviceMarkers[deviceId]);
        delete deviceMarkers[deviceId];
      }
    }
  }
  
  // Create custom icon for monitoring hardware
  function createHardwareIcon(status) {
    let iconColor;
    
    switch(status) {
      case "warning":
        iconColor = "#f39c12";
        break;
      case "alert":
        iconColor = "#e74c3c";
        break;
      case "offline":
        iconColor = "#95a5a6";
        break;
      case "error":
        iconColor = "#c0392b";
        break;
      default:
        iconColor = "#2980b9"; // normal status
    }
    
    return L.divIcon({
      html: `<div class="custom-marker"><i class="fas fa-satellite-dish" style="color: ${iconColor};"></i></div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }
  
  // Function to show error notifications
  function showErrorNotification(deviceId, errorMessage) {
    const notification = document.createElement('div');
    notification.className = 'notification critical-error';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span><strong>Device ${deviceId}</strong>: ${errorMessage}</span>
      <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove notification after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }
    }, 10000);
    
    // Close button for notification
    notification.querySelector('.close-notification').addEventListener('click', () => {
      notification.remove();
    });
  }
  
  // Function to create popup for hardware
  function createHardwarePopup(hardware, coords) {
    return function() {
      const loadingIndicator = document.getElementById('loading');
      loadingIndicator.style.display = 'flex';
  
      // Fetch data from API
      fetch(`https://spilldataserver.onrender.com/api/sensor-data/${hardware.apiEndpoint}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch sensor data for ${hardware.id}. Response: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Use coordinates from API response
          const currentCoords = [data.latitude, data.longitude];
          hardware.lastKnownCoords = currentCoords; // Update stored coords
  
          // Update marker position if it changed
          if (deviceMarkers[hardware.id]) {
            deviceMarkers[hardware.id].setLatLng(currentCoords);
          }
  
          // Populate popup content with sensor data
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `
            <div class="data-container">
              <h3>${hardware.name || hardware.id}</h3>
              <div class="data-row">
                <span class="data-label">Temperature:</span>
                <span class="data-value">${data.temperature ? data.temperature + '°C' : "N/A"}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Humidity:</span>
                <span class="data-value">${data.humidity ? data.humidity + '%' : "N/A"}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Flow Rate:</span>
                <span class="data-value">${data.flow_rate ? data.flow_rate + ' L/min' : "0 L/min"}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Coordinates:</span>
                <span class="data-value">${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Status:</span>
                <span class="data-value">
                  <span class="data-status status-${hardware.status}"></span>
                  ${hardware.status.toUpperCase()}
                </span>
              </div>
              
              <!-- Added video placeholder that always appears -->
              <div class="video-container" id="video-${hardware.id}">
                <div class="video-placeholder">
                  <span>${hardware.videoEndpoint ? "Click to view live stream" : "No video feed available"}</span>
                </div>
                <i class="fas ${hardware.videoEndpoint ? "fa-play-circle" : "fa-video-slash"}"></i>
              </div>
            </div>
          `;
          loadingIndicator.style.display = 'none'; // Hide the loading indicator
  
          // Add click event to video container if video is available
          if (hardware.videoEndpoint) {
            const videoContainer = popupContent.querySelector(`#video-${hardware.id}`);
            videoContainer.addEventListener('click', () => {
              const fullscreenOverlay = document.getElementById('fullscreen-overlay');
              const fullscreenVideo = document.getElementById('fullscreen-video');
              
              // Set video content or placeholder
              fullscreenVideo.innerHTML = `
                <div class="video-placeholder">
                  <span>Live Stream from ${hardware.name || hardware.id}</span>
                  <p>Video feed URL: ${hardware.videoEndpoint}</p>
                </div>
              `;
              
              fullscreenOverlay.style.display = 'flex';
            });
          }
  
          // Show the popup content
          const popup = L.popup()
            .setLatLng(currentCoords)
            .setContent(popupContent)
            .openOn(map);
        })
        .catch(error => {
          console.error(`Error fetching data for ${hardware.id}:`, error);
          loadingIndicator.style.display = 'none'; // Hide the loading indicator
  
          // Show error notification
          showErrorNotification(hardware.id, "Failed to fetch sensor data for this device");
          
          // Update hardware status to error
          hardware.status = "error";
          if (deviceMarkers[hardware.id]) {
            deviceMarkers[hardware.id].setIcon(createHardwareIcon("error"));
          }
  
          // Use stored coords or current ones
          const currentCoords = hardware.lastKnownCoords || coords || [42, 50];
          
          // Create a popup showing the error but with placeholders for all data
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `
            <div class="data-container">
              <h3>${hardware.name || hardware.id}</h3>
              <div class="data-row">
                <span class="data-label">Temperature:</span>
                <span class="data-value">N/A</span>
              </div>
              <div class="data-row">
                <span class="data-label">Humidity:</span>
                <span class="data-value">N/A</span>
              </div>
              <div class="data-row">
                <span class="data-label">Flow Rate:</span>
                <span class="data-value">N/A</span>
              </div>
              <div class="data-row">
                <span class="data-label">Coordinates:</span>
                <span class="data-value">${currentCoords[0].toFixed(4)}, ${currentCoords[1].toFixed(4)}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Status:</span>
                <span class="data-value">
                  <span class="data-status status-error"></span>
                  ERROR
                </span>
              </div>
              <div class="data-row">
                <span class="data-label">Error:</span>
                <span class="data-value data-error">${error.message}</span>
              </div>
              
              <!-- Added video placeholder even in error state -->
              <div class="video-container">
                <div class="video-placeholder">
                  <span>No video feed available</span>
                </div>
                <i class="fas fa-video-slash"></i>
              </div>
            </div>
          `;
          
          const popup = L.popup()
            .setLatLng(currentCoords)
            .setContent(popupContent)
            .openOn(map);
        });
    };
  }
  
  // Function to generate device name from coordinates
  function generateDeviceNameFromCoords(coords) {
    return new Promise((resolve, reject) => {
      // Simulate reverse geocoding
      // In a real implementation, you would use a geocoding service
      setTimeout(() => {
        const lat = coords[0].toFixed(2);
        const lon = coords[1].toFixed(2);
        resolve(`Station ${lat},${lon}`);
      }, 100);
    });
  }
  
  // Function to add a marker for a device
  function addMarkerForDevice(hardware) {
    // If we already have stored coordinates, use them
    if (hardware.lastKnownCoords) {
      const marker = L.marker(hardware.lastKnownCoords, {
        icon: createHardwareIcon(hardware.status)
      }).addTo(map);
      
      // Add click handler to show sensor data
      marker.on('click', createHardwarePopup(hardware, hardware.lastKnownCoords));
      
      // Store marker reference
      deviceMarkers[hardware.id] = marker;
      
      return marker;
    }
    
    // Otherwise fetch coordinates from API
    return fetch(`https://spilldataserver.onrender.com/api/sensor-data/${hardware.apiEndpoint}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch sensor data for ${hardware.id}. Response: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Extract coordinates from API response
        const coords = [data.latitude, data.longitude];
        hardware.lastKnownCoords = coords;
        
        // Create marker with coordinates from API
        const marker = L.marker(coords, {
          icon: createHardwareIcon(hardware.status)
        }).addTo(map);
        
        // Add click handler
        marker.on('click', createHardwarePopup(hardware, coords));
        
        // Store marker reference
        deviceMarkers[hardware.id] = marker;
        
        return marker;
      })
      .catch(error => {
        console.error(`Error adding marker for ${hardware.id}:`, error);
        
        // Show error notification
        showErrorNotification(hardware.id, "Failed to fetch location data for this device");
        
        // Set default position for errors
        const defaultCoords = [42, 50]; // Default to map center
        hardware.lastKnownCoords = defaultCoords;
        hardware.status = "error";
        
        // Create marker with default coordinates
        const marker = L.marker(defaultCoords, {
          icon: createHardwareIcon("error")
        }).addTo(map);
        
        // Add click handler
        marker.on('click', createHardwarePopup(hardware, defaultCoords));
        
        // Store marker reference
        deviceMarkers[hardware.id] = marker;
        
        return marker;
      });
  }
  
  function initializeHardwareMarkers() {
    // Clear existing markers
    Object.values(deviceMarkers).forEach(marker => {
      map.removeLayer(marker);
    });
    
    // Reset markers object
    Object.keys(deviceMarkers).forEach(key => {
      delete deviceMarkers[key];
    });
    
    // Add markers for all hardware
    const promises = monitoringHardware.map(hardware => {
      return fetch(`https://spilldataserver.onrender.com/api/sensor-data/${hardware.apiEndpoint}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch sensor data for ${hardware.id}. Response: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Extract coordinates from API response
          const coords = [data.latitude, data.longitude];
          hardware.lastKnownCoords = coords;
          
          // Generate device name based on location
          return generateDeviceNameFromCoords(coords)
            .then(locationName => {
              // Add name property to hardware object
              hardware.name = `${locationName} (${hardware.id})`;
              
              // Create marker with coordinates from API
              const marker = L.marker(coords, {
                icon: createHardwareIcon(hardware.status)
              }).addTo(map);
              
              // Add click handler
              marker.on('click', createHardwarePopup(hardware, coords));
              
              // Store marker reference
              deviceMarkers[hardware.id] = marker;
              
              return marker;
            });
        })
        .catch(error => {
          console.error(`Error initializing ${hardware.id}:`, error);
          
          // Show error notification
          showErrorNotification(hardware.id, "Failed to fetch location data for this device");
          
          // Set default position for errors
          const defaultCoords = [42, 50]; // Default to map center
          hardware.lastKnownCoords = defaultCoords;
          hardware.status = "error";
          hardware.name = `Unknown Station (${hardware.id})`;
          
          // Create marker with default coordinates
          const marker = L.marker(defaultCoords, {
            icon: createHardwareIcon("error")
          }).addTo(map);
          
          // Add click handler
          marker.on('click', createHardwarePopup(hardware, defaultCoords));
          
          // Store marker reference
          deviceMarkers[hardware.id] = marker;
          
          return marker;
        });
    });
    
    return Promise.all(promises);
  }
  
  // Info panel functionality
  const infoButton = document.getElementById('info-button');
  const infoPanel = document.getElementById('info-panel');
  const panelClose = document.getElementById('panel-close');
  
  infoButton.addEventListener('click', () => {
    infoPanel.classList.toggle('active');
  });
  
  panelClose.addEventListener('click', () => {
    infoPanel.classList.remove('active');
  });
  
  // Reset map view
  const resetButton = document.getElementById('reset-button');
  resetButton.addEventListener('click', () => {
    map.setView([42, 50], 5);
  });
  
  // Improved user's location functionality
  const locationButton = document.getElementById('location-button');
  const loadingIndicator = document.getElementById('loading');
  let userLocationMarker = null;
  let userLocationCircle = null;
  
  locationButton.addEventListener('click', () => {
    loadingIndicator.style.display = 'flex';
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          
          // Remove previous user location marker and circle if they exist
          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }
          if (userLocationCircle) {
            map.removeLayer(userLocationCircle);
          }
          
          // Add a new marker for user location
          userLocationMarker = L.marker(userLocation, {
            icon: L.divIcon({
              html: `<div class="custom-marker"><i class="fas fa-user-circle" style="color: #3498db;"></i></div>`,
              className: '',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).addTo(map);
          
          // Add accuracy circle
          const accuracy = position.coords.accuracy;
          userLocationCircle = L.circle(userLocation, {
            radius: accuracy,
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.15
          }).addTo(map);
          
          // Center map on user location
          map.setView(userLocation, 13);
          
          // Create a popup for user location
          userLocationMarker.bindPopup(`
            <div class="data-container">
              <h3>Your Location</h3>
              <div class="data-row">
                <span class="data-label">Latitude:</span>
                <span class="data-value">${userLocation[0].toFixed(6)}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Longitude:</span>
                <span class="data-value">${userLocation[1].toFixed(6)}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Accuracy:</span>
                <span class="data-value">±${Math.round(accuracy)} meters</span>
              </div>
            </div>
          `).openPopup();
          
          loadingIndicator.style.display = 'none';
          
          // Find nearest monitoring hardware
          findNearestHardware(userLocation);
        },
        (error) => {
          loadingIndicator.style.display = 'none';
          
          // Handle error in a user-friendly way
          let errorMessage = 'Unable to retrieve your location.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += ' You denied the request for geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += ' Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += ' The request to get your location timed out.';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage += ' An unknown error occurred.';
              break;
          }
          
          // Create an error notification
          showErrorNotification("Location", errorMessage);
          
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      loadingIndicator.style.display = 'none';
      showErrorNotification("Browser", "Geolocation is not supported by your browser.");
    }
  });
  
  // Calculate distance between two coordinates in km (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  // Find nearest hardware to user location
  function findNearestHardware(userLocation) {
    let nearestDevice = null;
    let minDistance = Infinity;
    
    monitoringHardware.forEach(hardware => {
      if (!hardware.lastKnownCoords) return;
      
      const distance = calculateDistance(
        userLocation[0], userLocation[1],
        hardware.lastKnownCoords[0], hardware.lastKnownCoords[1]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestDevice = hardware;
      }
    });
    
    if (nearestDevice) {
      // Create a notification about nearest device
      const notification = document.createElement('div');
      notification.className = 'notification info';
      notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Nearest monitoring station: <strong>${nearestDevice.name || nearestDevice.id}</strong> (${Math.round(minDistance)} km away)</span>
        <button class="view-station" data-id="${nearestDevice.id}">View</button>
        <button class="close-notification"><i class="fas fa-times"></i></button>
      `;
      
      document.body.appendChild(notification);
      
      // Auto remove notification after 10 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 500);
        }
      }, 10000);
      
      // View station button
      notification.querySelector('.view-station').addEventListener('click', () => {
        map.setView(nearestDevice.lastKnownCoords, 13);
        createHardwarePopup(nearestDevice, nearestDevice.lastKnownCoords)();
        notification.remove();
      });
      
      // Close button for notification
      notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
      });
    }
  }
  
  // Function to update marker status based on sensor data
  function updateMarkerStatus(hardwareId, status) {
    const marker = deviceMarkers[hardwareId];
    if (marker) {
      marker.setIcon(createHardwareIcon(status));
      
      // Update status in the monitoring hardware array
      const device = monitoringHardware.find(d => d.id === hardwareId);
      if (device) {
        device.status = status;
      }
    }
  }
  
  // Function to periodically update all hardware status
  function startPeriodicUpdates() {
    // Update all hardware every 5 minutes
    setInterval(() => {
      monitoringHardware.forEach(hardware => {
        // Only fetch new data for hardware that's not offline
        if (hardware.status !== "offline" && hardware.status !== "error") {
          fetch(`https://spilldataserver.onrender.com/api/sensor-data/${hardware.apiEndpoint}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              // Update coordinates if they changed
              if (hardware.lastKnownCoords[0] !== data.latitude || 
                  hardware.lastKnownCoords[1] !== data.longitude) {
                hardware.lastKnownCoords = [data.latitude, data.longitude];
                deviceMarkers[hardware.id].setLatLng(hardware.lastKnownCoords);
              }
              
              // Determine new status based on data
              let newStatus = "normal";
              
              if (data.temperature > 35) {
                newStatus = "alert";
              } else if (data.temperature > 30) {
                newStatus = "warning";
              }
              
              // Update marker if status changed
              if (newStatus !== hardware.status) {
                updateMarkerStatus(hardware.id, newStatus);
                
                // Only notify if status worsens
                if ((hardware.status === "normal" && (newStatus === "warning" || newStatus === "alert")) ||
                    (hardware.status === "warning" && newStatus === "alert")) {
                  
                  // Create status change notification
                  const notification = document.createElement('div');
                  notification.className = 'notification info';
                  notification.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="color: ${newStatus === 'alert' ? '#e74c3c' : '#f39c12'}"></i>
                    <span><strong>${hardware.name || hardware.id}</strong> status changed to <strong>${newStatus}</strong></span>
                    <button class="view-station" data-id="${hardware.id}">View</button>
                    <button class="close-notification"><i class="fas fa-times"></i></button>
                  `;
                  
                  document.body.appendChild(notification);
                  
                  // Auto remove notification after 8 seconds
                  setTimeout(() => {
                    if (document.body.contains(notification)) {
                      notification.style.opacity = '0';
                      setTimeout(() => notification.remove(), 500);
                    }
                  }, 8000);
                  
                  // View station button
                  notification.querySelector('.view-station').addEventListener('click', () => {
                    map.setView(hardware.lastKnownCoords, 13);
                    createHardwarePopup(hardware, hardware.lastKnownCoords)();
                    notification.remove();
                  });
                  
                  // Close button for notification
                  notification.querySelector('.close-notification').addEventListener('click', () => {
                    notification.remove();
                  });
                }
              }
            })
            .catch(error => {
              console.error(`Error updating ${hardware.id}:`, error);
              updateMarkerStatus(hardware.id, "error");
              showErrorNotification(hardware.id, "Failed to update sensor data");
            });
        }
      });
    }, 300000); // 5 minutes
  }
  
  // Add CSS for styling
  const additionalStyles = document.createElement('style');
  additionalStyles.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: rgba(255, 255, 255, 0.95);
    padding: 12px 15px;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    max-width: 350px;
    z-index: 2000;
    transition: opacity 0.5s;
  }
  
  .notification.error {
    border-left: 4px solid #e74c3c;
  }
  
  .notification.info {
    border-left: 4px solid #3498db;
  }
  
  .notification.critical-error {
    background-color: #e74c3c;
    color: white;
    border-left: 4px solid #c0392b;
  }
  
  .notification i {
    margin-right: 10px;
    font-size: 18px;
  }
  
  .notification.error i {
    color: #e74c3c;
  }
  
  .notification.info i {
    color: #3498db;
  }
  
  .notification.critical-error i {
    color: white;
  }
  
  .notification span {
    flex-grow: 1;
    font-size: 14px;
  }
  
  .notification .close-notification {
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    margin-left: 10px;
  }
  
  .notification.critical-error .close-notification {
    color: white;
  }
  
  .notification .view-station {
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    margin-left: 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
  }
  
  .notification .view-station:hover {
    background: #2980b9;
  }
  
  .data-container {
    font-family: Arial, sans-serif;
    padding: 10px;
    border-radius: 5px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
  }
  
  .data-container h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #343a40;
  }
  
  .data-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .data-label {
    font-weight: bold;
    color: #495057;
  }
  
  .data-value {
    color: #212529;
  }
  
  .status-normal {
    color: #2980b9;
  }
  
  .status-warning {
    color: #f39c12;
  }
  
  .status-alert {
    color: #e74c3c;
  }
  
  .status-offline {
    color: #95a5a6;
  }
  
  .status-error {
    color: #c0392b;
  }
  
  .error-container {
    background-color: #e74c3c;
    color: white;
  }
  
  .error-container .data-label,
  .error-container .data-value {
    color: white;
  }
  
  #loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  #loading::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;
  
  document.head.appendChild(additionalStyles);
  
  // Initialize app
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize markers
    initializeHardwareMarkers().then(() => {
      console.log('All hardware markers initialized');
      
      // Start periodic updates
      startPeriodicUpdates();
    });
  });