// about.js - basic script for about.html

document.addEventListener('DOMContentLoaded', function() {
    console.log('about.js loaded successfully!');
    // Example: Add a simple effect to the about page
    const aboutHeader = document.querySelector('h1, h2, h3');
    if (aboutHeader) {
        aboutHeader.style.color = '#4caf50';
        aboutHeader.style.textShadow = '0 2px 8px #222';
    }
}); 