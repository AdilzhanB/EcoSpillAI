document.getElementById('avatar').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById('avatar-preview');
            imgElement.src = e.target.result;
            imgElement.style.opacity = '1';
        };
        reader.readAsDataURL(file);
    }
});