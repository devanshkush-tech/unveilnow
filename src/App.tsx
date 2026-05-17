import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Index from "./pages/Index.tsx";
import LP from "./pages/LP.tsx";
import NotFound from "./pages/NotFound.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import Trust from "./pages/Trust.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Contact from "./pages/Contact.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import Payment from "./pages/Payment.tsx";
import PaymentReview from "./pages/PaymentReview.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import DashboardLayout from "./pages/dashboard/DashboardLayout.tsx";
import Discover from "./pages/dashboard/Discover.tsx";
import Matches from "./pages/dashboard/Matches.tsx";
import Chats from "./pages/dashboard/Chats.tsx";
import Profile from "./pages/dashboard/Profile.tsx";
import Settings from "./pages/dashboard/Settings.tsx";
import { PaymentTestModeBanner } from "./components/PaymentTestModeBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MetaPageViewTracker } from "./components/MetaPageViewTracker";
import { captureUtmFromUrl } from "./lib/utm";
import BlindDateLanding from "./features/blind-date/pages/Landing";
import BlindDateSetup from "./features/blind-date/pages/Setup";
import BlindDateMatching from "./features/blind-date/pages/Matching";
import BlindDateChat from "./features/blind-date/pages/Chat";
import BlindDateDecision from "./features/blind-date/pages/Decision";
import BlindDateMatched from "./features/blind-date/pages/Matched";
import BlindDateFullChat from "./features/blind-date/pages/FullChat";
import BlindDatePremium from "./features/blind-date/pages/Premium";
import BlindDatePayment from "./features/blind-date/pages/PaymentPage";
import BlindDatePaymentReview from "./features/blind-date/pages/PaymentReview";
import BlindDateExtendedSetup from "./features/blind-date/pages/ExtendedSetup";
import { BlindDateGate } from "./features/blind-date/components/BlindDateGate";
import Notifications from "./pages/Notifications";
import UnlockInterest from "./pages/UnlockInterest";

const queryClient = new QueryClient();

// Capture UTMs from URL on first landing — persisted in localStorage.
if (typeof window !== "undefined") captureUtmFromUrl();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <PaymentTestModeBanner />
            <MetaPageViewTracker />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lp" element={<LP />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <RequireAuth requireOnboarded={false} requireActive={false}>
                  <Onboarding />
                </RequireAuth>
              }
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route
              path="/payment"
              element={
                <RequireAuth requireOnboarded={true} requireActive={false}>
                  <Payment />
                </RequireAuth>
              }
            />
            <Route
              path="/payment/review"
              element={
                <RequireAuth requireOnboarded={true} requireActive={false}>
                  <PaymentReview />
                </RequireAuth>
              }
            />
            <Route path="/admin" element={<Navigate to="/admindashboard" replace />} />
            <Route path="/admindashboard/login" element={<AdminLogin />} />
            <Route path="/admindashboard" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Discover />} />
              <Route path="matches" element={<Matches />} />
              <Route path="chats" element={<Chats />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/blind-date" element={<BlindDateLanding />} />
            <Route path="/blind-date/setup" element={<BlindDateGate require="setup"><BlindDateSetup /></BlindDateGate>} />
            <Route path="/blind-date/payment" element={<BlindDateGate require="payment"><BlindDatePayment /></BlindDateGate>} />
            <Route path="/blind-date/payment/review" element={<BlindDateGate require="any"><BlindDatePaymentReview /></BlindDateGate>} />
            <Route path="/blind-date/onboarding" element={<BlindDateGate require="payment"><BlindDateExtendedSetup /></BlindDateGate>} />
            <Route path="/blind-date/matching" element={<BlindDateGate><BlindDateMatching /></BlindDateGate>} />
            <Route path="/blind-date/chat" element={<BlindDateGate><BlindDateChat /></BlindDateGate>} />
            <Route path="/blind-date/decision" element={<BlindDateGate><BlindDateDecision /></BlindDateGate>} />
            <Route path="/blind-date/matched" element={<BlindDateGate><BlindDateMatched /></BlindDateGate>} />
            <Route path="/blind-date/chat/full" element={<BlindDateGate><BlindDateFullChat /></BlindDateGate>} />
            <Route path="/blind-date/premium" element={<BlindDateGate require="any"><BlindDatePremium /></BlindDateGate>} />
            <Route path="/notifications" element={<RequireAuth requireOnboarded={false} requireActive={false}><Notifications /></RequireAuth>} />
            <Route path="/unlock-interest/:fromUserId" element={<RequireAuth requireOnboarded={false} requireActive={false}><UnlockInterest /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
