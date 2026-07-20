import { useState } from "react";
import Barcode from "react-barcode";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Invitar() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombres: "", apellidos: "", documento: "", telefono: "", valido_horas: 12,
  });
  const [visitante, setVisitante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copiado, setCopiado] = useState(false);

  const esResidente = user?.rol === "residente";

  const crear = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/visitantes", {
        nombres: form.nombres,
        apellidos: form.apellidos,
        documento: form.documento || null,
        telefono: form.telefono || null,
        valido_horas: Number(form.valido_horas),
      });
      setVisitante(data);
    } catch (e) {
      setErr(e.response?.data?.detail || "No se pudo crear la invitación");
    } finally { setLoading(false); }
  };

  const compartirWhatsapp = () => {
    if (!visitante) return;
    const url = `${window.location.origin}/v/${visitante.codigo}`;
    const msg = `Hola ${visitante.nombres}, tu código de acceso al parqueo es:\n\n${visitante.codigo}\n\nVálido hasta: ${new Date(visitante.codigo_expira).toLocaleString()}\n\nPresenta este código en garita.`;
    const wa = `https://wa.me/${(visitante.telefono || "").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
  };

  const copiar = async () => {
    if (!visitante) return;
    try {
      await navigator.clipboard.writeText(visitante.codigo);
      setCopiado(true); setTimeout(() => setCopiado(false), 2000);
    } catch {}
  };

  const nuevo = () => { setVisitante(null); setForm({ nombres: "", apellidos: "", documento: "", telefono: "", valido_horas: 12 }); };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {esResidente ? "Invitar visitante" : "Registrar visitante"}
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        {esResidente
          ? "El visitante recibirá un código único válido por el tiempo que elijas. Consume tu capacidad de compañía."
          : "Registra un visitante nuevo en garita. Recibe un código para entrar."}
      </p>

      {!visitante ? (
        <form onSubmit={crear} className="bg-white p-6 rounded-lg shadow space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Nombres *</label>
              <input required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Apellidos *</label>
              <input required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Documento (opcional)</label>
            <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })}
              placeholder="Se genera automático si se deja vacío"
              className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Teléfono (para compartir por WhatsApp)</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+502..." className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Válido durante (horas)</label>
            <select value={form.valido_horas} onChange={(e) => setForm({ ...form, valido_horas: e.target.value })}
              className="w-full px-3 py-2 border rounded">
              <option value={2}>2 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas (1 día)</option>
              <option value={48}>48 horas (2 días)</option>
              <option value={72}>72 horas (3 días)</option>
            </select>
          </div>
          <button disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded font-medium">
            {loading ? "Generando..." : "Generar invitación"}
          </button>
          {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="text-center">
            <div className="text-2xl">✓</div>
            <h2 className="text-lg font-semibold text-emerald-700">Invitación creada</h2>
            <p className="text-slate-600">{visitante.nombres} {visitante.apellidos}</p>
            <p className="text-xs text-slate-500">
              Válido hasta {new Date(visitante.codigo_expira).toLocaleString()}
            </p>
          </div>

          <div className="flex justify-center">
            <Barcode value={visitante.codigo} format="CODE128"
              width={2} height={80} displayValue={true} fontSize={12} margin={10} />
          </div>

          <div className="flex gap-2">
            <input readOnly value={visitante.codigo}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 py-2 border rounded font-mono text-sm bg-slate-50" />
            <button onClick={copiar} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
              {copiado ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          {visitante.telefono && (
            <button onClick={compartirWhatsapp}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded flex items-center justify-center gap-2">
              Compartir por WhatsApp
            </button>
          )}

          <button onClick={nuevo}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded">
            Crear otra invitación
          </button>
        </div>
      )}
    </div>
  );
}
