document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Add stars background dynamically
    if (!document.querySelector('.stars')) {
        const stars = document.createElement('div');
        stars.className = 'stars';
        document.body.appendChild(stars);
    }
    
    // Enhanced image viewing
    const projectImage = document.querySelector('.project-image');
    if (projectImage) {
        // Click to view full size
        projectImage.addEventListener('click', function() {
            if (this.style.position === 'fixed') {
                // Close fullscreen
                this.style.position = 'static';
                this.style.top = 'auto';
                this.style.left = 'auto';
                this.style.width = '100%';
                this.style.height = 'auto';
                this.style.zIndex = 'auto';
                this.style.cursor = 'pointer';
                this.style.objectFit = 'cover';
                document.body.style.overflow = 'auto';
            } else {
                // Open fullscreen
                this.style.position = 'fixed';
                this.style.top = '0';
                this.style.left = '0';
                this.style.width = '100vw';
                this.style.height = '100vh';
                this.style.zIndex = '1000';
                this.style.cursor = 'zoom-out';
                this.style.objectFit = 'contain';
                this.style.backgroundColor = 'rgba(0,0,0,0.9)';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Enhanced tech tag interactions
    const techTags = document.querySelectorAll('.tech-tag');
    techTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const techName = this.textContent.toLowerCase();
            // Could add search functionality here
            console.log(`Clicked on technology: ${techName}`);
        });
    });
    
    // Smooth scroll for any internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add parallax effect to project hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.project-hero');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Add loading animation complete handler
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                // Close fullscreen image if open
                const fullscreenImage = document.querySelector('.project-image[style*="position: fixed"]');
                if (fullscreenImage) {
                    fullscreenImage.click();
                }
                break;
            case 'ArrowLeft':
                // Go back (could enhance with actual navigation)
                if (e.ctrlKey || e.metaKey) {
                    window.history.back();
                }
                break;
        }
    });
    
    // Add copy link functionality to project links
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        if (link.textContent.includes('View Project') || link.textContent.includes('Live Demo')) {
            link.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(this.href);
                    showToast('Link copied to clipboard!');
                }
            });
        }
    });
    
    // Intersection Observer for animation triggers
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe project content sections
    const contentSections = document.querySelectorAll('.project-content');
    contentSections.forEach(section => {
        observer.observe(section);
    });
    
    // Enhanced accessibility for screen readers
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.setAttribute('aria-label', 'Go back to previous page');
    }
    
    // Add focus management
    const focusableElements = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #ffb347';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

// Toast notification function
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 179, 71, 0.9);
        color: #222;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    .loaded .project-container {
        animation-delay: 0.1s;
    }
`;
document.head.appendChild(style); 