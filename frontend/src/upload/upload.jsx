import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import JSZip from "jszip";

const Upload = () => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    const validateZip = async (file) => {
        const zip = new JSZip();
        try {
            const zipContent = await zip.loadAsync(file);
            const filenames = Object.keys(zipContent.files);
            
            const hasRatingsCSV = filenames.some(name => name.toLowerCase().includes("ratings.csv"));

            return hasRatingsCSV;
        } catch (err) {
            console.error("Invalid ZIP file: ", err);
            return false;
        }
    }

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {

            const isValid = await validateZip(e.target.files[0])

            if(isValid){
                setFileName(e.target.files[0].name);
                //route to another page for stats
            } else {
                alert("Invalid ZIP file. Please upload your letterboxd-username-date.zip file.")
            }
            e.target.value = null;
        }
    };

    const [loading, setLoading] = useState(false);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ overflow: "hidden"}}>
            <div
                className="p-5 rounded bg-dark text-center"
                style={{ minWidth: 400, maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
            >
                <h2 className="mb-4 text-light">Upload Letterboxd ZIP File</h2>
                <label
                    htmlFor="zip-upload"
                    className="btn btn-lg btn-primary w-100 py-4"
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                >
                    {loading ? (
                        <span>
                            Loading...
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        </span>
                    ) : fileName ? (
                        <span>
                            <i className="bi bi-file-zip-fill me-2"></i>
                            {fileName}
                        </span>
                    ) : (
                        <span>
                            <i className="bi bi-upload me-2"></i>
                            Click to upload ZIP file here
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