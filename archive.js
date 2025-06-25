// Archive Gallery Enhanced Script
document.addEventListener('DOMContentLoaded', function() {
    
    // Ensure page starts from the top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Lazy Loading Implementation
    const images = document.querySelectorAll('.gallery-item img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Patch for dynamically added images (GitHub/user/artwork/photo)
    const gallery = document.getElementById('gallery');
    const observeNewImages = (node) => {
        if (node.tagName === 'IMG' && node.classList.contains('lazy')) {
            imageObserver.observe(node);
        } else if (node.querySelectorAll) {
            node.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
        }
    };
    const galleryObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(observeNewImages);
        });
    });
    galleryObserver.observe(gallery, { childList: true, subtree: true });

    // Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = '';
                    item.setAttribute('aria-hidden', 'false');
                } else {
                    item.style.display = 'none';
                    item.setAttribute('aria-hidden', 'true');
                }
            });
            
            // Announce filter change to screen readers
            announceToScreenReader(`Showing ${filter === 'all' ? 'all items' : filter + ' items'}`);
        });

        // Keyboard navigation for filter buttons
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Enhanced Lightbox with keyboard navigation and fullscreen
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    let currentImageIndex = 0;
    let visibleImages = [];

    // Get all visible images for navigation
    function updateVisibleImages() {
        visibleImages = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"]) img'));
    }

    // Open lightbox
    function openLightbox(imgElement, index) {
        updateVisibleImages();
        currentImageIndex = index;
        lightboxImg.src = imgElement.src;
        lightboxImg.alt = imgElement.alt;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        lightboxClose.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        announceToScreenReader(`Image ${currentImageIndex + 1} of ${visibleImages.length}: ${imgElement.alt}`);
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        document.body.style.overflow = '';
        
        // Return focus to the image that opened the lightbox
        if (visibleImages[currentImageIndex]) {
            visibleImages[currentImageIndex].parentElement.focus();
        }
    }

    // Navigate to next/previous image
    function navigateImage(direction) {
        if (visibleImages.length === 0) return;
        
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        }
        
        const newImg = visibleImages[currentImageIndex];
        lightboxImg.src = newImg.src;
        lightboxImg.alt = newImg.alt;
        
        announceToScreenReader(`Image ${currentImageIndex + 1} of ${visibleImages.length}: ${newImg.alt}`);
    }

    // Enter fullscreen mode
    function enterFullscreen() {
        if (lightbox.requestFullscreen) {
            lightbox.requestFullscreen();
        } else if (lightbox.webkitRequestFullscreen) {
            lightbox.webkitRequestFullscreen();
        } else if (lightbox.msRequestFullscreen) {
            lightbox.msRequestFullscreen();
        }
        announceToScreenReader('Entered fullscreen mode');
    }

    // Exit fullscreen mode
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        announceToScreenReader('Exited fullscreen mode');
    }

    // Add click listeners to gallery images
    document.querySelectorAll('.gallery-item img').forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(img, index);
        });

        // Make images keyboard accessible
        img.parentElement.setAttribute('tabindex', '0');
        img.parentElement.setAttribute('role', 'button');
        img.parentElement.setAttribute('aria-label', `View ${img.alt} in lightbox`);
        
        img.parentElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(img, index);
            }
        });
    });

    // Lightbox close button
    lightboxClose.addEventListener('click', closeLightbox);

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                navigateImage('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateImage('next');
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                if (document.fullscreenElement) {
                    exitFullscreen();
                } else {
                    enterFullscreen();
                }
                break;
        }
    });

    // Accessibility helper function
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Add navigation instructions
    const instructions = document.createElement('div');
    instructions.setAttribute('class', 'sr-only');
    instructions.setAttribute('aria-live', 'polite');
    instructions.textContent = 'Use arrow keys to navigate images, F for fullscreen, Escape to close';
    document.body.appendChild(instructions);

    // Focus management
    lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            lightboxClose.focus();
        }
    });

    console.log('Archive gallery enhanced with lazy loading, keyboard navigation, and accessibility features');

    // --- Project Quick View Modal Logic ---
    const projectModal = document.getElementById('projectModal');
    const closeProjectModal = document.getElementById('closeProjectModal');
    const modalProjectImg = document.getElementById('modalProjectImg');
    const modalProjectVideo = document.getElementById('modalProjectVideo');
    const modalProjectVideoSource = document.getElementById('modalProjectVideoSource');
    const modalToggleMedia = document.getElementById('modalToggleMedia');
    const modalProjectName = document.getElementById('modalProjectName');
    const modalProjectTech = document.getElementById('modalProjectTech');
    const modalProjectDesc = document.getElementById('modalProjectDesc');
    const modalProjectLinks = document.getElementById('modalProjectLinks');
    const modalProjectReadme = document.getElementById('modalProjectReadme');
    const modalReadmeSnippet = document.getElementById('modalReadmeSnippet');

    // Example project data (replace with your real data or fetch dynamically)
    const projectData = [
      {
        name: 'Interactive Web App',
        thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
        tech: ['HTML', 'CSS', 'JavaScript'],
        desc: 'A modern web app with real-time features and responsive design.',
        live: '#',
        github: '#',
        readme: 'This is a sample README snippet for Interactive Web App.',
        video: 'https://example.com/interactive-web-app.mp4'
      },
      {
        name: 'Mobile App Design',
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
        img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
        tech: ['React Native', 'Figma'],
        desc: 'Beautiful mobile UI/UX for productivity on the go.',
        live: '#',
        github: '#',
        readme: 'This is a sample README snippet for Mobile App Design.',
        video: 'https://example.com/mobile-app-design.mp4'
      }
    ];

    // Manual project cards: use thumbnail for card image
    const projectCards = document.querySelectorAll('.gallery-item[data-category="project"]');
    projectCards.forEach((card, idx) => {
      const img = card.querySelector('img');
      if (img && projectData[idx] && projectData[idx].thumbnail) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('data-src', projectData[idx].thumbnail);
        img.classList.add('lazy');
        img.src = '';
      }
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') e.preventDefault();
        const data = projectData[idx];
        if (!data) return;
        const hasVideo = !!data.video;
        const hasImage = !!data.img;
        // Toggle logic
        if (hasVideo && hasImage) {
          modalToggleMedia.style.display = '';
          modalToggleMedia.textContent = 'Show Video';
          modalProjectImg.style.display = '';
          modalProjectVideo.style.display = 'none';
          modalToggleMedia.onclick = function() {
            if (modalProjectImg.style.display !== 'none') {
              modalProjectImg.style.display = 'none';
              modalProjectVideo.style.display = '';
              modalProjectVideoSource.src = data.video;
              modalProjectVideo.load();
              modalToggleMedia.textContent = 'Show Image';
            } else {
              modalProjectVideo.style.display = 'none';
              modalProjectVideoSource.src = '';
              modalProjectImg.style.display = '';
              modalToggleMedia.textContent = 'Show Video';
            }
          };
        } else if (hasVideo) {
          modalToggleMedia.style.display = 'none';
          modalProjectVideo.style.display = '';
          modalProjectVideoSource.src = data.video;
          modalProjectVideo.load();
          modalProjectImg.style.display = 'none';
        } else {
          modalToggleMedia.style.display = 'none';
          modalProjectVideo.style.display = 'none';
          modalProjectVideoSource.src = '';
          modalProjectImg.style.display = '';
          modalProjectImg.src = data.img;
          modalProjectImg.alt = data.name + ' Screenshot';
        }
        if (!hasImage && hasVideo) {
          modalProjectImg.style.display = 'none';
        }
        if (!hasVideo && hasImage) {
          modalProjectVideo.style.display = 'none';
        }
        if (hasImage) {
          modalProjectImg.src = data.img;
          modalProjectImg.alt = data.name + ' Screenshot';
        }
        modalProjectName.textContent = data.name;
        modalProjectDesc.textContent = data.desc;
        // Tech stack
        modalProjectTech.innerHTML = '';
        data.tech.forEach(t => {
          const span = document.createElement('span');
          span.textContent = t;
          modalProjectTech.appendChild(span);
        });
        // Links
        modalProjectLinks.innerHTML = '';
        if (data.live && data.live !== '#') {
          const liveBtn = document.createElement('a');
          liveBtn.href = data.live;
          liveBtn.target = '_blank';
          liveBtn.textContent = 'Live Demo';
          modalProjectLinks.appendChild(liveBtn);
        }
        if (data.github && data.github !== '#') {
          const gitBtn = document.createElement('a');
          gitBtn.href = data.github;
          gitBtn.target = '_blank';
          gitBtn.textContent = 'GitHub';
          modalProjectLinks.appendChild(gitBtn);
        }
        // README
        modalReadmeSnippet.textContent = data.readme || 'No README available.';
        // Show modal
        projectModal.style.display = 'flex';
        setTimeout(() => { projectModal.style.opacity = 1; }, 10);
        document.body.style.overflow = 'hidden';
        // --- Modal: first tech tag acts as edit button ---
        enableModalTechEdit(data, idx, false, true);
      });
    });

    // Attach click listeners to artwork and photo cards for modal quick view
    const artworkPhotoCards = document.querySelectorAll('.gallery-item[data-category="artwork"], .gallery-item[data-category="photo"]');
    artworkPhotoCards.forEach(card => {
      // Add overlay if not present
      if (!card.querySelector('.project-overlay')) {
        const img = card.querySelector('img');
        const overlay = document.createElement('div');
        overlay.className = 'project-overlay';
        // Title
        const h3 = document.createElement('h3');
        h3.textContent = img ? img.alt : 'Untitled';
        // Description
        const desc = document.createElement('p');
        desc.textContent = card.getAttribute('data-category') === 'artwork' ? 'Artwork' : 'Photography';
        // Tech stack (empty)
        const techStack = document.createElement('div');
        techStack.className = 'tech-stack';
        // Assemble overlay
        overlay.appendChild(h3);
        overlay.appendChild(desc);
        overlay.appendChild(techStack);
        card.appendChild(overlay);
      }
      card.addEventListener('click', function(e) {
        // Prevent lightbox if clicking overlay
        if (e.target.tagName === 'IMG') e.preventDefault();
        const img = card.querySelector('img');
        img.setAttribute('loading', 'lazy');
        img.setAttribute('data-src', img.src);
        img.classList.add('lazy');
        img.src = '';
        modalProjectImg.src = img.src;
        modalProjectImg.alt = img.alt;
        modalProjectName.textContent = img.alt;
        modalProjectDesc.textContent = card.getAttribute('data-category') === 'artwork' ? 'Artwork' : 'Photography';
        // Hide tech stack, links, and README
        modalProjectTech.innerHTML = '';
        modalProjectLinks.innerHTML = '';
        modalReadmeSnippet.textContent = '';
        // Show modal
        projectModal.style.display = 'flex';
        setTimeout(() => { projectModal.style.opacity = 1; }, 10);
        document.body.style.overflow = 'hidden';
        // --- Modal: first tech tag acts as edit button ---
        enableModalTechEdit(data, idx, false, true);
      });
    });

    // Close modal logic
    closeProjectModal.addEventListener('click', function() {
      projectModal.classList.add('closing');
      setTimeout(() => {
        projectModal.style.display = 'none';
        projectModal.classList.remove('closing');
        document.body.style.overflow = '';
      }, 500);
    });

    // Close modal on overlay click
    projectModal.addEventListener('click', function(e) {
      if (e.target === projectModal) {
        closeProjectModal.click();
      }
    });

    // Close modal on Escape key
    window.addEventListener('keydown', function(e) {
      if (projectModal.style.display === 'flex' && e.key === 'Escape') {
        closeProjectModal.click();
      }
    });

    // --- GitHub Integration: Auto-fetch and display latest repos ---
    const githubUsername = 'karthikprasadm';
    const githubApiUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`;

    function fetchAndDisplayGithubProjects() {
      const gallery = document.getElementById('gallery');
      Array.from(gallery.querySelectorAll('.gallery-item[data-github]')).forEach(card => card.remove());
      const token = localStorage.getItem('githubToken');
      const headers = token ? { Authorization: `token ${token}` } : {};
      fetch(githubApiUrl, { headers })
        .then(res => res.json())
        .then(repos => {
          if (!Array.isArray(repos)) return;
          const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
          const manualNames = new Set([
            ...userProjects.map(p => p.name?.toLowerCase()),
            ...projectData.map(p => p.name?.toLowerCase())
          ]);
          repos.forEach(repo => {
            if (manualNames.has(repo.name?.toLowerCase())) return;
            // Create wrapper div to contain both card and project name
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: stretch;';
            
            // Create card
            const card = document.createElement('div');
            card.className = 'gallery-item';
            card.setAttribute('data-category', 'project');
            card.setAttribute('role', 'gridcell');
            card.setAttribute('data-github', '1');
            // Card image (use repo open graph image or fallback)
            const img = document.createElement('img');
            const thumbnail = `https://opengraph.githubassets.com/1/${githubUsername}/${repo.name}`;
            img.setAttribute('loading', 'lazy');
            img.setAttribute('data-src', thumbnail);
            img.classList.add('lazy');
            img.src = '';
            img.alt = `${repo.name} GitHub project`;
            // Overlay (match manual project overlay)
            const overlay = document.createElement('div');
            overlay.className = 'project-overlay';
            const h3 = document.createElement('h3');
            h3.textContent = repo.name;
            const desc = document.createElement('p');
            let description = repo.description || 'No description provided.';
            desc.textContent = description;
            const techStack = document.createElement('div');
            techStack.className = 'tech-stack';
            if (repo.language) {
              const lang = document.createElement('span');
              lang.textContent = repo.language;
              techStack.appendChild(lang);
            }
            overlay.appendChild(h3);
            overlay.appendChild(desc);
            overlay.appendChild(techStack);
            card.appendChild(img);
            card.appendChild(overlay);
            
            // Create project name element below card
            const projectName = document.createElement('div');
            projectName.className = 'project-name';
            projectName.textContent = repo.name;
            
            // Add to wrapper
            wrapper.appendChild(card);
            wrapper.appendChild(projectName);
            
            // Add wrapper to gallery
            gallery.appendChild(wrapper);
            // Modal click handler
            card.addEventListener('click', function(e) {
              if (e.target.tagName === 'IMG') e.preventDefault();
              // Video support for GitHub cards (future extensibility)
              const videoUrl = card.getAttribute('data-video');
              const hasVideo = !!videoUrl;
              const hasImage = !!img.src;
              if (hasVideo && hasImage) {
                modalToggleMedia.style.display = '';
                modalToggleMedia.textContent = 'Show Video';
                modalProjectImg.style.display = '';
                modalProjectVideo.style.display = 'none';
                modalToggleMedia.onclick = function() {
                  if (modalProjectImg.style.display !== 'none') {
                    modalProjectImg.style.display = 'none';
                    modalProjectVideo.style.display = '';
                    modalProjectVideoSource.src = videoUrl;
                    modalProjectVideo.load();
                    modalToggleMedia.textContent = 'Show Image';
                  } else {
                    modalProjectVideo.style.display = 'none';
                    modalProjectVideoSource.src = '';
                    modalProjectImg.style.display = '';
                    modalToggleMedia.textContent = 'Show Video';
                  }
                };
              } else if (hasVideo) {
                modalToggleMedia.style.display = 'none';
                modalProjectVideo.style.display = '';
                modalProjectVideoSource.src = videoUrl;
                modalProjectVideo.load();
                modalProjectImg.style.display = 'none';
              } else {
                modalToggleMedia.style.display = 'none';
                modalProjectVideo.style.display = 'none';
                modalProjectVideoSource.src = '';
                modalProjectImg.style.display = '';
                modalProjectImg.src = img.src;
                modalProjectImg.alt = img.alt;
              }
              if (!hasImage && hasVideo) {
                modalProjectImg.style.display = 'none';
              }
              if (!hasVideo && hasImage) {
                modalProjectVideo.style.display = 'none';
              }
              if (hasImage) {
                modalProjectImg.src = img.src;
                modalProjectImg.alt = img.alt;
              }
              modalProjectName.textContent = repo.name;
              modalProjectDesc.textContent = repo.description || 'No description provided.';
              modalProjectTech.innerHTML = '';
              if (repo.language) {
                const span = document.createElement('span');
                span.textContent = repo.language;
                modalProjectTech.appendChild(span);
              }
              modalProjectLinks.innerHTML = '';
              modalReadmeSnippet.textContent = '';
              projectModal.style.display = 'flex';
              setTimeout(() => { projectModal.style.opacity = 1; }, 10);
              document.body.style.overflow = 'hidden';
              enableModalTechEdit(repo);
            });
          });
        })
        .catch(err => console.error('GitHub fetch error:', err));
    }
    // Fetch GitHub projects on page load
    window.addEventListener('DOMContentLoaded', fetchAndDisplayGithubProjects);
    // Refresh button
    const refreshGithubBtn = document.getElementById('refreshGithubBtn');
    if (refreshGithubBtn) {
      refreshGithubBtn.addEventListener('click', function() {
        refreshGithubBtn.classList.add('refresh-rotating');
        fetchAndDisplayGithubProjects();
        setTimeout(() => refreshGithubBtn.classList.remove('refresh-rotating'), 1500);
      });
    }

    // --- Add Project UI Logic ---
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addNewProjectModal = document.getElementById('addNewProjectModal');
    const addNewProjectForm = document.getElementById('addNewProjectForm');
    const addProjectModal = document.getElementById('addProjectModal');
    const closeAddProjectModal = document.getElementById('closeAddProjectModal');
    const addProjectForm = document.getElementById('addProjectForm');
    const cancelAddProject = document.getElementById('cancelAddProject');
    const addEditProjectTitle = document.getElementById('addEditProjectTitle');

    // --- Password protection for Add Project ---
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const cancelPassword = document.getElementById('cancelPassword');

    const PROJECT_PASSWORD = 'Wingspawn@2728'; // Change as needed

    const deleteProjectBtn = document.getElementById('deleteProjectBtn');

    addProjectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      passwordInput.value = '';
      passwordError.style.display = 'none';
      passwordModal.style.display = 'flex';
      passwordInput.focus();
      // Set up password form to open ADD modal (not edit modal)
      passwordForm.onsubmit = function(e) {
        e.preventDefault();
        if (passwordInput.value === PROJECT_PASSWORD) {
          passwordModal.style.display = 'none';
          addNewProjectModal.style.display = 'flex';
          addNewProjectForm.reset();
        } else {
          passwordError.style.display = 'block';
          passwordInput.value = '';
          passwordInput.focus();
        }
      };
    });

    // Handle Add New Project form submission
    addNewProjectForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('newProjectNameAdd').value.trim();
      const thumbnail = document.getElementById('newProjectThumbnailAdd').value.trim();
      const img = document.getElementById('newProjectImgAdd').value.trim();
      const video = document.getElementById('newProjectVideoAdd').value.trim();
      const desc = document.getElementById('newProjectDescAdd').value.trim();
      const tech = document.getElementById('newProjectTechAdd').value.split(',').map(t => t.trim()).filter(Boolean);
      const readme = document.getElementById('newProjectReadmeAdd').value.trim();
      const newProject = { name, thumbnail, img, video, desc, tech, readme };
      // Save to localStorage
      let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      userProjects.push(newProject);
      localStorage.setItem('userProjects', JSON.stringify(userProjects));
      // Add to gallery
      addProjectToGallery(newProject, userProjects.length - 1);
      addNewProjectModal.style.display = 'none';
      addNewProjectForm.reset();
    });

    // Keep edit modal logic separate
    closeAddProjectModal.addEventListener('click', () => {
      addProjectModal.style.display = 'none';
      addEditProjectTitle.textContent = 'Edit Project';
      addProjectForm.reset();
      deleteProjectBtn.style.display = 'none';
    });
    cancelAddProject.addEventListener('click', () => {
      addProjectModal.style.display = 'none';
      addEditProjectTitle.textContent = 'Edit Project';
      addProjectForm.reset();
      deleteProjectBtn.style.display = 'none';
    });

    // Add project card to gallery
    function addProjectToGallery(data, idx = null) {
      const gallery = document.getElementById('gallery');
      
      // Create wrapper div to contain both card and project name
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: stretch;';
      
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.setAttribute('data-category', 'project');
      card.setAttribute('role', 'gridcell');
      // Card image (thumbnail)
      const img = document.createElement('img');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('data-src', data.thumbnail);
      img.classList.add('lazy');
      img.src = '';
      img.alt = data.name + ' Thumbnail';
      card.appendChild(img);
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'project-overlay';
      const h3 = document.createElement('h3');
      h3.textContent = data.name;
      const p = document.createElement('p');
      p.textContent = data.desc;
      const techDiv = document.createElement('div');
      techDiv.className = 'tech-stack';
      (data.tech || []).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        techDiv.appendChild(span);
      });
      overlay.appendChild(h3);
      overlay.appendChild(p);
      overlay.appendChild(techDiv);
      card.appendChild(overlay);
      
      // Create project name element below card
      const projectName = document.createElement('div');
      projectName.className = 'project-name';
      projectName.textContent = data.name;
      
      // Add to wrapper
      wrapper.appendChild(card);
      wrapper.appendChild(projectName);
      
      // Add modal click handler (reuse modal logic)
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) return;
        showProjectModal(data);
      });
      // Only for user-added projects: add Edit/Delete buttons
      if (idx !== null) {
        const btnWrap = document.createElement('div');
        btnWrap.style.position = 'absolute';
        btnWrap.style.top = '10px';
        btnWrap.style.right = '10px';
        btnWrap.style.display = 'flex';
        btnWrap.style.gap = '8px';
        btnWrap.style.zIndex = '10';
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.title = 'Edit Project';
        editBtn.className = 'edit-btn';
        editBtn.style.cssText = 'background:#bfcaff;color:#23234a;border:none;border-radius:8px;padding:4px 10px;font-size:1.1rem;cursor:pointer;box-shadow:0 2px 8px #23234a22;transition:background 0.2s;';
        editBtn.onclick = function(ev) {
          ev.stopPropagation();
          // Open modal with pre-filled data
          addProjectModal.style.display = 'flex';
          document.getElementById('newProjectName').value = data.name;
          document.getElementById('newProjectThumbnail').value = data.thumbnail;
          document.getElementById('newProjectImg').value = data.img || '';
          document.getElementById('newProjectVideo').value = data.video || '';
          document.getElementById('newProjectDesc').value = data.desc || '';
          document.getElementById('newProjectTech').value = (data.tech || []).join(', ');
          document.getElementById('newProjectReadme').value = data.readme || '';
          // On save, update instead of add
          addProjectForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('newProjectName').value.trim();
            const thumbnail = document.getElementById('newProjectThumbnail').value.trim();
            const img = document.getElementById('newProjectImg').value.trim();
            const video = document.getElementById('newProjectVideo').value.trim();
            const desc = document.getElementById('newProjectDesc').value.trim();
            const tech = document.getElementById('newProjectTech').value.split(',').map(t => t.trim()).filter(Boolean);
            const readme = document.getElementById('newProjectReadme').value.trim();
            let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
            userProjects[idx] = { name, thumbnail, img, video, desc, tech, readme };
            localStorage.setItem('userProjects', JSON.stringify(userProjects));
            // Refresh gallery
            renderUserProjects();
            addProjectModal.style.display = 'none';
            addProjectForm.reset();
            addEditProjectTitle.textContent = 'Add New Project';
            addProjectForm.onsubmit = defaultAddProjectSubmit;
          };
        };
        // First tech stack tag acts as edit button
        if (techDiv.children.length > 0) {
          const firstTech = techDiv.children[0];
          firstTech.style.cursor = 'pointer';
          firstTech.title = 'Edit Project';
          firstTech.addEventListener('click', function(ev) {
            ev.stopPropagation();
            editBtn.onclick(ev);
          });
        }
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑';
        deleteBtn.title = 'Delete Project';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.cssText = 'background:#ff6b6b;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:1.1rem;cursor:pointer;box-shadow:0 2px 8px #23234a22;transition:background 0.2s;';
        deleteBtn.onclick = function(ev) {
          ev.stopPropagation();
          if (confirm('Delete this project?')) {
            let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
            userProjects.splice(idx, 1);
            localStorage.setItem('userProjects', JSON.stringify(userProjects));
            renderUserProjects();
          }
        };
        btnWrap.appendChild(editBtn);
        btnWrap.appendChild(deleteBtn);
        card.appendChild(btnWrap);
      }
      gallery.appendChild(wrapper);
    }
    // Render all user projects (clear and re-add)
    function renderUserProjects() {
      // Remove all user project cards (those with .gallery-item[data-user])
      const gallery = document.getElementById('gallery');
      // Remove only user-added cards (those with .edit-btn)
      Array.from(gallery.querySelectorAll('.gallery-item .edit-btn')).forEach(btn => {
        btn.closest('.gallery-item').remove();
      });
      let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      userProjects.forEach((proj, idx) => addProjectToGallery(proj, idx));
    }
    // Save default add handler for restore after edit
    const defaultAddProjectSubmit = addProjectForm.onsubmit;
    // On page load, load user projects from localStorage
    window.addEventListener('DOMContentLoaded', () => {
      renderUserProjects();
    });
    // Helper: show modal for new projects
    function showProjectModal(data) {
      const modal = document.getElementById('projectModal');
      const modalImg = document.getElementById('modalProjectImg');
      const modalVideo = document.getElementById('modalProjectVideo');
      const modalVideoSource = document.getElementById('modalProjectVideoSource');
      const modalToggleMedia = document.getElementById('modalToggleMedia');
      const modalName = document.getElementById('modalProjectName');
      const modalDesc = document.getElementById('modalProjectDesc');
      const modalTech = document.getElementById('modalProjectTech');
      const modalReadme = document.getElementById('modalProjectReadme');
      // Set content
      modalName.textContent = data.name;
      modalDesc.textContent = data.desc;
      modalTech.innerHTML = '';
      (data.tech || []).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        modalTech.appendChild(span);
      });
      modalReadme.textContent = data.readme || '';
      // Media logic
      const hasVideo = !!data.video;
      const hasImg = !!data.img;
      if (hasVideo && hasImg) {
        modalImg.src = data.img;
        modalImg.style.display = '';
        modalVideoSource.src = data.video;
        modalVideo.load();
        modalVideo.style.display = 'none';
        modalToggleMedia.style.display = '';
        modalToggleMedia.textContent = 'Show Video';
        modalToggleMedia.onclick = function() {
          if (modalImg.style.display !== 'none') {
            modalImg.style.display = 'none';
            modalVideo.style.display = '';
            modalToggleMedia.textContent = 'Show Image';
          } else {
            modalImg.style.display = '';
            modalVideo.style.display = 'none';
            modalToggleMedia.textContent = 'Show Video';
          }
        };
      } else if (hasVideo) {
        modalImg.style.display = 'none';
        modalVideoSource.src = data.video;
        modalVideo.load();
        modalVideo.style.display = '';
        modalToggleMedia.style.display = 'none';
      } else {
        modalImg.src = data.img || data.thumbnail;
        modalImg.style.display = '';
        modalVideo.style.display = 'none';
        modalToggleMedia.style.display = 'none';
      }
      modal.style.display = 'flex';
      // --- Modal: first tech tag acts as edit button ---
      enableModalTechEdit(data);
    }
    // --- Modal: first tech tag acts as edit button ---
    function enableModalTechEdit(currentProjectData, projectIdx = null, isUserProject = false, isManualProject = false) {
      const modalTech = document.getElementById('modalProjectTech');
      if (modalTech && modalTech.children.length > 0) {
        const firstTech = modalTech.children[0];
        firstTech.style.cursor = 'pointer';
        firstTech.title = 'Edit Project';
        firstTech.onclick = function(ev) {
          ev.stopPropagation();
          // Show password modal before allowing edit
          passwordInput.value = '';
          passwordError.style.display = 'none';
          passwordModal.style.display = 'flex';
          passwordInput.focus();
          // On password submit, if correct, open the add project modal for editing
          passwordForm.onsubmit = function(e) {
            e.preventDefault();
            if (passwordInput.value === PROJECT_PASSWORD) {
              passwordModal.style.display = 'none';
              addProjectModal.style.display = 'flex';
              addEditProjectTitle.textContent = 'Edit Project';
              deleteProjectBtn.style.display = 'inline-block';
              document.getElementById('newProjectName').value = currentProjectData.name;
              document.getElementById('newProjectThumbnail').value = currentProjectData.thumbnail || '';
              document.getElementById('newProjectImg').value = currentProjectData.img || '';
              document.getElementById('newProjectVideo').value = currentProjectData.video || '';
              document.getElementById('newProjectDesc').value = currentProjectData.desc || '';
              document.getElementById('newProjectTech').value = (currentProjectData.tech || []).join(', ');
              document.getElementById('newProjectReadme').value = currentProjectData.readme || '';
              // On save, overwrite the original project
              addProjectForm.onsubmit = function(e2) {
                e2.preventDefault();
                const name = document.getElementById('newProjectName').value.trim();
                const thumbnail = document.getElementById('newProjectThumbnail').value.trim();
                const img = document.getElementById('newProjectImg').value.trim();
                const video = document.getElementById('newProjectVideo').value.trim();
                const desc = document.getElementById('newProjectDesc').value.trim();
                const tech = document.getElementById('newProjectTech').value.split(',').map(t => t.trim()).filter(Boolean);
                const readme = document.getElementById('newProjectReadme').value.trim();
                if (isUserProject && projectIdx !== null) {
                  let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
                  userProjects[projectIdx] = { name, thumbnail, img, video, desc, tech, readme };
                  localStorage.setItem('userProjects', JSON.stringify(userProjects));
                  renderUserProjects();
                } else if (isManualProject && projectIdx !== null) {
                  projectData[projectIdx] = { name, thumbnail, img, video, desc, tech, readme };
                  location.reload();
                } else {
                  let userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
                  userProjects.push({ name, thumbnail, img, video, desc, tech, readme });
                  localStorage.setItem('userProjects', JSON.stringify(userProjects));
                  renderUserProjects();
                }
                addProjectModal.style.display = 'none';
                addEditProjectTitle.textContent = 'Add New Project';
                addProjectForm.reset();
                addProjectForm.onsubmit = defaultAddProjectSubmit;
                deleteProjectBtn.style.display = 'none';
              };
            } else {
              passwordError.style.display = 'block';
              passwordInput.value = '';
              passwordInput.focus();
              deleteProjectBtn.style.display = 'none';
            }
          };
        };
      }
    }

    // --- GitHub Token Modal Logic ---
    const setGithubTokenBtn = document.getElementById('setGithubTokenBtn');
    const githubTokenModal = document.getElementById('githubTokenModal');
    const closeGithubTokenModal = document.getElementById('closeGithubTokenModal');
    const githubTokenForm = document.getElementById('githubTokenForm');
    const githubTokenInput = document.getElementById('githubTokenInput');
    const githubTokenError = document.getElementById('githubTokenError');
    const cancelGithubToken = document.getElementById('cancelGithubToken');

    setGithubTokenBtn.addEventListener('click', function() {
      // Password protect the token modal
      passwordInput.value = '';
      passwordError.style.display = 'none';
      passwordModal.style.display = 'flex';
      passwordInput.focus();
      passwordForm.onsubmit = function(e) {
        e.preventDefault();
        if (passwordInput.value === PROJECT_PASSWORD) {
          passwordModal.style.display = 'none';
          githubTokenInput.value = localStorage.getItem('githubToken') || '';
          githubTokenError.style.display = 'none';
          githubTokenModal.style.display = 'flex';
          githubTokenInput.focus();
        } else {
          passwordError.style.display = 'block';
          passwordInput.value = '';
          passwordInput.focus();
        }
      };
    });
    closeGithubTokenModal.addEventListener('click', function() {
      githubTokenModal.style.display = 'none';
    });
    cancelGithubToken.addEventListener('click', function() {
      githubTokenModal.style.display = 'none';
    });
    githubTokenForm.addEventListener('submit', function(e) {
      e.preventDefault();
      localStorage.setItem('githubToken', githubTokenInput.value.trim());
      githubTokenModal.style.display = 'none';
      fetchAndDisplayGithubProjects();
    });

    // --- BRUTE FORCE: Password Modal Close Handler ---
    setInterval(function() {
      const passwordModal = document.getElementById('passwordModal');
      const closeBtn = document.getElementById('closePasswordModal');
      
      if (passwordModal && closeBtn) {
        // Force attach click handler every 100ms
        closeBtn.onclick = function() {
          passwordModal.style.display = 'none';
          document.body.style.overflow = '';
        };
        
        // Also check if modal is visible and ESC is pressed
        document.onkeydown = function(e) {
          if (e.key === 'Escape' && passwordModal.style.display === 'flex') {
            passwordModal.style.display = 'none';
            document.body.style.overflow = '';
          }
        };
      }
    }, 100);

    // --- Password Modal Universal Close Logic ---
    document.addEventListener('click', function(e) {
      const passwordModal = document.getElementById('passwordModal');
      if (!passwordModal) return;
      // X button
      if (e.target && e.target.id === 'closePasswordModal') {
        passwordModal.style.display = 'none';
        document.body.style.overflow = '';
      }
      // Click outside modal content
      if (
        e.target === passwordModal &&
        passwordModal.style.display === 'flex'
      ) {
        passwordModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
}); 