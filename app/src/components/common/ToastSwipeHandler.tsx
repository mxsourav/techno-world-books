import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * ToastSwipeHandler
 * 
 * Provides smooth, high-fidelity gesture tracking on mobile/touch screens for Sonner notification toasts.
 * Allows users to swipe UP, LEFT, or RIGHT to dismiss the toast notification with real-time finger tracking
 * and directional fly-out exit animations.
 */
export function ToastSwipeHandler() {
  useEffect(() => {
    let activeToast: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isSwiping = false;
    let initialTransform = '';

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't intercept clicks on buttons or links inside the toast
      if (target.closest('button, a, input, select, textarea')) return;

      const toastEl = target.closest('[data-sonner-toast]') as HTMLElement | null;
      if (!toastEl) return;

      activeToast = toastEl;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isSwiping = false;
      initialTransform = toastEl.style.transform || '';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeToast || e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // Start swiping once movement passes threshold
      if (!isSwiping) {
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
          isSwiping = true;
          activeToast.style.transition = 'none';
        }
      }

      if (isSwiping) {
        // Prevent window scroll while actively dragging the notification
        if (e.cancelable) {
          e.preventDefault();
        }

        // Determine dominant swipe direction
        const isUpward = deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX) * 0.65;

        if (isUpward) {
          // SWIPING UP
          const progress = Math.min(1, Math.abs(deltaY) / 120);
          activeToast.style.transform = `translate3d(0, ${deltaY}px, 0) scale(${1 - progress * 0.05})`;
          activeToast.style.opacity = `${Math.max(0, 1 - progress * 0.85)}`;
        } else {
          // SWIPING HORIZONTALLY (LEFT OR RIGHT)
          const progress = Math.min(1, Math.abs(deltaX) / 180);
          const rotation = (deltaX * 0.045).toFixed(2);
          // Allow subtle vertical drift with finger
          const verticalDrift = deltaY * 0.2;
          activeToast.style.transform = `translate3d(${deltaX}px, ${verticalDrift}px, 0) rotate(${rotation}deg)`;
          activeToast.style.opacity = `${Math.max(0, 1 - progress * 0.85)}`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!activeToast) return;

      const toastEl = activeToast;
      activeToast = null;

      if (!isSwiping) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch ? touch.clientX - startX : 0;
      const deltaY = touch ? touch.clientY - startY : 0;
      const duration = Math.max(1, Date.now() - startTime);
      const velocityX = Math.abs(deltaX) / duration;
      const velocityY = Math.abs(deltaY) / duration;

      const isUp = (deltaY < -35 && Math.abs(deltaY) > Math.abs(deltaX) * 0.65) || (deltaY < -20 && velocityY > 0.35);
      const isLeft = deltaX < -40 || (deltaX < -20 && velocityX > 0.35);
      const isRight = deltaX > 40 || (deltaX > 20 && velocityX > 0.35);

      const dismissElement = () => {
        // Trigger close button if available
        const closeBtn = toastEl.querySelector('[data-close-button]') as HTMLElement | null;
        if (closeBtn) {
          closeBtn.click();
        } else {
          toast.dismiss();
        }
        // Immediately fade & collapse to avoid any visual snapback
        setTimeout(() => {
          if (toastEl.parentElement) {
            toastEl.style.display = 'none';
          }
        }, 220);
      };

      if (isUp) {
        // Fly OUT UP
        toastEl.style.transition = 'transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out';
        toastEl.style.transform = 'translate3d(0, -180px, 0) scale(0.92)';
        toastEl.style.opacity = '0';
        dismissElement();
      } else if (isLeft) {
        // Fly OUT LEFT
        toastEl.style.transition = 'transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out';
        toastEl.style.transform = `translate3d(-150%, ${deltaY * 0.2}px, 0) rotate(-14deg)`;
        toastEl.style.opacity = '0';
        dismissElement();
      } else if (isRight) {
        // Fly OUT RIGHT
        toastEl.style.transition = 'transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out';
        toastEl.style.transform = `translate3d(150%, ${deltaY * 0.2}px, 0) rotate(14deg)`;
        toastEl.style.opacity = '0';
        dismissElement();
      } else {
        // Snap back to original position
        toastEl.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
        toastEl.style.transform = initialTransform || 'translate3d(0, 0, 0) rotate(0deg)';
        toastEl.style.opacity = '1';
        setTimeout(() => {
          toastEl.style.transition = '';
        }, 200);
      }

      isSwiping = false;
    };

    const handleTouchCancel = () => {
      if (activeToast) {
        activeToast.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
        activeToast.style.transform = initialTransform || 'translate3d(0, 0, 0) rotate(0deg)';
        activeToast.style.opacity = '1';
        setTimeout(() => {
          if (activeToast) activeToast.style.transition = '';
          activeToast = null;
        }, 200);
      }
      isSwiping = false;
    };

    // Attach passive: false to allow e.preventDefault() during touchmove
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, []);

  return null;
}
