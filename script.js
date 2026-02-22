document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }

    // Hamburger menu toggle for mobile
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('nav');
    const navLinks = nav?.querySelectorAll('a');

    function toggleNav() {
        document.body.classList.toggle('nav-open');
        hamburger?.setAttribute('aria-expanded', document.body.classList.contains('nav-open'));
    }

    hamburger?.addEventListener('click', toggleNav);
    navLinks?.forEach((link) => link.addEventListener('click', () => {
        if (window.innerWidth <= 720) toggleNav();
    }));

    // Intersection Observer for highlighting numbers animation
    const animateNumbers = () => {
        const highlightNumbers = document.querySelectorAll('.highlight-number');

        const observerOptions = {
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const target = entry.target;

                if (!target.dataset.targetValue) {
                    const originalText = target.innerText;
                    target.dataset.targetValue = originalText.replace(/[^0-9]/g, '');
                    target.dataset.suffix = originalText.replace(/[0-9]/g, '');
                }

                if (entry.isIntersecting) {
                    const targetNum = parseInt(target.dataset.targetValue);
                    const suffix = target.dataset.suffix;
                    animateCount(target, targetNum, suffix);
                } else {
                    target.innerText = '0' + (target.dataset.suffix || '');
                    if (target.dataset.intervalId) {
                        clearInterval(parseInt(target.dataset.intervalId));
                    }
                }
            });
        }, observerOptions);

        highlightNumbers.forEach(number => {
            observer.observe(number);
        });
    };

    const animateCount = (element, target, suffix) => {
        if (element.dataset.intervalId) {
            clearInterval(parseInt(element.dataset.intervalId));
        }

        let current = 0;
        const duration = 1500;
        const frameRate = 30;
        const totalFrames = duration / frameRate;
        const increment = target / totalFrames;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.innerText = target + suffix;
                clearInterval(timer);
            } else {
                element.innerText = Math.floor(current) + suffix;
            }
        }, frameRate);

        element.dataset.intervalId = timer.toString();
    };

    animateNumbers();

    // Reusable Slider Implementation
    const initSlider = (config) => {
        const {
            containerSelector,
            trackSelector,
            prevSelector,
            nextSelector,
            dotsSelector,
            itemSelector,
            responsive
        } = config;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        const track = container.querySelector(trackSelector);
        const prevBtn = container.querySelector(prevSelector);
        const nextBtn = container.querySelector(nextSelector);
        const dotsContainer = container.querySelector(dotsSelector);
        const items = track.querySelectorAll(itemSelector);

        let currentIndex = 0;
        let itemsPerView = 3;

        const updateItemsPerView = () => {
            const width = window.innerWidth;
            if (width <= 540) {
                itemsPerView = responsive.mobile;
            } else if (width <= 720) {
                itemsPerView = responsive.tablet;
            } else {
                itemsPerView = responsive.desktop;
            }
        };

        const getTotalSlides = () => {
            return Math.max(1, items.length - itemsPerView + 1);
        };

        const createDots = () => {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const totalSlides = getTotalSlides();

            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === 0) dot.classList.add('active');

                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        };

        const updateSlider = () => {
            const itemWidth = items[0].offsetWidth;
            const style = getComputedStyle(track);
            const gap = parseFloat(style.gap) || 0;
            const offset = -(currentIndex * (itemWidth + gap));

            track.style.transform = `translateX(${offset}px)`;

            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }

            const totalSlides = getTotalSlides();
            if (prevBtn) {
                prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
                prevBtn.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
            }
            if (nextBtn) {
                nextBtn.style.opacity = currentIndex >= totalSlides - 1 ? '0.5' : '1';
                nextBtn.style.cursor = currentIndex >= totalSlides - 1 ? 'not-allowed' : 'pointer';
            }
        };

        const goToSlide = (index) => {
            const totalSlides = getTotalSlides();
            currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
            updateSlider();
        };

        const prevSlide = () => {
            if (currentIndex > 0) goToSlide(currentIndex - 1);
        };

        const nextSlide = () => {
            const totalSlides = getTotalSlides();
            if (currentIndex < totalSlides - 1) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(0);
            }
        };

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                nextSlide();
            } else if (touchEndX - touchStartX > swipeThreshold) {
                prevSlide();
            }
        }, { passive: true });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldPerView = itemsPerView;
                updateItemsPerView();
                if (oldPerView !== itemsPerView) {
                    currentIndex = 0;
                    createDots();
                }
                updateSlider();
            }, 250);
        });

        updateItemsPerView();
        createDots();
        updateSlider();
    };



    // Initialize Gallery Slider
    initSlider({
        containerSelector: '.gallery-slider-container',
        trackSelector: '.gallery-track',
        prevSelector: '.gallery-prev',
        nextSelector: '.gallery-next',
        dotsSelector: '.gallery-dots',
        itemSelector: '.gallery-item',
        responsive: {
            mobile: 1,
            tablet: 2,
            desktop: 3
        }
    });


    // Initialize Testimonials Slider
    initSlider({
        containerSelector: '.testimonial-slider-container',
        trackSelector: '.testimonial-track',
        prevSelector: '.testimonials-prev',
        nextSelector: '.testimonials-next',
        dotsSelector: '.testimonials-dots',
        itemSelector: '.testimonial-card',
        responsive: {
            mobile: 1,
            tablet: 2,
            desktop: 3
        }
    });

    // Top Picks Showcase Auto-Slider
    const initTopPicksShowcase = () => {
        const showcase = document.querySelector('.top-picks-showcase');
        if (!showcase) return;

        const track = showcase.querySelector('.showcase-track');
        const items = showcase.querySelectorAll('.showcase-item');
        const indicatorsContainer = showcase.querySelector('.showcase-indicators');

        let currentIndex = 0;
        let autoSlideInterval = null;
        const slideInterval = 3500;

        items.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('showcase-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        const indicators = indicatorsContainer.querySelectorAll('.showcase-indicator');

        const updateShowcase = () => {
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = index;
            updateShowcase();
            restartAutoSlide();
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateShowcase();
        };

        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, slideInterval);
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        };

        const restartAutoSlide = () => {
            stopAutoSlide();
            startAutoSlide();
        };

        showcase.addEventListener('mouseenter', stopAutoSlide);
        showcase.addEventListener('mouseleave', startAutoSlide);

        startAutoSlide();
    };

    initTopPicksShowcase();
});

let items = [];

function getBtnData(e) {
    const cakeType = e.target.dataset["category"];

    const modal = document.getElementById("gallery-modal");
    const closeBtn = document.getElementById("close-gallery");
    const galleryEl = document.getElementById("birthday-gallery");

    // Load JSON only when button is clicked
    fetch(`assets/json/${cakeType}.json`)
        .then(res => res.json())
        .then(data => {
            items = data.images;
            renderGallery();
            modal.style.display = "block";
            document.body.style.overflow = "hidden";
        });

    // Render thumbnails
    function renderGallery() {
        galleryEl.innerHTML = '';

        items.forEach((item, index) => {
            const img = document.createElement("img");
            img.src = item.src;
            img.dataset.index = index;
            galleryEl.appendChild(img);
        });
    }

    // Close popup
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        modal.style.display = "none";
        document.body.style.overflow = "visible";
    };

    // Click outside to close
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "visible";
        }
    };

    // Open PhotoSwipe slider
    galleryEl.onclick = (event) => {
        if (event.target.tagName === "IMG") {
            const index = parseInt(event.target.dataset.index);
            openSlider(index);
        }
    };
}

function openSlider(index) {
    const pswp = new PhotoSwipe({
        dataSource: items,
        index: index,
        showHideAnimationType: 'zoom'
    });

    pswp.on('uiRegister', function () {
        pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            appendTo: 'root',
            html: '',
            onInit: (el, pswp) => {
                pswp.on('change', () => {
                    const curr = pswp.currSlide.data;
                    el.innerHTML = curr.title || '';
                });
            }
        });
    });

    pswp.init();
}

document.getElementById('orderForm').addEventListener('submit', (event) => {    
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    let contact = "+918160365513";
    let postLink = window.location.href;

    const name = formData.get("name") || "Customer";
    let message = `New message from ${name}\n\n`;

    formData.forEach((value, key) => { let label = key.charAt(0).toUpperCase() + key.slice(1); message += `*${label}:* ${value}\n`; });

    message += `\n=============================\n`; message += `*Form:* ${postLink}\n`; message += `=============================`;

    const encodedMessage = encodeURI(message);

    var link;

    link = `https://api.whatsapp.com/send/?phone=${contact}&text=${encodedMessage}`

    window.open(link, '_blank');

    form.reset();
})