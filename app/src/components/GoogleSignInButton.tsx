import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/store/StoreContext';
import { useAuthStore } from '@/store/AuthStore';
import { authService } from '@/services/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  width?: string | number;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  text = 'continue_with',
  theme = 'outline',
  width = 300,
  className = '',
}) => {
  const { login } = useStore();
  const { login: authLogin } = useAuthStore();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  const clientId = (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '285337463761-2ag5qau6mv0ilqac6n8upplrdus4o6l4.apps.googleusercontent.com'
  ).trim();

  useEffect(() => {
    if (!clientId) return;

    let intervalId: any = null;

    const initGis = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: theme,
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: typeof width === 'number' ? width : 300,
          });

          setGisReady(true);
          if (intervalId) clearInterval(intervalId);
        } catch (e) {
          console.error('[GIS_INIT_ERROR]', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGis();
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [clientId, theme, text, width]);

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response.credential) {
      toast.error('Google credential was not returned');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.googleAuth({ credential: response.credential });
      if (res.success && res.data) {
        authLogin(res.data.accessToken, res.data.user);
        login({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || '',
          rewardPoints: res.data.user.technoPoints || 120,
        });
        toast.success(`Welcome, ${res.data.user.name}! Signed in successfully.`);
        onSuccess?.();
      } else {
        toast.error(res.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      console.error('[GOOGLE_SIGNIN_ERROR]', err);
      toast.error(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackClick = () => {
    if (!clientId) {
      toast.info('Google Client ID is not yet configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In script is loading. Please check your connection.');
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Container where official GIS renders */}
      <div 
        ref={buttonRef} 
        className={`w-full flex justify-center ${gisReady ? 'block' : 'hidden'}`} 
      />

      {/* Fallback & Loading UI when GIS hasn't initialized yet */}
      {!gisReady && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Authenticating with Google...' : 'Continue with Google'}
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
