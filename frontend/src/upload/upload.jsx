import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Upload = () => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            // You can handle the file upload logic here
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFileName(e.dataTransfer.files[0].name);
            // You can handle the file upload logic here
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ overflow: "hidden"}}>
            <div
                className="p-5 rounded bg-dark text-center"
                style={{ minWidth: 400, maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <h2 className="mb-4 text-light">Upload Letterboxd ZIP File</h2>
                <label
                    htmlFor="zip-upload"
                    className="btn btn-lg btn-primary w-100 py-4"
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                >
                    {fileName ? (
                        <span>
                            <i className="bi bi-file-zip-fill me-2"></i>
                            {fileName}
                        </span>
                    ) : (
                        <span>
                            <i className="bi bi-upload me-2"></i>
                            Click or Drag ZIP file here
                        </span>
                    )}
                    <input
                        id="zip-upload"
                        type="file"
                        accept=".zip"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </label>
                <ol className="mt-4 text-start text-secondary">
                    <li>Go to <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer">letterboxd.com</a> and sign in.</li>
                    <li>Under your account, click Settings, then click Data.</li>
                    <li>Click Export Your Data and upload here.</li>
                </ol>
            </div>
        </div>
    );
};

export default Upload;