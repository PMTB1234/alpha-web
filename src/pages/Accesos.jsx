import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Accesos() {
  const [usuarios, setUsuarios] = useState([]);
  const [items, setItems] = useState([]);
  const [filtros, setFiltros] = useState({ desde: "", hasta: "", id_usuario: "", tipo: "" });
  const [nuevo, setNuevo] = useState({ id_usuario: "", tipo: "entrada", observacion: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { api.get("/usuarios").then(r => setUsuarios(r.data)); }, []);

  const cargar = async () => {
    const params = {};
    Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v; });
    const { data } = await api.get("/accesos", { params });
    setItems(data);
  };
  useEffect(() => { cargar(); }, []);

  const registrar = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    try {
      const { data } = await api.post("/accesos", {
        id_usuario: Number(nuevo.id_usuario),
        tipo: nuevo.tipo,
        observacion: nuevo.observacion || null,
      });
      setMsg(`Registrado #${data.id_acceso}. Cap. restante: ${data.capacidad_restante_compania ?? "—"}`);
      setNuevo({ id_usuario: "", tipo: "entrada", observacion: "" });
      cargar();
    } catch (e) { setErr(e.response?.data?.detail || "Error al registrar"); }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bitácora de accesos</h1>

      {/* Registro rápido */}
      <form onSubmit={registrar} className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-600">Usuario</label>
          <select value={nuevo.id_usuario} required
            onChange={(e) => setNuevo({ ...nuevo, id_usuario: e.target.value })}
            className="w-full px-3 py-2 border rounded">
            <option value="">— elegir —</option>
            {usuarios.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.documento} — {u.nombres} {u.apellidos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Tipo</label>
          <select value={nuevo.tipo}
            onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
            className="w-full px-3 py-2 border rounded">
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Observación</label>
          <input value={nuevo.observacion}
            onChange={(e) => setNuevo({ ...nuevo, observacion: e.target.value })}
            className="w-full px-3 py-2 border rounded" />
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">
          Registrar
        </button>
        {msg && <p className="text-emerald-700 text-sm col-span-full">{msg}</p>}
        {err && <p className="text-red-600 text-sm col-span-full">{err}</p>}
      </form>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-600">Desde</label>
          <input type="date" value={filtros.desde}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
            className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Hasta</label>
          <input type="date" value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
            className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Tipo</label>
          <select value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="w-full px-3 py-2 border rounded">
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Usuario ID</label>
          <input type="number" value={filtros.id_usuario}
            onChange={(e) => setFiltros({ ...filtros, id_usuario: e.target.value })}
            className="w-full px-3 py-2 border rounded" />
        </div>
        <button onClick={cargar} className="bg-slate-800 text-white px-4 py-2 rounded">Aplicar</button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Usuario</th>
              <th className="text-left px-4 py-2">Cont. ent.</th>
              <th className="text-left px-4 py-2">Cont. sal.</th>
              <th className="text-left px-4 py-2">Cap. restante</th>
              <th className="text-left px-4 py-2">Observación</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const u = usuarios.find(x => x.id_usuario === a.id_usuario);
              return (
                <tr key={a.id_acceso} className="border-t">
                  <td className="px-4 py-2">{a.id_acceso}</td>
                  <td className="px-4 py-2">{new Date(a.fecha_hora).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${a.tipo === "entrada" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                      {a.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2">{u ? `${u.nombres} ${u.apellidos}` : `#${a.id_usuario}`}</td>
                  <td className="px-4 py-2">{a.conteo_entradas_dia}</td>
                  <td className="px-4 py-2">{a.conteo_salidas_dia}</td>
                  <td className="px-4 py-2">{a.capacidad_restante_compania ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{a.observacion || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
