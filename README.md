# Alpha Web

Panel web (React + Vite + Tailwind) para el sistema Alpha de control de acceso a parqueos.

## Requisitos

- Node.js 18+
- API Alpha corriendo en `http://localhost:8000`

## Instalacion

```bash
cd alpha-web
npm install
copy .env.example .env
```

`.env` por defecto apunta a `http://localhost:8000` (la API). Cambialo si tu API esta en otra URL.

## Correr en desarrollo

```bash
npm run dev
```

Abre <http://localhost:5173>.

Login con: documento `V-12345678`, contraseña `admin123` (la que pusiste con `seed_admin.py`).

## Estructura

```
alpha-web/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx              # Rutas
    ├── index.css            # Tailwind
    ├── api/client.js        # Axios + interceptor JWT
    ├── context/AuthContext.jsx
    ├── components/
    │   ├── Layout.jsx       # Sidebar + outlet
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx    # Capacidad por compania + quien esta dentro
        ├── Companias.jsx    # CRUD
        ├── Usuarios.jsx     # CRUD + busqueda
        └── Accesos.jsx      # Registrar + bitacora con filtros
```

## Pantallas

- **Dashboard**: tarjetas de capacidad por compania (verde/amarillo/rojo segun ocupacion), lista en vivo de quien esta dentro, accesos por dia. Refresca cada 5 seg.
- **Companias**: alta, edicion, desactivacion.
- **Usuarios**: alta con rol y compania, busqueda por nombre o documento, cambio de password.
- **Bitacora**: registro rapido de entradas/salidas (muestra cap. restante tras cada registro) y consulta historica con filtros de fecha/tipo/usuario.

## Build de produccion

```bash
npm run build
```

Genera `dist/`. Puedes servirlo con Nginx, Caddy, o `npm run preview`.
