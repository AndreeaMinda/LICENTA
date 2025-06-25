import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clienti from "./pages/Clienti";
import Materials from "./pages/Materials";
import Deviz from "./pages/Deviz";
import VizualizareDevize from "./pages/VizualizareDevize";
import AdaugaUtilizator from "./pages/AdaugaUtilizator";
import SchimbareParola from "./pages/SchimbareParola";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OfertaNoua from "./pages/OfertaNoua";
import OferteSalvate from "./pages/OferteSalvate";
import VizualizareOferta from "./pages/VizualizareOferta";
import NecesarMateriale from "./pages/NecesarMateriale";
import Programari from "./pages/Programari";

import Layout from "./components/Layout"; // nou!
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/voltplan.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pagini FĂRĂ Layout */}
        <Route element={<Layout hideNav={true} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Pagini CU Layout */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clienti"
            element={
              <ProtectedRoute>
                <Clienti />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materiale"
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deviz"
            element={
              <ProtectedRoute>
                <Deviz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vizualizare-devize"
            element={
              <ProtectedRoute>
                <VizualizareDevize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deviz/:id"
            element={
              <ProtectedRoute>
                <Deviz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deviz/:id/clone"
            element={
              <ProtectedRoute>
                <Deviz isClone={true} />
              </ProtectedRoute>
            }
          />
          <Route path="/oferta" element={<OfertaNoua />} />
          <Route
            path="/adauga-utilizator"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdaugaUtilizator />
              </ProtectedRoute>
            }
          />
          <Route path="/oferte-salvate" element={<OferteSalvate />} />
          <Route
            path="/oferta/:id"
            element={
              <ProtectedRoute>
                <VizualizareOferta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vizualizare-oferta/:id"
            element={<VizualizareOferta />}
          />
          <Route path="/editeaza-oferta/:id" element={<OfertaNoua />} />
          <Route path="/necesar-materiale" element={<NecesarMateriale />} />
          <Route path="/programari" element={<Programari />} />
          <Route
            path="/schimba-parola"
            element={
              <ProtectedRoute>
                <SchimbareParola />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
