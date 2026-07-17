import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companias from "./pages/Companias";
import Usuarios from "./pages/Usuarios";
import Accesos from "./pages/Accesos";
import MiCodigo from "./pages/MiCodigo";
import Escaner from "./pages/Escaner";
import Reportes from "./pages/Reportes";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="companias" element={<Companias />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="accesos" element={<Accesos />} />
        <Route path="mi-codigo" element={<MiCodigo />} />
        <Route path="escaner" element={<Escaner />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
