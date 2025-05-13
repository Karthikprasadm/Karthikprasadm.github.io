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
        if (!displayedImage) return;
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
    const thumbnailsContainer = document.querySelector(".thumbnails");
    if (thumbnailsContainer) {
        thumbnailsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("thumb")) {
                const imageUrl = e.target.getAttribute("data-src");
                changeImage(e.target, imageUrl);
                stopSlideshow(); // Stop slideshow when manually changing images
            }
        });
    }

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
        if (slideshowToggle) slideshowToggle.textContent = "🌙"; // Reset button text
    }

    // Slideshow toggle
    if (slideshowToggle) {
        slideshowToggle.addEventListener("click", function () {
            isSlideshowActive = !isSlideshowActive;
            this.textContent = isSlideshowActive ? "🌕" : "🌙";
            if (isSlideshowActive) {
                startSlideshow();
            } else {
                stopSlideshow();
            }
        });
    }

    // Double-click to enter fullscreen
    if (displayedImage) {
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
    }

    // Handle fullscreen change events
    function handleFullscreenChange() {
        if (displayedImage) {
            if (document.fullscreenElement) {
                displayedImage.classList.add("fullscreen");
            } else {
                displayedImage.classList.remove("fullscreen");
            }
        }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Video functionality
    const videoThumbnails = document.querySelectorAll(".video-thumb");
    const displayedVideo = document.getElementById("displayedVideo");

    // Change video function
    function changeVideo(thumbnail, videoUrl) {
        if (!displayedVideo) return;
        displayedVideo.src = videoUrl;
        displayedVideo.load();
        displayedVideo.play();
        videoThumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    }

    const videoThumbnailsContainer = document.querySelector(".video-thumbnails");
    if (videoThumbnailsContainer) {
        videoThumbnailsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("video-thumb")) {
                const videoUrl = e.target.getAttribute("data-src");
                changeVideo(e.target, videoUrl);
            }
        });
    }

    const uploadButton = document.querySelector('.upload-form button');
    if (uploadButton) {
        uploadButton.addEventListener('click', function(e) {
            e.preventDefault();
            const fileInput = document.querySelector('input[type="file"]');
            const progressBar = document.querySelector('.progress');
            const file = fileInput ? fileInput.files[0] : null;
            if (!file) return;
        
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/your-upload-endpoint'); // Change this to your actual upload endpoint
        
            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable && progressBar) {
                    const percent = (e.loaded / e.total) * 100;
                    progressBar.style.width = percent + '%';
                }
            });
        
            xhr.onload = function() {
                if (xhr.status === 200 && progressBar) {
                    progressBar.style.width = '100%';
                } else if (progressBar) {
                    progressBar.style.width = '0%';
                }
            };
        
            const formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);
        });
    }
});
