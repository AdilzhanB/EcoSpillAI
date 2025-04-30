 // Set active nav link
 document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
    
    // Default to home if we're on index.html or root
    if (currentPage === '' || currentPage === 'index.html') {
      document.getElementById('home-link').classList.add('active');
    }
  });
  
  // Toggle side panel
  function toggleSidePanel() {
    document.getElementById('sidePanel').classList.toggle('open');
  }
  
  // Close side panel
  function closeSidePanel() {
    document.getElementById('sidePanel').classList.remove('open');
  }
  
  // Change password function
  function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    const formData = new FormData();
    formData.append('new_password', newPassword);
    
    fetch('/change_password', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Password changed successfully!');
        document.getElementById('newPassword').value = '';
      } else {
        alert('Failed to change password: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error changing password:', error);
      alert('An error occurred while changing the password');
    });
  }
  
  // Change profile picture function
  function changeProfilePicture() {
    // Ideally this would open a file picker, but for now using prompt
    const newPicture = prompt("Enter the URL of the new profile picture:");
    if (newPicture) {
      // Update all avatar instances
      const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-large');
      avatars.forEach(avatar => {
        avatar.src = newPicture;
      });
      
      // Store in local storage for persistence
      localStorage.setItem('profilePicture', newPicture);
      alert("Profile picture updated successfully!");
    }
  }
  
  // Load saved profile picture if available
  document.addEventListener('DOMContentLoaded', function() {
    const savedAvatar = localStorage.getItem('profilePicture');
    if (savedAvatar) {
      const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-large');
      avatars.forEach(avatar => {
        avatar.src = savedAvatar;
      });
    }
  });