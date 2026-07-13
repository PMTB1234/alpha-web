import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState("V-12345678");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(documento, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-slate-100">
      <form onSubmit={handle} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Alpha</h1>
          <p className="text-slate-500 text-sm">Sistema de control de acceso</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Documento</label>
          <input
            type="text" value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
