import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ToughCrowdSection from "./ToughCrowdSection.jsx";
import ObscuritySection from "./ObscuritySection.jsx";
import ModernLoadingScreen from "../components/ModernLoadingScreen.jsx";

export default function Stats() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const file = state?.file;
  const fileName = state?.fileName;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tough-crowd");

  // Configuration for sections - easy to add new ones!
  const sections = [
    {
      id: "tough-crowd",
      label: "Average Rating Difference",
      component: ToughCrowdSection,
      ref: useRef(null),
    },
    // {
    //   id: "obscurity",
    //   label: "Obscurity Meter",
    //   component: ObscuritySection,
    //   ref: useRef(null)
    // }
  ];

  // Handle scroll to update active tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      // Find which section we're currently in
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = section.ref.current;
        if (element && scrollPosition >= element.offsetTop) {
          setActiveTab(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Handle tab click to scroll to section
  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    if (!file) {
      setError("No ZIP file provided");
      setLoading(false);
      return;
    }

    const uploadAndGetStats = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("zip", file, fileName);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        // Check if backend returned an error
        if (data.error) {
          throw new Error(data.error);
        }

        if (!res.ok) throw new Error(res.statusText);

        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load stats: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    uploadAndGetStats();
  }, [file, fileName]);

  const renderBackButton = () => (
    <button
      className="modern-upload-btn back-button mb-4"
      onClick={() => navigate("/")}
    >
      <i className="upload-icon bi bi-arrow-left"></i>
      Back to Upload
    </button>
  );

  if (loading) {
    return <ModernLoadingScreen />;
  }

  if (error) {
    return (
      <div className="container text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  const renderTabs = () => (
    <div
      className="container"
      style={{
        position: "fixed",
        top: "var(--header-height)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1020,
        paddingTop: "0",
        paddingBottom: "0",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2px",
          alignItems: "flex-end",
          width: "auto",
        }}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.ref)}
            style={{
              borderRadius: "0 0 8px 8px",
              border: "none",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              backgroundColor:
                activeTab === section.id
                  ? `var(--tab-${section.id})`
                  : "rgba(108, 117, 125, 0.2)",
              color: activeTab === section.id ? "white" : "#adb5bd",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-block",
              width: "auto",
              minWidth: "auto",
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {renderTabs()}
      <div
        className="container text-center"
        style={{ paddingTop: "calc(var(--header-height) + 30px)" }}
      >
        {sections.map((section, index) => {
          const Component = section.component;
          return (
            <div
              key={section.id}
              ref={section.ref}
              style={{
                paddingTop: index === 0 ? "20px" : "80px",
                marginTop: "-20px",
              }}
            >
              <Component stats={stats} />
            </div>
          );
        })}
      </div>
    </>
  );
}
