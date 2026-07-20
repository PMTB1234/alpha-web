import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkBase = "block px-4 py-2 rounded-md text-sm font-medium";
const linkInactive = "text-slate-300 hover:bg-slate-700 hover:text-white";
const linkActive = "bg-slate-700 text-white";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Cerrar el menú móvil al navegar
  const close = () => setOpen(false);

  const nav = ({ isActive }) =>
    `${linkBase} ${isActive ? linkActive : linkInactive}`;

  const Sidebar = (
    <aside className="w-60 bg-slate-800 text-white flex flex-col h-full">
      <div className="px-4 py-5 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alpha</h1>
          <p className="text-xs text-slate-400">Control de acceso</p>
        </div>
        <button
          onClick={close}
          className="md:hidden text-slate-300 text-2xl px-2"
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1" onClick={close}>
        <NavLink to="/" end className={nav}>Dashboard</NavLink>
        <NavLink to="/companias" className={nav}>Compañías</NavLink>
        <NavLink to="/usuarios" className={nav}>Usuarios</NavLink>
        <NavLink to="/accesos" className={nav}>Bitácora</NavLink>
        {user?.rol === "admin" && (
          <NavLink to="/reportes" className={nav}>Reportes</NavLink>
        )}
        <div className="border-t border-slate-700 my-2" />
        <NavLink to="/mi-codigo" className={nav}>Mi código</NavLink>
        <NavLink to="/invitar" className={nav}>Invitar visitante</NavLink>
        {(user?.rol === "admin" || user?.rol === "guardia") && (
          <NavLink to="/escaner" className={nav}>Escáner</NavLink>
        )}
      </nav>
      <div className="p-3 border-t border-slate-700 text-sm">
        <p className="text-slate-300 truncate">{user?.nombres}</p>
        <p className="text-slate-500 text-xs mb-2">Rol: {user?.rol}</p>
        <button
          onClick={logout}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  const titleByPath = {
    "/": "Dashboard",
    "/companias": "Compañías",
    "/usuarios": "Usuarios",
    "/accesos": "Bitácora",
    "/reportes": "Reportes",
    "/mi-codigo": "Mi código",
    "/invitar": "Invitar visitante",
    "/escaner": "Escáner",
  };
  const currentTitle = titleByPath[location.pathname] || "Alpha";

  return (
    <div className="flex h-full">
      {/* Sidebar fijo en desktop */}
      <div className="hidden md:block h-full">{Sidebar}</div>

      {/* Sidebar overlay en mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative z-50">{Sidebar}</div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior solo en mobile */}
        <header className="md:hidden bg-slate-800 text-white flex items-center justify-between px-4 py-3 shadow">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <h2 className="font-semibold">{currentTitle}</h2>
          <div className="w-6" />
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
