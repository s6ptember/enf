document.addEventListener('htmx:afterSwap', function(event) {
    // Re-initialize Alpine.js after HTMX swap
    Alpine.initTree(document.body);
});

function accessibilitySystem() {
    return {
        showAccessibilityPanel: false,
        isSpeaking: false,
        settings: {
            fontSize: 16,
            highContrast: false,
            largeCursor: false,
            enhancedFocus: false,
            reduceMotion: false,
            focusMode: false,
            dyslexiaFont: false,
            readingFocus: false
        },
        
        init() {
            this.loadSettings();
            this.setupKeyboardShortcuts();
            this.applyFontSize();
            this.setupReadingFocus();
            
            // Save settings on change
            this.$watch('settings', () => {
                this.saveSettings();
            }, { deep: true });
            
            // Watch for reading focus changes
            this.$watch('settings.readingFocus', (newValue) => {
                if (newValue) {
                    this.enableReadingFocus();
                } else {
                    this.disableReadingFocus();
                }
            });
        },
        
        loadSettings() {
            const saved = localStorage.getItem('accessibilitySettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        },
        
        saveSettings() {
            localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        },
        
        applyFontSize() {
            document.documentElement.style.fontSize = this.settings.fontSize + 'px';
        },
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.altKey) {
                    switch(e.key.toLowerCase()) {
                        case 'a':
                            e.preventDefault();
                            this.showAccessibilityPanel = !this.showAccessibilityPanel;
                            this.announce(this.showAccessibilityPanel ? 'Accessibility panel opened' : 'Accessibility panel closed');
                            break;
                        case 's':
                            e.preventDefault();
                            this.toggleSpeech();
                            break;
                        case 'f':
                            e.preventDefault();
                            this.toggleFullscreen();
                            break;
                    }
                }
                // Escape key to close accessibility panel
                if (e.key === 'Escape' && this.showAccessibilityPanel) {
                    this.showAccessibilityPanel = false;
                    this.announce('Accessibility panel closed');
                }
            });
        },
        
        toggleSpeech() {
            if (this.isSpeaking) {
                speechSynthesis.cancel();
                this.isSpeaking = false;
                this.announce('Speech stopped');
            } else {
                const text = document.querySelector('#main-content').innerText;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                utterance.onend = () => {
                    this.isSpeaking = false;
                };
                utterance.onerror = () => {
                    this.isSpeaking = false;
                    this.announce('Speech error occurred');
                };
                speechSynthesis.speak(utterance);
                this.isSpeaking = true;
                this.announce('Reading page content');
            }
        },
        
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    this.announce('Entered fullscreen mode');
                }).catch(() => {
                    this.announce('Fullscreen not supported');
                });
            } else {
                document.exitFullscreen().then(() => {
                    this.announce('Exited fullscreen mode');
                });
            }
        },
        
        announce(message) {
            const announcer = document.getElementById('announcer');
            if (announcer) {
                announcer.textContent = message;
                setTimeout(() => {
                    announcer.textContent = '';
                }, 1000);
            }
        },
        
        setupReadingFocus() {
            this.readingFocusHandler = (e) => {
                if (this.settings.readingFocus) {
                    this.updateReadingFocus(e.clientY);
                }
            };
        },
        
        enableReadingFocus() {
            document.addEventListener('mousemove', this.readingFocusHandler);
            this.announce('Reading focus mode enabled');
        },
        
        disableReadingFocus() {
            document.removeEventListener('mousemove', this.readingFocusHandler);
            this.announce('Reading focus mode disabled');
        },
        
        updateReadingFocus(mouseY) {
            const focusWindow = document.getElementById('reading-focus-window');
            if (focusWindow) {
                // Center the 400px window on the cursor vertically
                const windowTop = mouseY - 200; // 200px above cursor, 200px below
                focusWindow.style.top = windowTop + 'px';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        overlay.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', openMobileMenu);
    closeMenu.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu after navigation
    document.addEventListener('htmx:afterRequest', function() {
        closeMobileMenu();
    });

    // Cart functionality
    const desktopCart = document.getElementById('desktopCart');
    const mobileCart = document.getElementById('mobileCart');
    const mobileCartHeader = document.getElementById('mobileCartHeader');
    
    // Get initial cart count
    updateCartCount();
    
    function updateHeaderCartCount(count) {
        const cartText = `CART (${count})`;
        if (desktopCart) desktopCart.textContent = cartText;
        if (mobileCart) mobileCart.textContent = cartText;
        if (mobileCartHeader) mobileCartHeader.textContent = cartText;
    }
    
    function updateCartCount() {
        fetch('{% url "cart:cart_count" %}')
            .then(response => response.json())
            .then(data => {
                updateHeaderCartCount(data.total_items);
            })
            .catch(() => {
                // Handle error silently
            });
    }

    function openCart() {
        htmx.ajax('GET', '{% url "cart:cart_modal" %}', {
            target: '#cart-container',
            swap: 'innerHTML'
        });
    }

    [desktopCart, mobileCart, mobileCartHeader].forEach(cartLink => {
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                openCart();
            });
        }
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });

    // Update active navigation links after HTMX requests
    document.addEventListener('htmx:afterSettle', function() {
        updateActiveNavLinks();
    });

    function updateActiveNavLinks() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    // Listen for cart updates
    document.addEventListener('cartUpdated', function(e) {
        if (e.detail && e.detail.total_items !== undefined) {
            updateHeaderCartCount(e.detail.total_items);
        }
    });

    // Accessibility enhancements
    // Add focus management for modal
    document.addEventListener('htmx:afterSettle', function(e) {
        // Focus management for modals and dynamic content
        const modal = e.target.querySelector('[role="dialog"]');
        if (modal) {
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    });

    // Announce page changes for screen readers
    document.addEventListener('htmx:afterSettle', function() {
        const announcer = document.getElementById('announcer');
        if (announcer) {
            const pageTitle = document.querySelector('h1, h2');
            if (pageTitle) {
                announcer.textContent = `Page changed to ${pageTitle.textContent}`;
                setTimeout(() => {
                    announcer.textContent = '';
                }, 2000);
            }
        }
    });

    // Handle prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }

    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        // Enter key should activate buttons and links
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
            e.target.click();
        }
        
        // Tab trap for accessibility panel
        if (e.key === 'Tab') {
            const accessibilityPanel = document.querySelector('[aria-modal="true"]');
            if (accessibilityPanel && accessibilityPanel.style.display !== 'none') {
                const focusableElements = accessibilityPanel.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
});

// Global function to update cart count
window.updateHeaderCartCount = function(count) {
    const desktopCart = document.getElementById('desktopCart');
    const mobileCart = document.getElementById('mobileCart');
    const mobileCartHeader = document.getElementById('mobileCartHeader');
    const cartText = `CART (${count})`;
    
    if (desktopCart) desktopCart.textContent = cartText;
    if (mobileCart) mobileCart.textContent = cartText;
    if (mobileCartHeader) mobileCartHeader.textContent = cartText;
};

// Global announcement function for external use
window.announce = function(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
};