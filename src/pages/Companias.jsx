import { useEffect, useState } from "react";
import { api } from "../api/client";

const empty = { nombre: "", capacidad_total: 0, activa: true };

export default function Companias() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");

  const cargar = async () => {
    const { data } = await api.get("/companias");
    setItems(data);
  };
  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const payload = { ...form, capacidad_total: Number(form.capacidad_total) };
      if (editing) await api.put(`/companias/${editing}`, payload);
      else await api.post("/companias", payload);
      setForm(empty); setEditing(null);
      cargar();
    } catch (e) { setErr(e.response?.data?.detail || "Error al guardar"); }
  };

  const editar = (c) => { setEditing(c.id_compania); setForm({ nombre: c.nombre, capacidad_total: c.capacidad_total, activa: c.activa }); };
  const eliminar = async (id) => {
    if (!confirm("¿Desactivar esta compañía?")) return;
    await api.delete(`/companias/${id}`);
    cargar();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Compañías</h1>

      <form onSubmit={guardar} className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-600">Nombre</label>
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Capacidad total</label>
          <input type="number" min="0" value={form.capacidad_total}
            onChange={(e) => setForm({ ...form, capacidad_total: e.target.value })}
            required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="flex items-center gap-2">
          <input id="activa" type="checkbox" checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })} />
          <label htmlFor="activa" className="text-sm text-slate-700">Activa</label>
        </div>
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
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Capacidad</th>
              <th className="text-left px-4 py-2">Activa</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id_compania} className="border-t">
                <td className="px-4 py-2">{c.id_compania}</td>
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.capacidad_total}</td>
                <td className="px-4 py-2">{c.activa ? "Sí" : "No"}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => editar(c)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => eliminar(c.id_compania)} className="text-red-600 hover:underline">Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
