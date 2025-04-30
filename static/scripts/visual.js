document.addEventListener("DOMContentLoaded", () => {
    // Image controls
    const mainImage = document.getElementById("mainImage");
    const fullscreenOverlay = document.getElementById("fullscreenOverlay");
    const fullscreenImage = document.getElementById("fullscreenImage");
    const zoomLevel = document.getElementById("zoomLevel");
    const imageGallery = document.getElementById("imageGallery");
    const galleryItems = document.querySelectorAll(".gallery-item");
    
    // Zoom functionality
    let currentZoom = 1;
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const galleryBtn = document.getElementById("galleryBtn");
    const fullscreenZoomIn = document.getElementById("fullscreenZoomIn");
    const fullscreenZoomOut = document.getElementById("fullscreenZoomOut");
    const fullscreenReset = document.getElementById("fullscreenReset");
    
    // Initialize
    updateZoomLevel();
    
    // Image controls event listeners
    zoomInBtn.addEventListener("click", () => {
      currentZoom += 0.1;
      updateZoom();
    });
    
    zoomOutBtn.addEventListener("click", () => {
      if (currentZoom > 0.5) {
        currentZoom -= 0.1;
        updateZoom();
      }
    });
    
    fullscreenBtn.addEventListener("click", openFullscreen);
    
    galleryBtn.addEventListener("click", () => {
      imageGallery.classList.toggle("active");
    });
    
    // Fullscreen controls
    fullscreenZoomIn.addEventListener("click", () => {
      currentZoom += 0.1;
      updateZoom(true);
    });
    
    fullscreenZoomOut.addEventListener("click", () => {
      if (currentZoom > 0.5) {
        currentZoom -= 0.1;
        updateZoom(true);
      }
    });
    
    fullscreenReset.addEventListener("click", () => {
      currentZoom = 1;
      updateZoom(true);
    });
    
    mainImage.addEventListener("click", openFullscreen);
    
    // Gallery items
    galleryItems.forEach(item => {
      item.addEventListener("click", () => {
        // Remove active class from all items
        galleryItems.forEach(i => i.classList.remove("active"));
        
        // Add active class to clicked item
        item.classList.add("active");
        
        // Update main image
        const imgSrc = item.querySelector("img").src;
        mainImage.src = imgSrc;
        
        // Reset zoom
        currentZoom = 1;
        updateZoom();
      });
    });
    
    // Functions
    function updateZoom(isFullscreen = false) {
      if (isFullscreen) {
        fullscreenImage.style.transform = `scale(${currentZoom})`;
      } else {
        mainImage.style.transform = `scale(${currentZoom})`;
      }
      updateZoomLevel();
    }
    
    function updateZoomLevel() {
      const percentage = Math.round(currentZoom * 100);
      zoomLevel.textContent = `Zoom: ${percentage}%`;
    }
    
    function openFullscreen() {
      fullscreenImage.src = mainImage.src;
      fullscreenOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      
      // Apply current zoom level
      updateZoom(true);
    }
  });
  
  function closeFullscreen() {
    document.getElementById("fullscreenOverlay").classList.remove("active");
    document.body.style.overflow = "auto";
  }
  
  function goBack() {
    document.getElementById("result-container").style.display = "none";
    document.getElementById("input-form").style.display = "flex";
  }
  
  async function predictCleaningMethod() {
    const temperature = document.getElementById("temperature").value;
    const humidity = document.getElementById("humidity").value;
    const flowSpeed = document.getElementById("flow-speed").value;
    const flowDirection = document.getElementById("flow-direction").value;
    
    if (!temperature || !humidity || !flowSpeed || !flowDirection) {
      alert("Please fill in all fields");
      return;
    }
    
    const loader = document.getElementById("loader");
    const resultContainer = document.getElementById("result-container");
    const submitButton = document.getElementById("submit-button");
    const inputForm = document.getElementById("input-form");
    
    loader.style.display = "block";
    inputForm.style.display = "none";
    submitButton.disabled = true;
  
    const url = new URL("/generate_oil_spill_clean_method", window.location.origin);
    url.searchParams.append("temperature", temperature);
    url.searchParams.append("humidity", humidity);
    url.searchParams.append("flow_speed", flowSpeed);
    url.searchParams.append("flow_direction", flowDirection);
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      
      // Format the result text with proper markdown/html formatting
      let formattedText = data;
      
      // Convert simple markdown to HTML
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formattedText = formattedText.replace(/\n\n/g, '<br><br>');
      
      document.getElementById("result-text").innerHTML = formattedText;
      resultContainer.style.display = "block";
      
      // Add parameter summary to result details
      const resultDetails = document.getElementById("result-details");
      resultDetails.innerHTML = `
        <h4>Input Parameters:</h4>
        <ul>
          <li><i class="fas fa-temperature-half"></i> Temperature: ${temperature}°C</li>
          <li><i class="fas fa-droplet"></i> Humidity: ${humidity}%</li>
          <li><i class="fas fa-wind"></i> Flow Speed: ${flowSpeed} m/s</li>
          <li><i class="fas fa-compass"></i> Flow Direction: ${flowDirection}</li>
        </ul>
      `;
      
    } catch (error) {
      alert(`Error: ${error.message}`);
      inputForm.style.display = "flex";
    } finally {
      loader.style.display = "none";
      submitButton.disabled = false;
    }
  }