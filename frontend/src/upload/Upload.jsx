import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import JSZip from "jszip";

const Upload = () => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const validateZip = async (file) => {
    const zip = new JSZip();
    try {
      const zipContent = await zip.loadAsync(file);
      const filenames = Object.keys(zipContent.files);

      const hasRatingsCSV = filenames.some((name) =>
        name.toLowerCase().includes("ratings.csv")
      );

      return hasRatingsCSV;
    } catch (err) {
      console.error("Invalid ZIP file: ", err);
      return false;
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = await validateZip(e.target.files[0]);

      if (isValid) {
        setFileName(file.name);
        navigate("/stats", {
          state: {
            file,
            fileName: file.name,
          },
        });
      } else {
        alert(
          "Invalid ZIP file. Please upload your letterboxd-username-date.zip file."
        );
      }
      e.target.value = null;
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <div
      className="d-flex justify-content-center align-items-center upload-container"
      style={{ overflow: "hidden" }}
    >
      <div
        className="p-5 rounded bg-dark text-center"
        style={{
          minWidth: 400,
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 className="mb-5 text-light">Upload Letterboxd ZIP File</h2>

        <div className="upload-area mb-4">
          <label
            htmlFor="zip-upload"
            className={`modern-upload-btn w-100 ${loading ? "loading" : ""} ${
              fileName ? "uploaded" : ""
            }`}
            style={{ fontSize: "1.2rem", cursor: "pointer", border: "none" }}
          >
            {loading ? (
              <span>
                <i className="upload-icon bi bi-arrow-clockwise"></i>
                Processing...
                <span
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              </span>
            ) : fileName ? (
              <span>
                <i className="upload-icon bi bi-check-circle-fill"></i>
                {fileName}
              </span>
            ) : (
              <span>
                <i className="upload-icon bi bi-cloud-upload"></i>
                Choose your ZIP file
              </span>
            )}
          </label>
          <input
            id="zip-upload"
            type="file"
            accept=".zip"
            ref={fileInputRef}
            onChange={async (e) => {
              setLoading(true);
              await handleFileChange(e);
              setLoading(false);
            }}
            style={{ display: "none" }}
          />
        </div>

        <div className="upload-instructions text-start">
          <ol className="text-secondary">
            <li>
              Go to{" "}
              <a
                href="https://letterboxd.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                letterboxd.com
              </a>{" "}
              and sign in.
            </li>
            <li>
              Under your account, click Settings, then click Data. (on mobile,
              click the three bars, then Settings, then scroll to bottom)
            </li>
            <li>Click Export Your Data and upload here.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Upload;
