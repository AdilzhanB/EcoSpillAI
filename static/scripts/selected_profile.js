
const pathSegments = window.location.pathname.split('/');
const userId = pathSegments[pathSegments.length - 1];

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadUserPosts();
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});

function loadUserProfile() {
fetch(`/get_user_info/${userId}`)
.then(res => res.json())
.then(data => {
    document.getElementById("profileAvatar").src = data.avatar ? `/${data.avatar}` : "/static/avatars/default_oil_social.png";
    document.getElementById("profileUsername").innerText = data.email;
    document.getElementById("profileBio").innerText = data.bio || "This user has not shared anything about themselves yet.";
    updateFollowerCount();
    updateFollowingCount();
    updateFollowButtonState();
})
.catch(error => {
    console.error("Error loading profile:", error);
    document.getElementById("profileUsername").innerText = "Error loading profile";
});
}

function updateFollowButtonState() {
    fetch(`/followers/${userId}`)
        .then(res => res.json())
        .then(data => {
            const isFollowing = data.isFollowing;
            const followBtn = document.getElementById("followBtn");
            const followBtnText = document.getElementById("followBtnText");
            
            if (isFollowing) {
                followBtn.classList.remove("follow-btn");
                followBtn.classList.add("following-btn");
                followBtnText.innerText = "Following";
            } else {
                followBtn.classList.add("follow-btn");
                followBtn.classList.remove("following-btn");
                followBtnText.innerText = "Follow";
            }
            
            followBtn.onclick = () => toggleFollow(isFollowing);
        })
        .catch(error => {
            console.error("Error updating follow button:", error);
        });
}

function toggleFollow(isCurrentlyFollowing) {
    const endpoint = isCurrentlyFollowing ? `/unfollow/${userId}` : `/follow/${userId}`;
    const followBtn = document.getElementById("followBtn");
    
    followBtn.disabled = true;
    
    fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        followBtn.disabled = false;
        
        if (data.success) {
            updateFollowButtonState();
            updateFollowerCount();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error toggling follow:", error);
        followBtn.disabled = false;
        alert("Error updating follow status. Please try again.");
    });
}

function updateFollowerCount() {
    fetch(`/followers/${userId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("followersCount").innerText = data.length;
        })
        .catch(error => {
            console.error("Error updating follower count:", error);
        });
}

function updateFollowingCount() {
    fetch(`/followed/${userId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("followedCount").innerText = data.length;
        })
        .catch(error => {
            console.error("Error updating following count:", error);
        });
}

function loadUserPosts() {
    fetch(`/get_user_posts/${userId}`)
        .then(response => response.json())
        .then(posts => {
            if (posts.length === 0) {
                document.getElementById("userPosts").innerHTML = `
                    <div class="empty-state animate-on-scroll">
                        <i class="fas fa-file-alt"></i>
                        <p>No posts available</p>
                    </div>
                `;
            } else {
                let html = '';
                posts.forEach((post, index) => {
                    html += `
                        <div class="post-card animate-on-scroll" style="transition-delay: ${index * 0.1}s">
                            <div class="post-header">
                                <img src="${post.avatar || 'static/avatars/default.png'}" class="post-avatar" alt="${post.username}">
                                <h5 class="post-username">${post.username}</h5>
                            </div>
                            <p class="post-content">${post.content}</p>
                        </div>
                    `;
                });
                document.getElementById("userPosts").innerHTML = html;
                animateOnScroll();
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById("userPosts").innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Error loading posts. Please try again later.
                </div>
            `;
        });
}
function showFollowers() {
    const userId = window.location.pathname.split('/').pop();
    fetch(`/followers/${userId}`)
        .then(res => res.json())
        .then(data => {
            showUserListPopup("Followers", data);
        })
        .catch(error => {
            console.error("Error fetching followers:", error);
        });
}

function showFollowed() {
    const userId = window.location.pathname.split('/').pop();
    fetch(`/followed/${userId}`)
        .then(res => res.json())
        .then(data => {
            showUserListPopup("Following", data);
        })
        .catch(error => {
            console.error("Error fetching following:", error);
        });
}

function showUserListPopup(title, users) {
    const popup = document.getElementById("userListPopup");
    const popupTitle = document.getElementById("popupTitle");
    const popupList = document.getElementById("popupList");

    popupTitle.innerText = title;
    
    if (users && users.length > 0) {
        let html = '';
        users.forEach(user => {
            html += `
                <li class="user-item" onclick="navigateToProfile(${user.id})">
                    <img src="${user.avatar ? `/${user.avatar}` : '/static/avatars/default_oil_social.png'}" class="user-avatar" alt="${user.username}">
                    <span class="user-name">${user.username}</span>
                </li>
            `;
        });
        popupList.innerHTML = html;
    } else {
        popupList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No users found</p>
            </div>
        `;
    }

    popup.classList.add("active");
}

function closePopup() {
    document.getElementById("userListPopup").classList.remove("active");
}

function navigateToProfile(userId) {
    window.location.href = `/profile_selected/${userId}`;
}

function openChat() {
    fetch("/get_logged_in_user")
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                const senderUsername = data.username;
                const recipientUsername = document.getElementById("profileUsername").innerText;
                
                window.location.href = `/chat/${senderUsername}/${recipientUsername}`;
            } else {
                alert("You need to log in first!");
            }
        })
        .catch(error => {
            console.error("Error fetching logged-in user:", error);
            alert("Error opening chat. Please try again later.");
        });
}

function animateOnScroll() {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.8) {
            el.classList.add('fade-in');
        }
    });
}