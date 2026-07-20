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
  const [copiado, setCopiado] = useState("");

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

  // Link público para que el visitante abra su código
  const linkPublico = visitante ? `${window.location.origin}/v/${visitante.codigo}` : "";

  // Texto que se comparte por cualquier canal
  const textoMensaje = visitante ? (
    `Hola ${visitante.nombres}, aquí tienes tu código de acceso al parqueo:\n\n` +
    `${linkPublico}\n\n` +
    `Código: ${visitante.codigo}\n` +
    `Válido hasta: ${new Date(visitante.codigo_expira + "Z").toLocaleString()}\n\n` +
    `Presenta el código en garita.`
  ) : "";

  const copiar = async (que, texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(que); setTimeout(() => setCopiado(""), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = texto; document.body.appendChild(el);
      el.select(); document.execCommand("copy");
      document.body.removeChild(el);
      setCopiado(que); setTimeout(() => setCopiado(""), 2000);
    }
  };

  const compartirNativo = async () => {
    if (!navigator.share) {
      copiar("mensaje", textoMensaje);
      return;
    }
    try {
      await navigator.share({
        title: "Invitación al parqueo",
        text: textoMensaje,
        url: linkPublico,
      });
    } catch {}
  };

  const whatsapp = () => {
    const num = (visitante?.telefono || "").replace(/\D/g, "");
    const url = num
      ? `https://wa.me/${num}?text=${encodeURIComponent(textoMensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(textoMensaje)}`;
    window.open(url, "_blank");
  };

  const email = () => {
    const subject = "Invitación de acceso al parqueo";
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textoMensaje)}`;
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
          : "Registra un visitante nuevo. Recibe un código para entrar."}
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
            <label className="block text-xs text-slate-600 mb-1">Teléfono (para WhatsApp)</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+502..." className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Válido durante</label>
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
            <div className="text-3xl">✓</div>
            <h2 className="text-lg font-semibold text-emerald-700">Invitación creada</h2>
            <p className="text-slate-600">{visitante.nombres} {visitante.apellidos}</p>
            <p className="text-xs text-slate-500">
              Válido hasta {new Date(visitante.codigo_expira + "Z").toLocaleString()}
            </p>
          </div>

          <div className="flex justify-center bg-slate-50 rounded p-2">
            <Barcode value={visitante.codigo} format="CODE128"
              width={2} height={70} displayValue={true} fontSize={12} margin={10} />
          </div>

          {/* Link público (lo más importante) */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Link para enviar al visitante</label>
            <div className="flex gap-2">
              <input readOnly value={linkPublico}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border rounded text-xs bg-slate-50" />
              <button onClick={() => copiar("link", linkPublico)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap">
                {copiado === "link" ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Al abrirlo, el visitante ve su código a pantalla completa
            </p>
          </div>

          {/* Botones de envío */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Enviar invitación por:</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={whatsapp}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded text-sm font-medium">
                WhatsApp
              </button>
              <button onClick={email}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-medium">
                Correo
              </button>
              <button onClick={compartirNativo}
                className="col-span-2 bg-slate-700 hover:bg-slate-800 text-white py-2 rounded text-sm font-medium">
                Compartir (SMS, Telegram, etc.)
              </button>
              <button onClick={() => copiar("mensaje", textoMensaje)}
                className="col-span-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded text-sm">
                {copiado === "mensaje" ? "¡Mensaje copiado!" : "Copiar mensaje completo"}
              </button>
            </div>
          </div>

          <button onClick={nuevo}
            className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded text-sm">
            + Crear otra invitación
          </button>
        </div>
      )}
    </div>
  );
}
