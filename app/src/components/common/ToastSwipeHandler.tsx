import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * ToastSwipeHandler
 * 
 * Provides smooth, high-fidelity linear sliding gestures for Sonner notifications.
 * Strictly eliminates all card-style effects:
 * - No card tilt / rotation (strictly 0deg)
 * - No card deck scaling
 * - Supports pure linear sliding: straight up, left slide, or right slide
 * - Works seamlessly with both touch and mouse/pointer drag
 */
export function ToastSwipeHandler() {
  useEffect(() => {
    let activeToast: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isSwiping = false;
    let pointerId: number | null = null;

    const onStart = (clientX: number, clientY: number, target: HTMLElement | null, id?: number) => {
      if (!target) return;
      // Don't intercept clicks on interactive elements
      if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

      const toastEl = target.closest('[data-sonner-toast]') as HTMLElement | null;
      if (!toastEl) return;

      activeToast = toastEl;
      startX = clientX;
      startY = clientY;
      startTime = Date.now();
      isSwiping = false;
      if (id !== undefined) pointerId = id;
    };

    const onMove = (clientX: number, clientY: number, e?: Event) => {
      if (!activeToast) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (!isSwiping) {
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
          isSwiping = true;
          activeToast.style.transition = 'none';
        }
      }

      if (isSwiping) {
        if (e && e.cancelable) {
          e.preventDefault();
        }

        // Determine dominant slide direction
        const isUpward = deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX) * 0.7;

        if (isUpward) {
          // Slide straight UP: purely linear translateY, zero rotation, zero scale
          const progress = Math.min(1, Math.abs(deltaY) / 100);
          activeToast.style.transform = `translate3d(0, ${deltaY}px, 0)`;
          activeToast.style.opacity = `${Math.max(0, 1 - progress * 0.75)}`;
        } else {
          // Slide HORIZONTALLY: purely linear translateX, zero tilt/rotation, zero Y drift
          const progress = Math.min(1, Math.abs(deltaX) / 160);
          activeToast.style.transform = `translate3d(${deltaX}px, 0, 0)`;
          activeToast.style.opacity = `${Math.max(0, 1 - progress * 0.75)}`;
        }
      }
    };

    const onEnd = (clientX: number, clientY: number) => {
      if (!activeToast) return;

      const toastEl = activeToast;
      activeToast = null;
      pointerId = null;

      if (!isSwiping) {
        return;
      }

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      const duration = Math.max(1, Date.now() - startTime);
      const velocityX = Math.abs(deltaX) / duration;
      const velocityY = Math.abs(deltaY) / duration;

      const isUp = (deltaY < -30 && Math.abs(deltaY) > Math.abs(deltaX) * 0.7) || (deltaY < -15 && velocityY > 0.3);
      const isLeft = deltaX < -35 || (deltaX < -15 && velocityX > 0.3);
      const isRight = deltaX > 35 || (deltaX > 15 && velocityX > 0.3);

      const dismissElement = () => {
        toast.dismiss();
        setTimeout(() => {
          if (toastEl && toastEl.parentElement) {
            toastEl.style.display = 'none';
          }
        }, 220);
      };

      if (isUp) {
        // Slide out straight UP (pure linear translation, no rotation, no scale)
        toastEl.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out';
        toastEl.style.transform = 'translate3d(0, -140px, 0)';
        toastEl.style.opacity = '0';
        dismissElement();
      } else if (isLeft) {
        // Slide out LEFT (pure linear horizontal translation)
        toastEl.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out';
        toastEl.style.transform = 'translate3d(-100vw, 0, 0)';
        toastEl.style.opacity = '0';
        dismissElement();
      } else if (isRight) {
        // Slide out RIGHT (pure linear horizontal translation)
        toastEl.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out';
        toastEl.style.transform = 'translate3d(100vw, 0, 0)';
        toastEl.style.opacity = '0';
        dismissElement();
      } else {
        // Snap back cleanly with no rotation
        toastEl.style.transition = 'transform 180ms ease-out, opacity 180ms ease-out';
        toastEl.style.transform = 'translate3d(0, 0, 0)';
        toastEl.style.opacity = '1';
        setTimeout(() => {
          if (toastEl) toastEl.style.transition = '';
        }, 180);
      }

      isSwiping = false;
    };

    const onCancel = () => {
      if (activeToast) {
        activeToast.style.transition = 'transform 180ms ease-out, opacity 180ms ease-out';
        activeToast.style.transform = 'translate3d(0, 0, 0)';
        activeToast.style.opacity = '1';
        setTimeout(() => {
          if (activeToast) activeToast.style.transition = '';
          activeToast = null;
        }, 180);
      }
      isSwiping = false;
      pointerId = null;
    };

    // Touch Event Handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeToast || e.touches.length !== 1) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY, e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!activeToast) return;
      const touch = e.changedTouches[0];
      onEnd(touch ? touch.clientX : startX, touch ? touch.clientY : startY);
    };

    // Pointer Event Handlers (Mouse drag & stylus)
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by touch events
      if (e.button !== 0) return; // Only primary mouse button
      onStart(e.clientX, e.clientY, e.target as HTMLElement, e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!activeToast || pointerId !== e.pointerId) return;
      onMove(e.clientX, e.clientY, e);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!activeToast || pointerId !== e.pointerId) return;
      onEnd(e.clientX, e.clientY);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', onCancel);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', onCancel);

      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', onCancel);
    };
  }, []);

  return null;
}
