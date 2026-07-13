import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";

export default function Escaner() {
  const [buffer, setBuffer] = useState("");
  const [resultado, setResultado] = useState(null); // {ok, ...}
  const [procesando, setProcesando] = useState(false);
  const inputRef = useRef(null);

  // Mantener el focus SIEMPRE en el input escondido
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    const t = setInterval(focus, 500);
    document.addEventListener("click", focus);
    return () => { clearInterval(t); document.removeEventListener("click", focus); };
  }, []);

  const procesar = async (codigo) => {
    if (!codigo || procesando) return;
    setProcesando(true);
    try {
      const { data } = await api.post("/accesos/codigo", { codigo });
      setResultado({ ok: true, ...data });
      // Auto limpiar después de 5 seg
      setTimeout(() => setResultado(null), 5000);
    } catch (e) {
      setResultado({
        ok: false,
        detail: e.response?.data?.detail || "Error al escanear",
      });
      setTimeout(() => setResultado(null), 5000);
    } finally {
      setProcesando(false);
      setBuffer("");
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      procesar(buffer.trim());
    }
  };

  const bg = resultado
    ? resultado.ok
      ? resultado.tipo === "entrada" ? "bg-emerald-600" : "bg-orange-500"
      : "bg-red-600"
    : "bg-slate-800";

  return (
    <div className={`h-full flex flex-col items-center justify-center text-white transition-colors ${bg}`}>
      {/* Input invisible que captura el escaneo del lector USB */}
      <input
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onKeyDown={onKey}
        className="opacity-0 absolute pointer-events-none"
        autoFocus
      />

      {!resultado ? (
        <div className="text-center px-6">
          <div className="text-8xl mb-6">📷</div>
          <h1 className="text-4xl font-bold mb-2">Modo Escáner</h1>
          <p className="text-slate-300 text-lg">Apunte el lector al código del residente</p>
          {procesando && <p className="mt-6 text-yellow-300">Procesando…</p>}
        </div>
      ) : resultado.ok ? (
        <div className="text-center px-6">
          <div className="text-8xl mb-4">{resultado.tipo === "entrada" ? "✓" : "→"}</div>
          <h1 className="text-5xl font-bold mb-2 uppercase">{resultado.tipo}</h1>
          <p className="text-3xl mt-4">{resultado.usuario}</p>
          {resultado.compania && <p className="text-xl mt-2 opacity-90">{resultado.compania}</p>}
          {resultado.capacidad_restante_compania != null && (
            <p className="text-lg mt-4 opacity-80">
              Espacios disponibles: <b>{resultado.capacidad_restante_compania}</b>
            </p>
          )}
        </div>
      ) : (
        <div className="text-center px-6">
          <div className="text-8xl mb-4">✗</div>
          <h1 className="text-4xl font-bold mb-2">Error</h1>
          <p className="text-xl mt-2">{resultado.detail}</p>
        </div>
      )}

      <p className="absolute bottom-4 text-xs opacity-60">
        Alpha · Modo escáner activo
      </p>
    </div>
  );
}
