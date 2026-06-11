import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import { MainLayout } from "./components/Layout/MainLayout";
import { LoadingSpinner } from "./components/Common/LoadingSpinner";
import { AuthGuard } from "./pages/Auth/AuthGuard";

// Auth Pages 
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { CreateFirm } from "./pages/Auth/CreateFirm";
import ResetPassword from "./pages/Auth/ResetPassword";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { SelectFirm } from "./pages/Auth/SelectFirm";
import { VerifyEmail } from "./pages/Auth/VerifyEmail";
import { ResendVerification } from "./pages/Auth/ResendVerification";

// Other imports remain the same...
import { Dashboard } from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Settings/Profile";
import Team from "./pages/Settings/Team";
import FirmSettings from "./pages/Settings/FirmSettings";
import BillingSettings from "./pages/Settings/BillingSettings";
import { ContactsList } from "./pages/Contacts/ContactsList";
import { ContactDetail } from "./pages/Contacts/ContactDetail";
import { CreateContact } from "./pages/Contacts/CreateContact";
import { CalendarView } from "./pages/Calendar/CalendarView";
import { EditMatter } from "./pages/Matters/EditMatter";
import { EventCreate } from "./pages/Calendar/EventCreate";
import { EventView } from "./pages/Calendar/EventView";
import { EventEdit } from "./pages/Calendar/EventEdit";
import { MattersList } from "./pages/Matters/MattersList";
import { MatterDetail } from "./pages/Matters/MatterDetail";
import { CreateMatter } from "./pages/Matters/CreateMatter";
import { TaskDetail } from "./pages/Tasks/TaskDetail";
import { CreateTask } from "./pages/Tasks/CreateTask";
import { EditTask } from "./pages/Tasks/EditTask";
import { TasksList } from "./pages/Tasks/TasksList";
import { CommunicationsList } from "./pages/Communications/CommunicationsList";
import { ThreadDetail } from "./pages/Communications/ThreadDetail";
import { EmailTemplates } from "./pages/Communications/EmailTemplates";
import { DocumentDetail } from "./pages/Documents/DocumentDetail";
import { DocumentsList } from "./pages/Documents/DocumentsList";
import { BillDetail } from "./pages/Billing/BillDetail";
import { CreateBill } from "./pages/Billing/CreateBill";
import { BillsList } from "./pages/Billing/BillsList";
import { EditContact } from "./pages/Contacts/EditContact";
import { AcceptInvite } from "./pages/Auth/AcceptInvite";

function App() {
  const { initializeAuth, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };
    init();
  }, [initializeAuth]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes - No auth required */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-firm" element={<CreateFirm />} />
        <Route path="/select-firm" element={<SelectFirm />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />


        {/* Protected Routes */}
        <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matters" element={<MattersList />} />
          <Route path="/matters/:id" element={<MatterDetail />} />
          <Route path="/matters/create" element={<CreateMatter />} />
          <Route path="/matters/:id/edit" element={<EditMatter />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/contacts/create" element={<CreateContact />} />
          <Route path="/contacts/:id/edit" element={<EditContact />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/events/create" element={<EventCreate />} />
          <Route path="/calendar/events/:id" element={<EventView />} />
          <Route path="/calendar/events/:id/edit" element={<EventEdit />} />
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/communications" element={<CommunicationsList />} />
          <Route path="/communications/threads/:id" element={<ThreadDetail />} />
          <Route path="/communications/templates" element={<EmailTemplates />} />
          <Route path="/billing" element={<BillsList />} />
          <Route path="/billing/bills/:id" element={<BillDetail />} />
          <Route path="/billing/create" element={<CreateBill />} />
          <Route path="/billing/bills/:id/edit" element={<CreateBill />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/team" element={<Team />} />
          <Route path="/settings/firm" element={<FirmSettings />} />
          <Route path="/settings/billing" element={<BillingSettings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;