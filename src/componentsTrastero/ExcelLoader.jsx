import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const ExcelLoader = () => {
    const [sheets, setSheets] = useState(null);
    const [selectedSheet, setSelectedSheet] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedData = sessionStorage.getItem("excelData");

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setSheets(parsedData);
            setSelectedSheet(Object.keys(parsedData)[0] || "");
            setLoading(false);
        } else {
            fetchDefaultExcel();
        }
    }, []);

    const fetchDefaultExcel = async () => {
        try {
            const response = await fetch("/DocTec_data.xlsx");
            if (!response.ok) throw new Error("No se pudo cargar el archivo predeterminado");

            const data = await response.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheetsData = {};

            workbook.SheetNames.forEach((sheetName) => {
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                sheetsData[sheetName] = sheet.filter((row) =>
                    row.some((cell) => cell !== null && cell !== undefined && cell !== "")
                );
            });

            sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
            setSheets(sheetsData);
            setSelectedSheet(workbook.SheetNames[0] || "");
        } catch (err) {
            console.error("Error al cargar el archivo predeterminado:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando datos...</p>;

    return (
        <div>
            {/* <p>Hoja seleccionada: {selectedSheet}</p> */}
            {/* Renderiza aquí los datos o componentes adicionales */}
        </div>
    );
};

export default ExcelLoader;
