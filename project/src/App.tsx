import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { checkSupabaseConnection } from './lib/checkConnection';
import { errorHandler, ErrorType, ErrorSeverity } from './lib/errorHandler';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import AuthLayout from './components/auth/AuthLayout';
import TermsPage from './components/legal/TermsPage';
import PrivacyPage from './components/legal/PrivacyPage';
import ContactPage from './components/contact/ContactPage';

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check Supabase connection
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to Supabase');
        }

        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            fullName: session.user.user_metadata.full_name || '',
            subscription: 'free',
            billCredits: 5,
            preferences: {
              currency: {
                code: 'USD',
                symbol: '$',
                name: 'US Dollar'
              },
              language: 'en'
            }
          });
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              fullName: session.user.user_metadata.full_name || '',
              subscription: 'free',
              billCredits: 5,
              preferences: {
                currency: {
                  code: 'USD',
                  symbol: '$',
                  name: 'US Dollar'
                },
                language: 'en'
              }
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        errorHandler.handleError(error as Error, {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR
        });
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [setUser, setLoading]);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>

      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected routes */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;