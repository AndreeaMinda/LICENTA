// src/components/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ButtonToDashboard from "./ButtonToDashboard";

const Layout = ({ hideNav }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f2f2f2",
      }}
    >
      {!hideNav && <Navbar />}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
      <Footer />
      {!hideNav && <ButtonToDashboard />}
    </div>
  );
};

export default Layout;
