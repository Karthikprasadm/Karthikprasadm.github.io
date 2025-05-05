document.addEventListener("DOMContentLoaded", function () {
    const thumbnails = document.querySelectorAll(".thumb");
    const displayedImage = document.getElementById("displayedImage");
    const slideshowToggle = document.getElementById("slideshowToggle");
    let slideshowInterval;
    let isSlideshowActive = false;
    const imageList = Array.from(thumbnails).map(thumb => thumb.getAttribute("data-src"));
    let currentIndex = 0;

    // Lazy load thumbnails
    const lazyLoad = (thumb) => {
        const src = thumb.getAttribute("data-src");
        thumb.setAttribute("src", src);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lazyLoad(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    thumbnails.forEach(thumb => observer.observe(thumb));

    // Change image function
    function changeImage(thumbnail, imageUrl) {
        displayedImage.style.transition = "opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)";
        displayedImage.style.opacity = "0";
        displayedImage.style.transform = "scale(0.96)";
        setTimeout(() => {
            displayedImage.src = imageUrl;
            displayedImage.onload = function() {
                displayedImage.style.opacity = "1";
                displayedImage.style.transform = "scale(1)";
            };
        }, 80);

        thumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    }

    // Event delegation for thumbnails
    document.querySelector(".thumbnails").addEventListener("click", function (e) {
        if (e.target.classList.contains("thumb")) {
            const imageUrl = e.target.getAttribute("data-src");
            changeImage(e.target, imageUrl);
            stopSlideshow(); // Stop slideshow when manually changing images
        }
    });

    // Slideshow functions
    function startSlideshow() {
        slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % imageList.length; // Cycle through images
            const nextThumbnail = thumbnails[currentIndex];
            changeImage(nextThumbnail, imageList[currentIndex]);
        }, 3500); // Change image every 3.5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideshowInterval);
        isSlideshowActive = false;
        slideshowToggle.textContent = "🌙"; // Reset button text
    }

    // Slideshow toggle
    slideshowToggle.addEventListener("click", function () {
        isSlideshowActive = !isSlideshowActive;
        this.textContent = isSlideshowActive ? "🌕" : "🌙";
        if (isSlideshowActive) {
            startSlideshow();
        } else {
            stopSlideshow();
        }
    });

    // Double-click to enter fullscreen
    displayedImage.addEventListener("dblclick", function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            if (displayedImage.requestFullscreen) {
                displayedImage.requestFullscreen();
            } else if (displayedImage.mozRequestFullScreen) {
                displayedImage.mozRequestFullScreen();
            } else if (displayedImage.webkitRequestFullscreen) {
                displayedImage.webkitRequestFullscreen();
            } else if (displayedImage.msRequestFullscreen) {
                displayedImage.msRequestFullscreen();
            }
        }
    });

    // Handle fullscreen change events
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    function handleFullscreenChange() {
        if (document.fullscreenElement) {
            displayedImage.classList.add("fullscreen");
        } else {
            displayedImage.classList.remove("fullscreen");
        }
    }

    // Video functionality
    const videoThumbnails = document.querySelectorAll(".video-thumb");
    const displayedVideo = document.getElementById("displayedVideo");

    // Change video function
    function changeVideo(thumbnail, videoUrl) {
        displayedVideo.src = videoUrl;
        displayedVideo.load();
        displayedVideo.play();
        videoThumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    }

    document.querySelector(".video-thumbnails").addEventListener("click", function (e) {
        if (e.target.classList.contains("video-thumb")) {
            const videoUrl = e.target.getAttribute("data-src");
            changeVideo(e.target, videoUrl);
        }
    });

    document.querySelector('.upload-form button').addEventListener('click', function(e) {
        e.preventDefault();
        const fileInput = document.querySelector('input[type="file"]');
        const progressBar = document.querySelector('.progress');
        const file = fileInput.files[0];
        if (!file) return;
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/your-upload-endpoint'); // Change this to your actual upload endpoint
    
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                progressBar.style.width = percent + '%';
            }
        });
    
        xhr.onload = function() {
            if (xhr.status === 200) {
                progressBar.style.width = '100%';
            } else {
                progressBar.style.width = '0%';
            }
        };
    
        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
    });
});
