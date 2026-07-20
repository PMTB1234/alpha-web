import { useEffect, useState } from "react";
import { api } from "../api/client";

const ROLES = [
  { id: 1, nombre: "admin" },
  { id: 2, nombre: "guardia" },
  { id: 3, nombre: "residente" },
  { id: 4, nombre: "visitante" },
];
const empty = {
  id_rol: 3, id_compania: "", nombres: "", apellidos: "",
  documento: "", email: "", telefono: "", password: "",
};

export default function Usuarios() {
  const [items, setItems] = useState([]);
  const [companias, setCompanias] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const cargar = async () => {
    const params = q ? { q } : {};
    const { data } = await api.get("/usuarios", { params });
    setItems(data);
  };
  useEffect(() => { cargar(); }, [q]);
  useEffect(() => { api.get("/companias").then(r => setCompanias(r.data)); }, []);

  const guardar = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const payload = {
        ...form,
        id_compania: form.id_compania ? Number(form.id_compania) : null,
        email: form.email || null,
        telefono: form.telefono || null,
        password: form.password || null,
      };
      if (editing) await api.put(`/usuarios/${editing}`, payload);
      else await api.post("/usuarios", payload);
      setForm(empty); setEditing(null);
      cargar();
    } catch (e) { setErr(e.response?.data?.detail || "Error al guardar"); }
  };

  const editar = (u) => {
    setEditing(u.id_usuario);
    setForm({
      id_rol: u.id_rol, id_compania: u.id_compania || "", nombres: u.nombres,
      apellidos: u.apellidos, documento: u.documento,
      email: u.email || "", telefono: u.telefono || "", password: "",
    });
  };
  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este usuario?")) return;
    await api.delete(`/usuarios/${id}`);
    cargar();
  };

  const reactivar = async (id) => {
    if (!confirm("¿Reactivar este usuario?")) return;
    await api.post(`/usuarios/${id}/activar`);
    cargar();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <input placeholder="Buscar por nombre o documento…"
          value={q} onChange={(e) => setQ(e.target.value)}
          className="px-3 py-2 border rounded w-72" />
      </div>

      <form onSubmit={guardar} className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Nombres" value={form.nombres} required
          onChange={(e) => setForm({ ...form, nombres: e.target.value })}
          className="px-3 py-2 border rounded" />
        <input placeholder="Apellidos" value={form.apellidos} required
          onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
          className="px-3 py-2 border rounded" />
        <input placeholder="Documento" value={form.documento} required disabled={!!editing}
          onChange={(e) => setForm({ ...form, documento: e.target.value })}
          className="px-3 py-2 border rounded disabled:bg-slate-100" />
        <select value={form.id_rol} onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
          className="px-3 py-2 border rounded">
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <select value={form.id_compania} onChange={(e) => setForm({ ...form, id_compania: e.target.value })}
          className="px-3 py-2 border rounded">
          <option value="">— Sin compañía —</option>
          {companias.map(c => <option key={c.id_compania} value={c.id_compania}>{c.nombre}</option>)}
        </select>
        <input placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-3 py-2 border rounded" />
        <input placeholder="Teléfono" value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          className="px-3 py-2 border rounded" />
        <input placeholder={editing ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña"}
          type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-2 border rounded" />
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded">
            {editing ? "Actualizar" : "Crear"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(empty); }}
              className="bg-slate-200 px-4 py-2 rounded">Cancelar</button>
          )}
        </div>
        {err && <p className="text-red-600 text-sm col-span-full">{err}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Nombres</th>
              <th className="text-left px-4 py-2">Documento</th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-left px-4 py-2">Compañía</th>
              <th className="text-left px-4 py-2">Activo</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id_usuario} className="border-t">
                <td className="px-4 py-2">{u.id_usuario}</td>
                <td className="px-4 py-2">{u.nombres} {u.apellidos}</td>
                <td className="px-4 py-2">{u.documento}</td>
                <td className="px-4 py-2">{ROLES.find(r => r.id === u.id_rol)?.nombre}</td>
                <td className="px-4 py-2">{companias.find(c => c.id_compania === u.id_compania)?.nombre || "—"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button onClick={() => editar(u)} className="text-blue-600 hover:underline">Editar</button>
                  {u.activo ? (
                    <button onClick={() => desactivar(u.id_usuario)} className="text-red-600 hover:underline">Desactivar</button>
                  ) : (
                    <button onClick={() => reactivar(u.id_usuario)} className="text-emerald-600 hover:underline font-medium">Reactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
