import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebaseConfig";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import { Box, Backdrop, CircularProgress, Typography, Button } from "@mui/material";
import config from "./configURL";
import XLSXUploaderStoragePrecargaxDefectoHojaModal from "./XLSXUploaderStoragePrecargaxDefectoHojaModal";
import MapaModal from "./MapaModal";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/3.11.174/pdf.worker.min.js`;


const PDFRenderer = () => {
    const capitalizar = (str) => {
        if (!str) return '';
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const ep = JSON.parse(sessionStorage.getItem('selectedFicha') || 'null');
    const ENDPOINT = `${ep.grupo}/${ep.sector}/${ep.cod}/${capitalizar(ep.co)}`;

    console.log(ENDPOINT)


    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [open, setOpen] = useState(false);
    const [openx, setOpenx] = useState(false);

    const abrirModal = useCallback(() => setOpen(true), []);
    const cerrarModal = useCallback(() => setOpen(false), []);
    const abrirModalx = useCallback(() => setOpenx(true), []);
    const cerrarModalx = useCallback(() => setOpenx(false), []);

    const getExcelDataFromSessionStorage = () => {
        const data = sessionStorage.getItem("excelData");
        try {
            return data ? JSON.parse(data) : {};
        } catch (err) {
            console.error("Error al parsear excelData desde sessionStorage:", err);
            return {};
        }
    };

    const renderPdfFromUrl = useCallback(async () => {
        setLoading(true);
        const parametros = getExcelDataFromSessionStorage();
        const PDF_API_URL = `${config.API_URL}/${ENDPOINT}?timestamp=${new Date().getTime()}`;

        try {
            const response = await axios.post(PDF_API_URL, parametros, {
                responseType: "arraybuffer",
            });

            if (response.status !== 200) {
                throw new Error("Error al obtener el PDF");
            }

            const blob = new Blob([response.data], { type: "application/pdf" });
            setPdfBlob(blob);

            const pdf = await pdfjsLib.getDocument({ data: response.data }).promise;
            if (pdf.numPages === 0) throw new Error("El PDF no tiene páginas");

            const pages = await Promise.all(
                Array.from({ length: pdf.numPages }, async (_, i) => {
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport({ scale: 2.5 });
                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({
                        canvasContext: canvas.getContext("2d"),
                        viewport,
                    }).promise;
                    return canvas.toDataURL("image/png");
                })
            );

            setImages(pages);
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        renderPdfFromUrl();
    }, [renderPdfFromUrl]);

    const handleDownload = () => {
        if (!pdfBlob) return;

        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "documento.pdf";
        link.click();
        window.URL.revokeObjectURL(url);
    };


    const handleRecalculate = () => {
        sessionStorage.setItem("modalOpen", "true");
        window.location.reload();
    };


    return (
        <div style={{ position: "relative" }}>



            <Backdrop open={loading} style={{ zIndex: 1201, color: "#000" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CircularProgress color="inherit" sx={{ color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', marginTop: 2 }}>
                        Cargando...
                    </Typography>
                </div>
            </Backdrop>

            {error && <Typography align="center" color="error">{error}</Typography>}

            {pdfBlob && (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleDownload}
                        style={{
                            position: "fixed",
                            top: "16px",
                            right: "16px",
                            zIndex: 1300,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                            borderRadius: "8px"
                        }}
                    >
                        Descargar PDF
                    </Button>

                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => abrirModal()}
                        style={{
                            position: "fixed",
                            top: "70px",
                            right: "16px",
                            zIndex: 1300,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            borderRadius: "8px"
                        }}
                    >
                        Editar Excel
                    </Button>
                </>
            )}



            <Box display="flex" flexDirection="column" alignItems="flex-start">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Página ${index + 1}`}
                        style={{ width: "100%", borderRadius: "8px", marginBottom: "12px" }}
                    />
                ))}
            </Box>

            {/* <XLSXUploaderStoragePrecargaxDefectoHojaModal openx={openx} cerrarModalx={cerrarModalx}   handleRecalculate={handleRecalculate}/> */}

            {/* <MapaModal open={open} cerrarModal={cerrarModal} /> */}

        </div>
    );
};

export default PDFRenderer;
