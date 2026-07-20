import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { api } from "../api/client";

/**
 * Ruta pública /v/:codigo — el visitante abre el link y ve su código.
 * No requiere login.
 */
export default function VisitanteCodigo() {
  const { codigo } = useParams();
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get(`/codigos/publico/${codigo}`)
      .then((r) => setInfo(r.data))
      .catch((e) => setErr(e.response?.data?.detail || "Código no válido"));
  }, [codigo]);

  if (err) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <div className="text-5xl mb-3">✗</div>
          <h1 className="text-xl font-bold text-red-700 mb-2">Código no válido</h1>
          <p className="text-slate-600">{err}</p>
        </div>
      </div>
    );
  }

  if (!info) return <div className="h-full flex items-center justify-center">Cargando…</div>;

  const expira = new Date(info.expira_en + "Z");
  const expirado = expira < new Date();

  return (
    <div className="h-full flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <p className="text-slate-500 text-sm">Código de acceso para</p>
          <h1 className="text-2xl font-bold text-slate-800">{info.nombre}</h1>
        </div>

        {info.consumido ? (
          <div className="bg-slate-100 p-6 rounded-lg text-center">
            <p className="text-slate-600 font-medium">Este código ya fue utilizado</p>
          </div>
        ) : expirado ? (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-red-700 font-medium">Este código ya expiró</p>
            <p className="text-slate-500 text-sm mt-1">
              Pídele al residente una nueva invitación
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center bg-white">
              <Barcode value={info.codigo} format="CODE128"
                width={2.5} height={110} displayValue={true} fontSize={14} margin={10} />
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Válido hasta: <b>{expira.toLocaleString()}</b>
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              Presenta este código al guardia en garita
            </p>
          </>
        )}
      </div>
    </div>
  );
}
