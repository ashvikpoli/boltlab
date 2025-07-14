document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .step, .testimonial-card, .pricing-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = element.classList.contains('pricing-card featured') 
                    ? 'scale(1.05) translateY(0)' 
                    : 'translateY(0)';
            }
        });
    };

    // Set initial styles for animation
    document.querySelectorAll('.feature-card, .step, .testimonial-card, .pricing-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = element.classList.contains('pricing-card featured')
            ? 'scale(1.05) translateY(20px)'
            : 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Run animation on load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Mobile menu toggle
    const createMobileMenu = () => {
        const nav = document.querySelector('nav');
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = `
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        `;
        
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Clone nav links
        const navLinks = document.querySelector('.nav-links').cloneNode(true);
        mobileMenu.appendChild(navLinks);
        
        // Add CTA button
        const ctaButton = document.querySelector('.cta-button').cloneNode(true);
        mobileMenu.appendChild(ctaButton);
        
        // Add to DOM
        nav.appendChild(mobileMenuBtn);
        nav.appendChild(mobileMenu);
        
        // Toggle menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    };
    
    // Only create mobile menu on smaller screens
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenu();
        }
    });
});