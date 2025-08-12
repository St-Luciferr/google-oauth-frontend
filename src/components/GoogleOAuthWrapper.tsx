'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

export default function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      {children}
    </GoogleOAuthProvider>
  );
}
