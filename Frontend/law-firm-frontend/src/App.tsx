// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import { MainLayout } from "./components/Layout/MainLayout";

// Auth Pages
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { CreateFirm } from "./pages/Auth/CreateFirm";
import ResetPassword from "./pages/Auth/ResetPassword";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import TasksList from "./pages/Tasks/TasksList";
import DocumentsList from "./pages/Documents/DocumentsList";
import CommunicationsList from "./pages/Communications/CommunicationsList";
import BillsList from "./pages/Billing/BillsList";
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

// Main Pages

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, requiresFirmCreation, requiresFirmSelection } =
    useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiresFirmCreation) {
    return <Navigate to="/create-firm" replace />;
  }

  if (requiresFirmSelection) {
    return <Navigate to="/select-firm" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-firm" element={<CreateFirm />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matters" element={<MattersList />} />
          <Route path="/matters/:id" element={<MatterDetail />} />
          <Route path="/matters/create" element={<CreateMatter />} />
          <Route path="/matters/:id/edit" element={<EditMatter />} />

          <Route path="/matters/create" element={<CreateMatter />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/contacts/create" element={<CreateContact />} />
          <Route path="/contacts/:id/edit" element={<CreateContact />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/events/create" element={<EventCreate />} />
          <Route path="/calendar/events/:id" element={<EventView />} />
          <Route path="/calendar/events/:id/edit" element={<EventEdit />} />

          <Route path="/tasks" element={<TasksList />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/communications" element={<CommunicationsList />} />
          <Route path="/billing" element={<BillsList />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/team" element={<Team />} />
          <Route path="/settings/firm" element={<FirmSettings />} />
          <Route path="/settings/billing" element={<BillingSettings />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
