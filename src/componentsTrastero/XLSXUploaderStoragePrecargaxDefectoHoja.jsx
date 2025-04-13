import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    Typography,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import * as XLSX from "xlsx";

const ExcelUploaderStorage = ({ sheetName }) => {
    const [sheets, setSheets] = useState(null);
    const [tempSheets, setTempSheets] = useState(null);

    // Función para cargar los datos del sessionStorage y actualizar el estado
    const loadDataFromSessionStorage = () => {
        const storedData = sessionStorage.getItem("excelData");

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setSheets(parsedData);
        } else {
            // Si no hay datos en sessionStorage, carga el archivo por defecto desde public/DocTec_data.xlsx
            fetch("/DocTec_data.xlsx")
                .then((response) => response.arrayBuffer())
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

                    setTempSheets(sheetsData);
                    sessionStorage.setItem("excelData", JSON.stringify(sheetsData)); // Guardar en sessionStorage
                })
                .catch((err) => console.error("Error al cargar el archivo de la carpeta public", err));
        }
    };

    useEffect(() => {
        loadDataFromSessionStorage();
    }, []);

    const handleFileUpload = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
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

            // Solo actualiza el sessionStorage si no hay datos previos
            const currentData = JSON.parse(sessionStorage.getItem("excelData")) || {};
            const updatedData = { ...currentData, ...sheetsData };

            setTempSheets(sheetsData);
            sessionStorage.setItem("excelData", JSON.stringify(updatedData)); // Guardar en sessionStorage
        };

        reader.readAsArrayBuffer(file);
    };

    const handleInputChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // Necesario para permitir la acción de soltar
    };

    const handleCellEdit = (rowIndex, columnIndex, value) => {
        const updatedData = [...(tempSheets || sheets)[sheetName]];
        updatedData[rowIndex + 1][columnIndex] = value;

        const updatedSheets = { ...(tempSheets || sheets), [sheetName]: updatedData };
        setTempSheets(updatedSheets);

        sessionStorage.setItem("excelData", JSON.stringify(updatedSheets));
    };

    const columns = React.useMemo(() => {
        const data = tempSheets || sheets;
        if (data && sheetName && data[sheetName]?.length > 0) {
            return data[sheetName][0].map((_, index) => ({
                Header: data[sheetName][0][index],
                accessor: index.toString(),
            }));
        }
        return [];
    }, [sheetName, tempSheets, sheets]);

    const data = React.useMemo(() => {
        const data = tempSheets || sheets;
        if (data && sheetName) {
            return data[sheetName]?.slice(1) || [];
        }
        return [];
    }, [sheetName, tempSheets, sheets]);

    const handleExport = () => {
        const storedData = JSON.parse(sessionStorage.getItem("excelData"));
        const wb = XLSX.utils.book_new();

        Object.keys(storedData).forEach((sheetName) => {
            const sheetData = storedData[sheetName];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        XLSX.writeFile(wb, "DocTec_data.xlsx");
    };

    if (!data.length || !columns) return null;

    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    mt: 2,
                    p: 2,
                    border: "2px dashed",
                    borderColor: "grey.400",
                    borderRadius: 2,
                    textAlign: "center",
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <Typography variant="body1" gutterBottom>
                    Arrastra y suelta tu archivo aquí o selecciona uno manualmente
                </Typography>
                <Button variant="contained" component="label">
                    Seleccionar Archivo
                    <input
                        type="file"
                        hidden
                        accept=".xlsx, .xls"
                        onChange={handleInputChange}
                    />
                </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                    ¿Necesitas una plantilla? Descárgala haciendo clic
                    <Link href="/plantillasParametros/caes.xlsx" download sx={{ ml: 1 }}>
                        aquí
                    </Link>
                    .
                </Typography>
                <Box>
                    <Button variant="contained" onClick={handleExport}>
                        Exportar como Excel
                    </Button>
                </Box>
            </Box>
            {(tempSheets || sheets) && sheetName && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableCell
                                        key={column.accessor}
                                        sx={index === 0 ? { width: '4px' } : {}}
                                    >
                                        {column.Header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell
                                            key={cellIndex}
                                            contentEditable={cellIndex !== 0}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                if (cellIndex !== 0) {
                                                    const value = e.target.innerText;
                                                    handleCellEdit(rowIndex, cellIndex, value);
                                                }
                                            }}
                                            sx={cellIndex === 0 ? { width: '4px' } : {}}
                                        >
                                            {cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ExcelUploaderStorage;



