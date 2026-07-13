import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Dashboard() {
  const [capacidad, setCapacidad] = useState([]);
  const [dentro, setDentro] = useState([]);
  const [pordia, setPorDia] = useState([]);

  const cargar = async () => {
    const [c, d, p] = await Promise.all([
      api.get("/dashboard/capacidad"),
      api.get("/dashboard/dentro"),
      api.get("/dashboard/accesos-por-dia"),
    ]);
    setCapacidad(c.data); setDentro(d.data); setPorDia(p.data);
  };

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 5000); // refresca cada 5 seg
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Capacidad por compañía</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capacidad.map((c) => {
            const pct = c.capacidad_total > 0
              ? Math.min(100, Math.round((c.ocupados / c.capacidad_total) * 100))
              : 0;
            const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-emerald-500";
            return (
              <div key={c.id_compania} className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-500">{c.nombre}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {c.disponibles}<span className="text-base text-slate-400">/{c.capacidad_total}</span>
                </p>
                <p className="text-xs text-slate-500 mb-2">disponibles</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.ocupados} ocupados</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Usuarios dentro ahora</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2">Usuario</th>
                <th className="text-left px-4 py-2">Compañía</th>
                <th className="text-left px-4 py-2">Hora entrada</th>
              </tr>
            </thead>
            <tbody>
              {dentro.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-4 text-slate-400">Nadie dentro</td></tr>
              ) : dentro.map((u) => (
                <tr key={u.id_usuario} className="border-t">
                  <td className="px-4 py-2">{u.usuario}</td>
                  <td className="px-4 py-2">{u.compania || "—"}</td>
                  <td className="px-4 py-2">{new Date(u.hora_entrada).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Accesos por día</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2">Día</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {pordia.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{r.dia}</td>
                  <td className="px-4 py-2 capitalize">{r.tipo}</td>
                  <td className="px-4 py-2 font-semibold">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
