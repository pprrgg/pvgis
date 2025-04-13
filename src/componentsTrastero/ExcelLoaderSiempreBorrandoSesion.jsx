import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const ExcelLoader = () => {
    const [sheets, setSheets] = useState({});
    const [selectedSheet, setSelectedSheet] = useState("");

    useEffect(() => {
        // Cargar siempre el archivo predeterminado desde public/DocTec_data.xlsx
        fetch("/DocTec_data.xlsx")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el archivo predeterminado");
                }
                return response.arrayBuffer();
            })
            .then((data) => {
                const workbook = XLSX.read(data, { type: "array" });
                const sheetsData = {};

                workbook.SheetNames.forEach((sheetName) => {
                    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1,
                    });
                    const filteredSheet = sheet.filter((row) =>
                        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
                    );
                    sheetsData[sheetName] = filteredSheet;
                });

                // Actualizar estados y sessionStorage
                setSheets(sheetsData);
                setSelectedSheet(workbook.SheetNames[0]);
                sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
            })
            .catch((err) => console.error("Error al cargar el archivo predeterminado:", err));
    }, []); // Se ejecuta solo al montar el componente

    return (
        <div>
            {/* Renderiza aquí los datos o componentes adicionales */}
        </div>
    );
};

export default ExcelLoader;