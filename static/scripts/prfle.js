// Function to show toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fas fa-check-circle text-success"></i>' 
        : '<i class="fas fa-exclamation-circle text-danger"></i>';
        
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }
}

// Function to load user posts with skeleton loading
function loadUserPosts() {
    // Show skeleton loading
    let skeletonHTML = '';
    for (let i = 0; i < 3; i++) {
        skeletonHTML += `
            <div class="post-card">
                <div class="post-header">
                    <div class="skeleton" style="width: 42px; height: 42px; border-radius: 50%;"></div>
                    <div style="flex-grow: 1; margin-left: 12px;">
                        <div class="skeleton" style="width: 120px; height: 16px; margin-bottom: 6px;"></div>
                        <div class="skeleton" style="width: 80px; height: 12px;"></div>
                    </div>
                </div>
                <div class="post-content">
                    <div class="skeleton" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="width: 80%; height: 16px;"></div>
                </div>
            </div>
        `;
    }
    document.getElementById("userPosts").innerHTML = skeletonHTML;
    
    // Fetch actual posts
    fetch('/get_user_posts_for_single_user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                document.getElementById("userPosts").innerHTML = `
                    <div class="empty-posts">
                        <i class="fas fa-file-alt"></i>
                        <h4>No posts yet</h4>
                        <p>Your posts will appear here once you create them.</p>
                        <a href="/new_post" class="btn btn-custom btn-sm mt-3">
                            <i class="fas fa-plus"></i> Create Your First Post
                        </a>
                    </div>
                `;
                return;
            }
            
            let html = '';
            posts.forEach(post => {
                html += `
                    <div class="post-card" id="post-${post.id}">
                        <div class="post-header">
                            <img src="${post.avatar || 'https://api.dicebear.com/6.x/initials/svg?seed=' + post.username}" 
                                 class="post-avatar" 
                                 alt="${post.username}">
                            <div>
                                <h5 class="post-author">${post.username}</h5>
                                <p class="post-date">${formatDate(post.timestamp || new Date().toISOString())}</p>
                            </div>
                        </div>
                        <div class="post-content">
                            ${post.content}
                        </div>
                        <div class="post-actions">
                            <button class="btn-post-action btn-delete" data-post-id="${post.id}" onclick="deletePost(${post.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            document.getElementById("userPosts").innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById("userPosts").innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading posts. Please try again later.
                </div>
            `;
        });
}

// Function to delete a post with confirmation
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        const postElement = document.getElementById(`post-${postId}`);
        postElement.style.opacity = '0.5';
        
        fetch(`/delete_post/${postId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById(`post-${postId}`).remove();
                showToast('Post deleted successfully');
                
                // Check if no posts remain
                if (document.querySelectorAll('.post-card').length === 0) {
                    document.getElementById("userPosts").innerHTML = `
                        <div class="empty-posts">
                            <i class="fas fa-file-alt"></i>
                            <h4>No posts yet</h4>
                            <p>Your posts will appear here once you create them.</p>
                            <a href="/new_post" class="btn btn-custom btn-sm mt-3">
                                <i class="fas fa-plus"></i> Create Your First Post
                            </a>
                        </div>
                    `;
                }
            } else {
                postElement.style.opacity = '1';
                showToast('Error deleting post', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            postElement.style.opacity = '1';
            showToast('Error deleting post', 'error');
        });
    }
}

// Load user posts when the page loads
window.onload = loadUserPosts;