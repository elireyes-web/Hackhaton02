import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { RequireAuth } from "./auth/RequireAuth.tsx";

// Pantallas temporales (Luego las crearás o las harán tus compañeros)
const Login = () => <div className="p-8 text-2xl font-bold">Pantalla de Login</div>;
const Dashboard = () => <div className="p-8 text-2xl font-bold">Pantalla de Dashboard</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas (Solo si hay sesión) */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Aquí B y C agregarán /wanted, /news, /sagas */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;