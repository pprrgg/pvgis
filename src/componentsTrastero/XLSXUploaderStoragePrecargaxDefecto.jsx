import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    Typography,
    Link,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import * as XLSX from "xlsx";

const ExcelUploaderStorage = () => {
    const [sheets, setSheets] = useState(null);
    const [tempSheets, setTempSheets] = useState(null);
    const [selectedSheet, setSelectedSheet] = useState("");

    useEffect(() => {
        const storedData = sessionStorage.getItem("excelData");

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setSheets(parsedData);
            setTempSheets(parsedData);  // Aseguramos que tanto sheets como tempSheets estén sincronizados
            if (Object.keys(parsedData).length > 0) {
                setSelectedSheet(Object.keys(parsedData)[0]);
            }
        } else {
            // Si sessionStorage está vacío, cargar el archivo por defecto desde public/DocTec_data.xlsx
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

                    setSheets(sheetsData);
                    setTempSheets(sheetsData); // Aseguramos que ambos estados estén sincronizados
                    setSelectedSheet(workbook.SheetNames[0]);
                    sessionStorage.setItem("excelData", JSON.stringify(sheetsData)); // Guardar en sessionStorage
                })
                .catch((err) => console.error("Error al cargar el archivo de la carpeta public", err));
        }
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

            setSheets(sheetsData);
            setTempSheets(sheetsData); // Sincronizamos ambos estados
            setSelectedSheet(workbook.SheetNames[0]);
            sessionStorage.setItem("excelData", JSON.stringify(sheetsData)); // Guardar en sessionStorage
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
        event.preventDefault();
    };

    const handleCellEdit = (rowIndex, columnIndex, value) => {
        const updatedData = [...(tempSheets || sheets)[selectedSheet]];
        updatedData[rowIndex + 1][columnIndex] = value;

        const newSheetsData = { ...tempSheets, [selectedSheet]: updatedData };
        setTempSheets(newSheetsData);
        setSheets(newSheetsData);  // Aseguramos que ambos estados estén sincronizados
        sessionStorage.setItem("excelData", JSON.stringify(newSheetsData)); // Guardamos los cambios en sessionStorage
    };

    const columns = React.useMemo(() => {
        const data = tempSheets || sheets;
        if (data && selectedSheet && data[selectedSheet]?.length > 0) {
            // La primera fila se utiliza como los encabezados
            return data[selectedSheet][0].map((_, index) => ({
                Header: data[selectedSheet][0][index], // Toma el valor de la primera fila como encabezado
                accessor: index.toString(),
            }));
        }
        return [];
    }, [selectedSheet, tempSheets, sheets]);

    const data = React.useMemo(() => {
        const data = tempSheets || sheets;
        if (data && selectedSheet) {
            // Excluye la primera fila (encabezado) de los datos
            return data[selectedSheet]?.slice(1) || [];
        }
        return [];
    }, [selectedSheet, tempSheets, sheets]);

    const handleExport = () => {
        // Obtener los datos de sessionStorage
        const storedData = JSON.parse(sessionStorage.getItem("excelData"));

        // Crear un nuevo libro de trabajo
        const wb = XLSX.utils.book_new();

        // Recorrer las hojas de datos y agregarlas al libro
        Object.keys(storedData).forEach((sheetName) => {
            const sheetData = storedData[sheetName];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        // Generar el archivo Excel y disparar la descarga
        XLSX.writeFile(wb, "DocTec_data.xlsx");
    };

    // if (!data.length || !columns) return null;

    return (
        <Box 
        sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "80vh", // Limita la altura del modal
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflowY: "auto", // Habilita el scroll vertical
        }}
        >
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
                <Box >
                    <Button variant="contained" onClick={handleExport}>
                        Exportar como Excel
                    </Button>
                </Box>

            </Box>
            {(tempSheets || sheets) && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Selecciona una hoja:</Typography>
                    <Select
                        value={selectedSheet}
                        onChange={(e) => setSelectedSheet(e.target.value)}
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        {Object.keys(tempSheets || sheets)
                            .sort() // Esto ordena las hojas alfabéticamente
                            .map((sheetName) => (
                                <MenuItem key={sheetName} value={sheetName}>
                                    {sheetName}
                                </MenuItem>
                            ))}
                    </Select>

                    {selectedSheet && (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                     <TableRow>
                                         {columns.map((column, index) => (
                                             <TableCell
                                                 key={column.accessor}
                                                 sx={{
                                                     backgroundColor: "grey.200", // Fondo gris claro
                                                     fontWeight: "bold",          // Texto en negrita
                                                 }}
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
                                                    sx={
                                                        cellIndex === 0
                                                            ? {
                                                                backgroundColor: "grey.100", // Fondo gris más claro para índices
                                                                fontWeight: "bold",          // Índices en negrita
                                                            }
                                                            : {}
                                                    }
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
            )}
        </Box>
    );
};

export default ExcelUploaderStorage;
