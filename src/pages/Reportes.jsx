import { useState } from "react";
import { api } from "../api/client";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function Reportes() {
  const hoy = new Date();
  // Por defecto mes anterior
  const [year, setYear] = useState(hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() === 0 ? 12 : hoy.getMonth());
  const [loading, setLoading] = useState(null); // "pdf" | "xlsx"
  const [err, setErr] = useState("");

  const descargar = async (formato) => {
    setLoading(formato); setErr("");
    try {
      const res = await api.get("/reportes/mensual", {
        params: { year, month, formato },
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: formato === "pdf" ? "application/pdf" :
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alpha_reporte_${year}_${String(month).padStart(2, "0")}.${formato}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr("No se pudo generar el reporte");
    } finally { setLoading(null); }
  };

  const years = [];
  for (let y = hoy.getFullYear(); y >= 2024; y--) years.push(y);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Reportes mensuales</h1>
      <p className="text-slate-500 mb-6">
        Descarga la bitácora completa, resumen por usuario, resumen por compañía y
        estadísticas diarias del mes seleccionado.
      </p>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mes</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => descargar("pdf")}
            disabled={loading !== null}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded font-medium disabled:opacity-50"
          >
            {loading === "pdf" ? "Generando..." : "Descargar PDF"}
          </button>
          <button
            onClick={() => descargar("xlsx")}
            disabled={loading !== null}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded font-medium disabled:opacity-50"
          >
            {loading === "xlsx" ? "Generando..." : "Descargar Excel"}
          </button>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded text-sm text-slate-700">
        <p><b>Envío automático:</b> el primer día de cada mes se envía el reporte
        del mes anterior por correo al administrador principal.</p>
      </div>
    </div>
  );
}
