// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size
      const size = Math.random() * 30 + 10;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      
      // Random animation duration and delay
      const duration = Math.random() * 30 + 10;
      const delay = Math.random() * 5;
      particle.style.animation = `float ${duration}s ${delay}s infinite`;
      
      particlesContainer.appendChild(particle);
    }
  }
  
  createParticles();

  function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
      field.type = 'text';
      button.innerHTML = '👁️‍🗨️';
    } else {
      field.type = 'password';
      button.innerHTML = '👁️';
    }
  }

  function switchToLogin() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    authBox.style.transform = 'rotateY(360deg)';
    
    setTimeout(() => {
      document.getElementById('authBox').style.background = 'rgba(245, 245, 255, 0.9)';
    }, 400);
  }

  function switchToSignUp() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    
    authBox.style.transform = 'rotateY(0deg)';
    
    setTimeout(() => {
      document.getElementById('authBox').style.background = 'rgba(255, 255, 255, 0.9)';
    }, 400);
  }

  // Add input focus effects
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.style.transform = 'scale(1)';
    });
  });

  // Button animation
  const buttons = document.querySelectorAll('.submit-btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });

  // Original functionality
  async function registerUser() {
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;

    if (password !== confirmPassword) {
      document.getElementById('signUpError').innerText = 'Passwords do not match.';
      return;
    }

    const formData = new FormData(document.getElementById('signUpFormElement'));

    const response = await fetch('/register', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = '/index';
    } else {
      document.getElementById('signUpError').innerText = result.message;
    }
  }

  async function logInUser() {
    const formData = new FormData(document.getElementById('loginFormElement'));

    const response = await fetch('/auth', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = '/index';
    } else {
      document.getElementById('loginError').innerText = result.message;
    }
  }