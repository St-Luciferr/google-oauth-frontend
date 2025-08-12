'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState, useEffect } from 'react';

interface UserInfo {
  access_token: string;
  refresh_token: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    picture: string;
  };
}

const GoogleSignIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user_info');
    
    if (accessToken && refreshToken) {
      setIsLoggedIn(true);
      setUserInfo({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: storedUser ? JSON.parse(storedUser) : undefined
      });
    }
    setLoading(false);
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      try {
        const result = await fetch('http://localhost:8000/api/user/auth/google/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: credentialResponse.credential })
        });
        
        if (result.ok) {
          const data = await result.json();
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user_info', JSON.stringify(data.user));
          
          setUserInfo({
            access_token: data.access,
            refresh_token: data.refresh,
            user: data.user
          });
          setIsLoggedIn(true);
          console.log('Login successful', data.user);
        } else {
          console.error('Login failed:', await result.text());
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Login failed');
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setIsLoggedIn(false);
    setUserInfo(null);
    console.log('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    const displayName = userInfo?.user 
      ? `${userInfo.user.first_name} ${userInfo.user.last_name}`.trim() || userInfo.user.email
      : 'User';

    return (
      <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-green-50 border-green-200 max-w-md">
        <div className="flex items-center gap-2 text-green-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Successfully logged in!</span>
        </div>
        
        {userInfo?.user && (
          <div className="flex flex-col items-center gap-3">
            {/* Profile Picture */}
            {userInfo.user.picture && (
              <img
                src={userInfo.user.picture}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-white shadow-md"
              />
            )}
            
            {/* User Name */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                Welcome, {displayName}!
              </div>
              
              {/* Email if different from display name */}
              {displayName !== userInfo.user.email && (
                <div className="text-sm text-gray-600 mt-1">
                  {userInfo.user.email}
                </div>
              )}
              
              {/* User ID for debugging (you can remove this) */}
              <div className="text-xs text-gray-400 mt-1">
                User ID: {userInfo.user.id}
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to continue</h3>
        <p className="text-sm text-gray-600 mb-4">Please sign in with your Google account</p>
      </div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </div>
  );
};

export default GoogleSignIn;