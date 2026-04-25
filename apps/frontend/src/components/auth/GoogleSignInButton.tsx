import { useEffect, useRef } from 'react';

let gsiScriptPromise: Promise<void> | null = null;
let gsiInitialized = false;
let activeCredentialHandler: ((credential: string) => Promise<void>) | null = null;

function ensureGsiScriptLoaded(): Promise<void> {
  if (window.google) {
    return Promise.resolve();
  }

  if (gsiScriptPromise) {
    return gsiScriptPromise;
  }

  gsiScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });

  return gsiScriptPromise;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: 'pill' | 'rectangular';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

interface Props {
  onCredential: (credential: string) => Promise<void>;
  buttonText?: 'continue_with' | 'signin_with' | 'signup_with' | 'signin';
}

export function GoogleSignInButton({ onCredential, buttonText = 'continue_with' }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);

  useEffect(() => {
    callbackRef.current = onCredential;
    activeCredentialHandler = async (credential: string) => {
      await callbackRef.current(credential);
    };
  }, [onCredential]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    let isCancelled = false;

    const renderGoogleButton = async () => {
      try {
        await ensureGsiScriptLoaded();
      } catch {
        return;
      }

      if (isCancelled) {
        return;
      }

      if (!window.google || !buttonRef.current) return;

      if (!gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential || !activeCredentialHandler) return;
            await activeCredentialHandler(response.credential);
          },
        });
        gsiInitialized = true;
      }

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: buttonText,
        width: 400,
      });
    };

    renderGoogleButton();

    return () => {
      isCancelled = true;
    };
  }, [buttonText]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
