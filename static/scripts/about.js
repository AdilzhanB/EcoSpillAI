document.addEventListener("DOMContentLoaded", () => {
    // Mark the About link as active
    document.getElementById('about-link').classList.add('active');
    
    // Animate elements when page loads
    setTimeout(() => {
      document.querySelector('.about-container').classList.add('visible');
      
      // Animate team members with delay
      const teamMembers = document.querySelectorAll('.team-member');
      teamMembers.forEach((member, index) => {
        setTimeout(() => {
          member.classList.add('visible');
        }, 100 * (index + 1));
      });
      
      // Animate mission statement
      setTimeout(() => {
        document.querySelector('.mission').classList.add('visible');
      }, 500);
    }, 300);
  });
  window.addEventListener('DOMContentLoaded', () => {
  const about = document.querySelector('.about-container');
  const teamMembers = document.querySelectorAll('.team-member');
  const mission = document.querySelector('.mission');

  // Trigger animations after a delay or on scroll (simplified)
  setTimeout(() => {
    about.classList.add('visible');
    mission.classList.add('visible');
    teamMembers.forEach(member => member.classList.add('visible'));
  }, 300); // you can customize this
});