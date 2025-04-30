document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("oilSpillForm");

    // Обработка поля загрузки файла
    const dragArea = document.querySelector(".drag-area");
    const fileInput = document.getElementById("image");
    const imagePreview = document.getElementById("imagePreview");

    dragArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => {
      const fileName = event.target.files[0]?.name || "No file chosen";
      dragArea.querySelector("span").textContent = fileName;

      // Показ миниатюры изображения
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          imagePreview.innerHTML = "";
          imagePreview.appendChild(img);
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    dragArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      dragArea.classList.add("dragging");
    });

    dragArea.addEventListener("dragleave", () => {
      dragArea.classList.remove("dragging");
    });

    dragArea.addEventListener("drop", (event) => {
      event.preventDefault();
      dragArea.classList.remove("dragging");
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        fileInput.files = event.dataTransfer.files;
        dragArea.querySelector("span").textContent = droppedFile.name;

        // Показ миниатюры изображения
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          imagePreview.innerHTML = "";
          imagePreview.appendChild(img);
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(droppedFile);
      }
    });
  });
  const historyTab = document.getElementById('historyTab');
  const historyContent = document.getElementById('historyContent');

  function toggleHistoryTab() {
    historyTab.classList.toggle('open');
  }
  function closeHistoryTab() {
    historyTab.classList.remove('open');
  }

  function addHistoryItem(imagePath, title = '', description = '') {
    const item = document.createElement('div');
    item.classList.add('history-item');

    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Prediction Image';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Set a title...';
    titleInput.value = title;

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Set a description...';
    descriptionInput.value = description;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => item.remove();

    item.appendChild(img);
    item.appendChild(titleInput);
    item.appendChild(descriptionInput);
    item.appendChild(deleteBtn);

    historyContent.appendChild(item);
  }

  async function fetchImages() {
    try {
      const response = await fetch('/static/predictions/'); // Replace with your server API endpoint if needed
      const images = await response.json(); // Assuming JSON returns an array of image paths
      historyContent.innerHTML = ''; // Clear existing items
      images.forEach((path) => addHistoryItem(path));
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

  // Fetch images on page load
  fetchImages();

  // Optionally, periodically refresh images
  setInterval(fetchImages, 30000); // Refresh every 30 seconds