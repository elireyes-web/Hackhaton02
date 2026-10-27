import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import NewsFeed from "./pages/NewsFeed";
import NewsDetail from "./pages/NewsDetail";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Dashboard from "./routes/Dashboard";
import NotFound from "./routes/NotFound";
import WantedPage from "./pages/WantedPage";
import WantedDetailPage from "./pages/WantedDetailPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas Protegidas */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wanted" element={<WantedPage />} />
            <Route path="/wanted/:id" element={<WantedDetailPage />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            
            {/* METAN SUS RUTAS ACA (Sagas, etc) */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;