"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0",
        className
      )}
      style={{
        position: "relative",
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#020617",
        width: "100%",
        borderRadius: "6px",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          flex: 1,
          transform: "scaleY(1.25)",
          alignItems: "center",
          justifyContent: "center",
          isolation: "isolate",
          zIndex: 0,
        }}
      >
        {/* Left conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, #06b6d4, transparent, transparent)`,
            position: "absolute",
            inset: "auto",
            right: "50%",
            height: "14rem",
            overflow: "visible",
            color: "white",
          }}
        >
          <div style={{
            position: "absolute", width: "100%", left: 0,
            backgroundColor: "#020617", height: "10rem", bottom: 0, zIndex: 20,
            maskImage: "linear-gradient(to top, white, transparent)",
            WebkitMaskImage: "linear-gradient(to top, white, transparent)",
          }} />
          <div style={{
            position: "absolute", width: "10rem", height: "100%", left: 0,
            backgroundColor: "#020617", bottom: 0, zIndex: 20,
            maskImage: "linear-gradient(to right, white, transparent)",
            WebkitMaskImage: "linear-gradient(to right, white, transparent)",
          }} />
        </motion.div>

        {/* Right conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, #06b6d4)`,
            position: "absolute",
            inset: "auto",
            left: "50%",
            height: "14rem",
            color: "white",
          }}
        >
          <div style={{
            position: "absolute", width: "10rem", height: "100%", right: 0,
            backgroundColor: "#020617", bottom: 0, zIndex: 20,
            maskImage: "linear-gradient(to left, white, transparent)",
            WebkitMaskImage: "linear-gradient(to left, white, transparent)",
          }} />
          <div style={{
            position: "absolute", width: "100%", right: 0,
            backgroundColor: "#020617", height: "10rem", bottom: 0, zIndex: 20,
            maskImage: "linear-gradient(to top, white, transparent)",
            WebkitMaskImage: "linear-gradient(to top, white, transparent)",
          }} />
        </motion.div>

        {/* Dark blur overlays */}
        <div style={{
          position: "absolute", top: "50%", height: "12rem", width: "100%",
          transform: "translateY(3rem) scaleX(1.5)", backgroundColor: "#020617",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "50%", zIndex: 50, height: "12rem", width: "100%",
          backgroundColor: "transparent", opacity: 0.1, backdropFilter: "blur(8px)",
        }} />

        {/* Cyan glow orb */}
        <div style={{
          position: "absolute", inset: "auto", zIndex: 50, height: "9rem", width: "28rem",
          transform: "translateY(-50%)", borderRadius: "999px",
          backgroundColor: "#06b6d4", opacity: 0.5, filter: "blur(48px)",
        }} />

        {/* Animated glow blob */}
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: "auto", zIndex: 30, height: "9rem",
            transform: "translateY(-6rem)", borderRadius: "999px",
            backgroundColor: "#22d3ee", filter: "blur(40px)",
          }}
        />

        {/* Thin line */}
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: "auto", zIndex: 50, height: "2px",
            transform: "translateY(-7rem)", backgroundColor: "#22d3ee",
          }}
        />

        {/* Bottom cover */}
        <div style={{
          position: "absolute", inset: "auto", zIndex: 40, height: "11rem", width: "100%",
          transform: "translateY(-12.5rem)", backgroundColor: "#020617",
        }} />
      </div>

      {/* Children slot */}
      <div style={{
        position: "relative", zIndex: 50, display: "flex",
        transform: "translateY(-20rem)", flexDirection: "column",
        alignItems: "center", padding: "0 1.25rem",
      }}>
        {children}
      </div>
    </div>
  );
};
