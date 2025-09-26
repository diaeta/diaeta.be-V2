/**
 * FAQ Category Switching and Enhanced Interactions
 * Handles category filtering and smooth transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    const faqCategories = document.querySelectorAll('.faq-category-btn');
    const faqCategorySections = document.querySelectorAll('.faq-category');
    
    if (faqCategories.length === 0 || faqCategorySections.length === 0) {
        return; // Exit if FAQ elements don't exist
    }
    
    // Initialize FAQ functionality
    initFAQCategories();
    initFAQAnimations();
    initFAQAccessibility();
    
    function initFAQCategories() {
        faqCategories.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetCategory = this.getAttribute('data-category');
                
                // Update active button
                faqCategories.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide category sections
                faqCategorySections.forEach(section => {
                    const sectionCategory = section.getAttribute('data-category');
                    
                    if (sectionCategory === targetCategory) {
                        section.classList.remove('d-none');
                        // Trigger animation
                        section.style.animation = 'none';
                        section.offsetHeight; // Trigger reflow
                        section.style.animation = 'fadeInUp 0.5s ease-out';
                    } else {
                        section.classList.add('d-none');
                    }
                });
                
                // Update URL hash for bookmarking
                if (history.pushState) {
                    history.pushState(null, null, `#faq-${targetCategory}`);
                }
                
                // Scroll to FAQ section if not visible
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                    const rect = faqSection.getBoundingClientRect();
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        faqSection.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }
            });
        });
    }
    
    function initFAQAnimations() {
        // Add intersection observer for FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            faqItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(item);
            });
        }
    }
    
    function initFAQAccessibility() {
        // Enhanced keyboard navigation
        faqCategories.forEach((button, index) => {
            button.addEventListener('keydown', function(e) {
                let targetIndex;
                
                switch(e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % faqCategories.length;
                        faqCategories[targetIndex].focus();
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = index === 0 ? faqCategories.length - 1 : index - 1;
                        faqCategories[targetIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        faqCategories[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        faqCategories[faqCategories.length - 1].focus();
                        break;
                }
            });
        });
        
        // Enhanced details/summary accessibility
        const faqDetails = document.querySelectorAll('.faq-details');
        faqDetails.forEach(details => {
            const summary = details.querySelector('.faq-summary');
            
            if (summary) {
                summary.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        details.open = !details.open;
                        
                        // Update ARIA attributes
                        const toggle = summary.querySelector('.faq-toggle');
                        if (toggle) {
                            const icon = toggle.querySelector('i');
                            if (icon) {
                                icon.style.transform = details.open ? 'rotate(180deg)' : 'rotate(0deg)';
                            }
                        }
                    }
                });
                
                // Update ARIA attributes when details open/close
                details.addEventListener('toggle', function() {
                    const toggle = summary.querySelector('.faq-toggle');
                    if (toggle) {
                        const icon = toggle.querySelector('i');
                        if (icon) {
                            icon.style.transform = details.open ? 'rotate(180deg)' : 'rotate(0deg)';
                        }
                    }
                });
            }
        });
    }
    
    // Handle URL hash on page load
    function handleInitialHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#faq-')) {
            const category = hash.replace('#faq-', '');
            const targetButton = document.querySelector(`[data-category="${category}"]`);
            
            if (targetButton) {
                targetButton.click();
            }
        }
    }
    
    // Initialize on page load
    handleInitialHash();
    
    // Handle browser back/forward
    window.addEventListener('popstate', handleInitialHash);
    
    // Add smooth scrolling for FAQ links
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#faq"]')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
    
    // Add analytics tracking (if analytics is available)
    if (typeof gtag !== 'undefined') {
        faqCategories.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                gtag('event', 'faq_category_click', {
                    'event_category': 'FAQ',
                    'event_label': category,
                    'value': 1
                });
            });
        });
        
        const faqDetails = document.querySelectorAll('.faq-details');
        faqDetails.forEach(details => {
            details.addEventListener('toggle', function() {
                if (this.open) {
                    const question = this.querySelector('.faq-question')?.textContent;
                    gtag('event', 'faq_question_open', {
                        'event_category': 'FAQ',
                        'event_label': question,
                        'value': 1
                    });
                }
            });
        });
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initFAQCategories, initFAQAnimations, initFAQAccessibility };
}
