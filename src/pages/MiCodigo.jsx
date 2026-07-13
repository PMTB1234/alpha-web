import { useEffect, useState, useRef } from "react";
import Barcode from "react-barcode";
import { api } from "../api/client";

export default function MiCodigo() {
  const [codigo, setCodigo] = useState(null);
  const [expiraEn, setExpiraEn] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  const generar = async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.post("/codigos/generar");
      setCodigo(data.codigo);
      const exp = new Date(data.expira_en + "Z"); // UTC
      setExpiraEn(exp);
      setSegundos(data.ttl_segundos);
    } catch (e) {
      setErr(e.response?.data?.detail || "No se pudo generar el código");
    } finally { setLoading(false); }
  };

  useEffect(() => { generar(); }, []);

  // Countdown
  useEffect(() => {
    if (!expiraEn) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const s = Math.max(0, Math.floor((expiraEn - new Date()) / 1000));
      setSegundos(s);
      if (s === 0) {
        clearInterval(timerRef.current);
        // Auto-regenerar cuando expira
        generar();
      }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [expiraEn]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Mi código de acceso</h1>
      <p className="text-slate-500 text-sm mb-6">
        Muéstralo al guardia. Se renueva automáticamente cuando expira.
      </p>

      {err && <p className="text-red-600 mb-4">{err}</p>}

      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
        {loading || !codigo ? (
          <div className="h-40 flex items-center text-slate-400">Generando…</div>
        ) : (
          <>
            <Barcode
              value={codigo}
              format="CODE128"
              width={2}
              height={90}
              displayValue={true}
              fontSize={14}
              margin={10}
            />
            <div className="mt-4 text-center">
              <div className="text-4xl font-bold" style={{
                color: segundos <= 10 ? "#dc2626" : segundos <= 30 ? "#ea580c" : "#16a34a"
              }}>
                {segundos}s
              </div>
              <div className="text-sm text-slate-500 mt-1">para renovar</div>
            </div>
            <button
              onClick={generar}
              className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded"
            >
              Regenerar ahora
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Cada código sirve una sola vez. Si alguien más ve el código, no podrá usarlo después.
      </p>
    </div>
  );
}
