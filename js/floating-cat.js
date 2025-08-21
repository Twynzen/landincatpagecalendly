// ============================================
// FLOATING CAT - Mascota Flotante con Ronroneo
// ============================================

class FloatingCat {
    constructor() {
        this.catElement = document.getElementById('floatingCat');
        this.catSvg = document.getElementById('aiCat');
        this.purringSound = document.getElementById('purringSound');
        this.isBlinking = false;
        this.isPurring = false;
        this.lastClickTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startEyeTracking();
        
        console.log('🐱 Floating Cat initialized');
    }
    
    setupEventListeners() {
        // Mouse down - start purring and close eyes
        this.catElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startPurring();
        });
        
        // Mouse up - stop purring and open eyes
        this.catElement.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.stopPurring();
        });
        
        // Mouse leave - also stop if mouse leaves the cat
        this.catElement.addEventListener('mouseleave', (e) => {
            if (this.isPurring) {
                this.stopPurring();
            }
        });
        
        // Touch events for mobile
        this.catElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPurring();
        });
        
        this.catElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopPurring();
        });
        
        this.catElement.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopPurring();
        });
        
        // Prevent context menu on right click
        this.catElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Audio event listeners
        if (this.purringSound) {
            this.purringSound.addEventListener('error', (e) => {
                console.warn('🔇 Audio file not found:', e.target.src);
            });
            
            this.purringSound.addEventListener('loadeddata', () => {
                console.log('✅ Purring sound loaded successfully');
            });
            
            // Loop the audio
            this.purringSound.loop = true;
        }
    }
    
    startPurring() {
        if (this.isPurring) return;
        
        this.isPurring = true;
        
        // Close eyes immediately
        this.closeEyes();
        
        // Add purring animation
        this.catSvg.classList.add('purring');
        
        // Start playing sound
        if (this.purringSound) {
            try {
                this.purringSound.currentTime = 0;
                this.purringSound.volume = 0.4; // Slightly lower volume
                this.purringSound.play().then(() => {
                    console.log('🎵 Purring started');
                }).catch(error => {
                    console.warn('🔇 Could not play purring sound:', error);
                });
            } catch (error) {
                console.warn('🔇 Error playing sound:', error);
            }
        }
        
        // Track interaction
        this.trackInteraction('cat_purr_start');
    }
    
    stopPurring() {
        if (!this.isPurring) return;
        
        this.isPurring = false;
        
        // Open eyes immediately
        this.openEyes();
        
        // Remove purring animation
        this.catSvg.classList.remove('purring');
        
        // Stop playing sound
        if (this.purringSound) {
            try {
                this.purringSound.pause();
                this.purringSound.currentTime = 0;
                console.log('🔇 Purring stopped');
            } catch (error) {
                console.warn('Error stopping sound:', error);
            }
        }
        
        // Track interaction
        this.trackInteraction('cat_purr_stop');
    }
    
    closeEyes() {
        const eyelid = this.catSvg.querySelector('.eyelid');
        if (!eyelid) {
            console.warn('No eyelid element found');
            return;
        }
        
        this.isBlinking = true;
        
        // Reset pupils to center position before closing
        const leftPupil = this.catSvg.querySelector('.pupil-left');
        const rightPupil = this.catSvg.querySelector('.pupil-right');
        if (leftPupil && rightPupil) {
            leftPupil.setAttribute('cx', '160');
            leftPupil.setAttribute('cy', '200');
            rightPupil.setAttribute('cx', '240');
            rightPupil.setAttribute('cy', '200');
        }
        
        // Close the eyelid
        eyelid.style.transition = 'transform 0.15s ease';
        eyelid.style.transform = 'scaleY(1)';
        console.log('👁️ Eyes closed');
    }
    
    openEyes() {
        const eyelid = this.catSvg.querySelector('.eyelid');
        if (!eyelid) {
            console.warn('No eyelid element found');
            return;
        }
        
        // Open the eyelid
        eyelid.style.transition = 'transform 0.15s ease';
        eyelid.style.transform = 'scaleY(0)';
        
        setTimeout(() => {
            this.isBlinking = false;
            console.log('👁️ Eyes opened');
        }, 150);
    }
    
    startEyeTracking() {
        // Track mouse movement for eye following
        document.addEventListener('mousemove', (e) => {
            // Don't move eyes if they are closed (blinking or purring)
            if (this.isBlinking || this.isPurring) return;
            
            requestAnimationFrame(() => {
                this.updateEyePosition(e.clientX, e.clientY);
            });
        });
        
        // Also track touch for mobile
        document.addEventListener('touchmove', (e) => {
            // Don't move eyes if they are closed
            if (this.isBlinking || this.isPurring || !e.touches[0]) return;
            
            requestAnimationFrame(() => {
                this.updateEyePosition(e.touches[0].clientX, e.touches[0].clientY);
            });
        });
    }
    
    updateEyePosition(mouseX, mouseY) {
        const catRect = this.catElement.getBoundingClientRect();
        const catCenterX = catRect.left + catRect.width / 2;
        const catCenterY = catRect.top + catRect.height / 2;
        
        // Calculate direction from cat to mouse
        const deltaX = mouseX - catCenterX;
        const deltaY = mouseY - catCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Prevent division by zero
        if (distance === 0) return;
        
        // Limit eye movement (increased for better tracking)
        const maxMovement = 8;
        const eyeMovementX = Math.max(-maxMovement, Math.min(maxMovement, (deltaX / distance) * maxMovement));
        const eyeMovementY = Math.max(-maxMovement, Math.min(maxMovement, (deltaY / distance) * maxMovement));
        
        // Update pupil positions
        const leftPupil = this.catSvg.querySelector('.pupil-left');
        const rightPupil = this.catSvg.querySelector('.pupil-right');
        
        if (leftPupil && rightPupil) {
            // Smooth transition
            leftPupil.style.transition = 'all 0.1s ease';
            rightPupil.style.transition = 'all 0.1s ease';
            
            leftPupil.setAttribute('cx', 160 + eyeMovementX);
            leftPupil.setAttribute('cy', 200 + eyeMovementY);
            rightPupil.setAttribute('cx', 240 + eyeMovementX);
            rightPupil.setAttribute('cy', 200 + eyeMovementY);
        }
    }
    
    // Animation states for external interaction
    setState(state) {
        switch (state) {
            case 'purring':
                this.startPurring();
                break;
            case 'idle':
                this.stopPurring();
                break;
        }
    }
    
    // Track interactions for analytics
    trackInteraction(action) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'floating_cat',
                event_label: 'user_interaction'
            });
        }
        
        console.log(`🐱 Cat interaction: ${action}`);
    }
    
    // Utility methods
    show() {
        this.catElement.style.display = 'block';
    }
    
    hide() {
        this.catElement.style.display = 'none';
    }
    
    setPosition(bottom = 30, right = 30) {
        this.catElement.style.bottom = `${bottom}px`;
        this.catElement.style.right = `${right}px`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.floatingCat = new FloatingCat();
});

// Export for global use
window.FloatingCat = FloatingCat;