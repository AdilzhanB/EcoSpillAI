document.addEventListener("DOMContentLoaded", function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    animateElementsInView();
    
    window.addEventListener('scroll', animateElementsInView);
    
    function animateElementsInView() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                setTimeout(() => {
                    element.classList.add('fade-in');
                }, 100 * Array.from(animatedElements).indexOf(element));
            }
        });
    }
});
// Event listener for searching users
let searchTimeout = null;

document.getElementById("userSearch").addEventListener("input", function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    const resultsContainer = document.getElementById("searchResults");

    // Hide results if empty query
    if (!query) {
        resultsContainer.style.display = "none";
        return;
    }

    // Set new timeout to wait for typing pause
    searchTimeout = setTimeout(() => {
        fetch(`/search?q=${query}`)
            .then(res => res.json())
            .then(users => {
                let html = '';
                if (users.length > 0) {
                    users.forEach(user => {
                        html += `
                            <li class="list-group-item d-flex justify-content-between" onclick="goToProfile(${user.id})">
                                ${user.username}
                            </li>
                        `;
                    });
                    resultsContainer.innerHTML = html;
                    resultsContainer.style.display = "block";
                } else {
                    resultsContainer.style.display = "none";
                }
            });
    }, 300); // 300ms delay after last keystroke
});

// Hide results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#userSearch')) {
        document.getElementById("searchResults").style.display = "none";
    }
});

// Go to selected profile
function goToProfile(userId) {
    window.location.href = `/profile_selected/${userId}`;
}

// Add a post
// Add a post
function addPost() {
    const content = document.getElementById("postContent").value.trim();
    console.log(content);  // Debugging: Log the content to the console

    if (!content) {
        alert("Content is required!");  // If content is empty, show a message.
        return;
    }

    fetch('/create_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Post created successfully!");
            loadPosts(); // Refresh the posts list
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        alert("Something went wrong. Please try again later.");
    });
}


// Load recommended users from server
function loadUsers() {
fetch('/get_users')
.then(res => res.json())
.then(users => {
    let html = '';
    users.forEach(user => {
        html += `
            <div class="recommendation-item fade-in">
            <div class="recommendation-content d-flex align-items-center justify-content-between p-3">
                <span class="recommendation-title">${user.username}</span>
                <div>
                    <button class="recommendation-button" onclick="goToProfile('${user.id}')">View Profile</button>
                </div>
            </div>
        </div>
        `;
    });
    document.getElementById("userList").innerHTML = html;
});
}
function loadPosts() {
// Track loading state
const postList = document.getElementById("postList");
postList.innerHTML = '<div class="d-flex justify-content-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

// Retrieve user's preferred language from localStorage or default to English
const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';

fetch('/get_posts')
.then(res => {
    if (!res.ok) throw new Error(`Network response error: ${res.status}`);
    return res.json();
})
.then(posts => {
    let html = '';
    
    // Pre-populate language selection dropdown
    const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'vi', name: 'Tiếng Việt' }
    ];
    
    posts.forEach(post => {
        // Store original content for reference
        const originalContent = post.content;
        const likeIconClass = post.is_liked_by_user ? 'bi-heart-fill' : 'bi-heart';
        const likeButtonData = post.is_liked_by_user ? 'true' : 'false';

        html += `
            <div class="card post-card p-3 my-4 animate-on-scroll" 
                 data-post-id="${post.id}" 
                 data-original-content="${encodeURIComponent(originalContent)}"
                 style="
                    opacity: 0;
                    border-radius: 16px;
                    border: none;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
                    overflow: hidden;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    position: relative;
                    transform: translateY(10px);">
                
                <div class="d-flex justify-content-between mb-3">
                    <div class="d-flex align-items-center">
                        <div class="position-relative" style="
                            width: 52px;
                            height: 52px;
                            border-radius: 50%;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.12);
                            border: 2px solid #f0f0f0;">
                            <img src="${post.avatar || 'static/avatars/1024px-Logo_NIS.png'}"
                                class="avatar w-100 h-100 object-fit-cover"
                                alt="${post.username}">
                            <div class="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" 
                                 style="width: 12px; height: 12px;"></div>
                        </div>
                        <div class="ms-3">
                            <h5 class="mb-0 fw-bold" style="color: #212529;">${post.username}</h5>
                            <small class="text-muted">${new Date(post.timestamp).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}</small>
                        </div>
                    </div>
                    
                    <!-- Translation dropdown with fixed positioning -->
                    <div class="dropdown translation-control">
                        <button class="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle px-3 translation-btn" 
                                type="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                                style="box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <i class="bi bi-translate me-1"></i> 
                            <span class="current-language">${preferredLanguage === 'en' ? 'Original' : languages.find(l => l.code === preferredLanguage)?.name || 'Translate'}</span>
                        </button>
                        <ul class="dropdown-menu shadow dropdown-menu-end" style="min-width: 200px; max-height: 300px; overflow-y: auto;">
                            <li><h6 class="dropdown-header">Translate to</h6></li>
                            <li><a class="dropdown-item translate-option ${preferredLanguage === 'en' ? 'active' : ''}" 
                                  href="#" 
                                  data-lang="original" 
                                  data-post-id="${post.id}">
                                  <i class="bi bi-check2 me-2 ${preferredLanguage === 'en' ? 'visible' : 'invisible'}"></i>Original
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            ${languages.filter(l => l.code !== 'en').map(lang => 
                                `<li><a class="dropdown-item translate-option ${preferredLanguage === lang.code ? 'active' : ''}" 
                                     href="#" 
                                     data-lang="${lang.code}" 
                                     data-post-id="${post.id}">
                                     <i class="bi bi-check2 me-2 ${preferredLanguage === lang.code ? 'visible' : 'invisible'}"></i>${lang.name}
                                 </a></li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="post-content-container position-relative" style="min-height: 60px;">
                    <p class="post-content mb-4" style="
                        line-height: 1.65;
                        color: #343a40;
                        margin-bottom: 2.5rem;
                        font-size: 1.05rem;
                        transition: opacity 0.3s ease;">${originalContent}</p>
                    
                    <!-- Translation loading indicator (hidden by default) -->
                    <div class="translation-loading position-absolute top-0 start-0 w-100 h-100 d-none justify-content-center align-items-center" 
                         style="backdrop-filter: blur(2px); background: rgba(255, 255, 255, 0.5); z-index: 5;">
                        <div class="d-flex flex-column align-items-center">
                            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                            <small class="fw-medium">Translating...</small>
                        </div>
                    </div>
                </div>
                
                <footer class="mt-4" style="
                    padding: 10px 12px;
                    font-size: 0.85rem;
                    color: #6c757d;
                    background: rgba(248, 249, 250, 0.8);
                    backdrop-filter: blur(4px);
                    border-top: 1px solid rgba(0,0,0,0.05);
                    border-radius: 10px;
                    margin: 0 -8px -8px -8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;">
                    <div>
                        <i class="bi bi-clock me-1" style="font-size: 0.8rem;"></i>
                        ${new Date(post.timestamp).toLocaleString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-sm btn-link text-decoration-none p-0 me-3 like-btn"
                                data-post-id="${post.id}"
                                data-liked="${likeButtonData}">
                            <i class="bi ${likeIconClass}"></i>
                            <span class="ms-1 like-count">${post.like_count || 0}</span>
                        </button>
                    </div>
                </footer>
            </div>
        `;
    });
    
    postList.innerHTML = html;
    
    // Initialize translation behavior
    initializeTranslation();
    
    initializeLikeButtons();
    // Apply scroll animations
    animateOnScroll();
    
    // Add hover effects and animations to UI elements
    enhanceUIInteractions();
    
    // Auto-translate to preferred language if not English
    if (preferredLanguage !== 'en') {
        document.querySelectorAll('.post-card').forEach(card => {
            translatePostContent(card, preferredLanguage);
        });
    }
})
.catch(error => {
    console.error('Error loading posts:', error);
    postList.innerHTML = `
        <div class="alert alert-danger text-center my-4 shadow-sm rounded-4 p-4" role="alert">
            <i class="bi bi-exclamation-triangle me-2 fs-4"></i>
            <p class="mb-0 fw-medium">Unable to load posts. Please try again later.</p>
            <button class="btn btn-outline-danger mt-3 rounded-pill px-4" onclick="loadPosts()">
                <i class="bi bi-arrow-clockwise me-2"></i>Try Again
            </button>
        </div>
    `;
});
}

function initializeLikeButtons() {
const likeButtons = document.querySelectorAll('.like-btn');

likeButtons.forEach(button => {
button.addEventListener('click', function() {
    const postId = this.getAttribute('data-post-id');
    const isLiked = this.getAttribute('data-liked') === 'true';
    const likeIcon = this.querySelector('i');
    const likeCount = this.querySelector('.like-count');
    
    // Determine which endpoint to call based on current like status
    const endpoint = isLiked ? `/unlike/${postId}` : `/like/${postId}`;
    
    // Add visual feedback immediately
    if (isLiked) {
        likeIcon.classList.add('animate__animated', 'animate__bounceOut');
        setTimeout(() => {
            likeIcon.classList.remove('bi-heart-fill', 'animate__animated', 'animate__bounceOut');
            likeIcon.classList.add('bi-heart');
        }, 300);
    } else {
        likeIcon.classList.add('animate__animated', 'animate__heartBeat');
        setTimeout(() => {
            likeIcon.classList.remove('bi-heart', 'animate__animated', 'animate__heartBeat');
            likeIcon.classList.add('bi-heart-fill');
        }, 300);
    }
    
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin' // Send cookies with the request
    })
    .then(response => {
        if (!response.ok) {
            // If response is not 2xx, parse the error message
            return response.json().then(data => {
                throw new Error(data.message || 'Error processing like/unlike');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update like count from server response
            likeCount.textContent = data.like_count;
            
            // Toggle like state attribute
            this.setAttribute('data-liked', isLiked ? 'false' : 'true');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Revert the icon state if there was an error
        if (isLiked) {
            likeIcon.classList.remove('bi-heart');
            likeIcon.classList.add('bi-heart-fill');
        } else {
            likeIcon.classList.remove('bi-heart-fill');
            likeIcon.classList.add('bi-heart');
        }
    });
});
});
}

function enhanceUIInteractions() {
// Add hover effects to post cards
document.querySelectorAll('.post-card').forEach(card => {
card.style.opacity = '1';
card.style.transform = 'translateY(0)';

// Add hover effect
card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
});

card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
});

// Enhance like button interaction
const likeBtn = card.querySelector('.like-btn');
if (likeBtn) {
    likeBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const count = this.querySelector('span');
        
        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
            icon.style.color = '#dc3545';
            count.textContent = (parseInt(count.textContent) + 1).toString();
        } else {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
            icon.style.color = '';
            count.textContent = (parseInt(count.textContent) - 1).toString();
        }
    });
}

// Enhance translation button
const translateBtn = card.querySelector('.translation-btn');
if (translateBtn) {
    translateBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
    });
    
    translateBtn.addEventListener('mouseleave', function() {
        if (!this.classList.contains('show')) {
            this.style.backgroundColor = '';
        }
    });
}
});
}

function initializeTranslation() {
document.addEventListener('click', function (e) {
const translateOption = e.target.closest('.translate-option');
if (!translateOption) return;

e.preventDefault();

const lang = translateOption.dataset.lang;
const postId = translateOption.dataset.postId;
const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);

// Update dropdown selection visual state
card.querySelectorAll('.translate-option').forEach(option => {
    option.classList.remove('active');
    option.querySelector('.bi-check2').classList.add('invisible');
});
translateOption.classList.add('active');
translateOption.querySelector('.bi-check2').classList.remove('invisible');

// Update visible language text
const languageDisplay = card.querySelector('.current-language');
languageDisplay.textContent = lang === 'original' ? 'Original' : translateOption.textContent.trim().replace(/^\s*[\u2713]\s*/, '').trim();

if (lang === 'original') {
    // Restore original content
    const originalContent = decodeURIComponent(card.dataset.originalContent);
    card.querySelector('.post-content').textContent = originalContent;
} else {
    // Translate using OpenAI API
    translatePostContent(card, lang);
}
});

// Fix for dropdown positioning
document.querySelectorAll('.translation-control').forEach(control => {
const dropdown = control.querySelector('.dropdown-menu');

// Use Bootstrap's Dropdown API to position the dropdown correctly
control.querySelector('.dropdown-toggle').addEventListener('click', function() {
    // Ensure dropdown is positioned relative to viewport, not just the post
    dropdown.classList.add('dropdown-menu-end');
});
});
}

async function translatePostContent(card, targetLanguage) {
const contentElement = card.querySelector('.post-content');
const loadingIndicator = card.querySelector('.translation-loading');
const originalContent = decodeURIComponent(card.dataset.originalContent);

// Don't translate if content is empty or too short
if (!originalContent || originalContent.trim().length < 2) {
showToast(createToastContainer(), 'Translation Notice', 'Content is too short to translate.');
return;
}

// Show loading state with nicer visual effect
contentElement.style.opacity = '0.4';
loadingIndicator.classList.remove('d-none');
loadingIndicator.classList.add('d-flex');

try {
const response = await fetch('/api/openai-translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: originalContent,
        targetLanguage: targetLanguage
    })
});

if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
const data = await response.json();

if (data.error) throw new Error(data.error);

// Add a slight delay for smoother transition
setTimeout(() => {
    // Update content with translation
    contentElement.textContent = data.translatedText;
}, 300);
} catch (error) {
console.error('Translation error:', error);
contentElement.textContent = originalContent;

// Show error toast with retry option
const toastContainer = document.getElementById('toastContainer') || createToastContainer();
showToast(
    toastContainer, 
    'Translation Error', 
    `<p>Unable to translate content.</p>
     <button class="btn btn-sm btn-outline-primary mt-1 retry-translation" 
            data-post-id="${card.dataset.postId}" 
            data-lang="${targetLanguage}">
        <i class="bi bi-arrow-repeat me-1"></i>Retry
     </button>`
);
} finally {
// Hide loading indicator with a small delay for smoother transition
setTimeout(() => {
    contentElement.style.opacity = '1';
    loadingIndicator.classList.add('d-none');
    loadingIndicator.classList.remove('d-flex');
}, 400);
}
}

function createToastContainer() {
const container = document.createElement('div');
container.id = 'toastContainer';
container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
container.style.zIndex = '1050';
document.body.appendChild(container);

// Add event listener for retry translation buttons
container.addEventListener('click', function(e) {
const retryBtn = e.target.closest('.retry-translation');
if (!retryBtn) return;

const postId = retryBtn.dataset.postId;
const lang = retryBtn.dataset.lang;
const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);

if (card) {
    translatePostContent(card, lang);
}

// Close the toast
const toast = bootstrap.Toast.getInstance(retryBtn.closest('.toast'));
if (toast) toast.hide();
});

return container;
}

function showToast(container, title, message) {
const toastId = 'toast-' + Date.now();
const toastHtml = `
<div id="${toastId}" class="toast border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true"
     style="border-radius: 12px; overflow: hidden;">
    <div class="toast-header bg-light">
        <i class="bi bi-info-circle me-2 text-primary"></i>
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
</div>
`;

container.insertAdjacentHTML('beforeend', toastHtml);
const toastElement = document.getElementById(toastId);
const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
toast.show();

// Add fade out effect before removing
toastElement.addEventListener('hide.bs.toast', () => {
toastElement.style.transition = 'opacity 0.35s ease';
toastElement.style.opacity = '0';
});

// Auto-remove from DOM after hiding
toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

// Enhanced animation on scroll function
function animateOnScroll() {
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
    }
});
}, {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.animate-on-scroll').forEach(element => {
observer.observe(element);
});
}

// Add CSS styles to the document
function addGlobalStyles() {
const styleElement = document.createElement('style');
styleElement.textContent = `
.post-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease;
}

.like-btn i.bi-heart-fill {
    color: #dc3545;
    animation: heartPulse 0.3s ease;
}

@keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.dropdown-menu {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    overflow: hidden;
    min-width: 200px !important;
}

.dropdown-item.active, .dropdown-item:active {
    background-color: #f8f9fa;
    color: #0d6efd;
}

.translation-btn:hover, .translation-btn:focus {
    background-color: #f8f9fa !important;
    border-color: #dee2e6 !important;
}

.post-content {
    word-break: break-word;
}

.toast {
    opacity: 0;
    animation: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(styleElement);
}
window.addEventListener('scroll', animateOnScroll);
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    addGlobalStyles();
    loadPosts();
});