import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    IconButton,
    Menu,
    MenuItem,
    Tabs,
    Tab,
    Backdrop,
    Select,
    AppBar,
    Toolbar,
    Container,
    useMediaQuery,
} from "@mui/material";

import * as XLSX from "xlsx";
import {
    Calculate as CalculateIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    CloudDownload as CloudDownloadIcon,
    CloudUpload as CloudUploadIcon,
    Map as MapIcon,
} from "@mui/icons-material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapaModal from "./MapaModal";

const ExcelUploaderStorage = ({ openx, cerrarModalx, handleRecalculate }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [activeTab, setActiveTab] = useState(0);
    const [openMapaModal, setOpenMapaModal] = useState(false);
    const [excelDataFromSession, setExcelDataFromSession] = useState(null);
    const formattedDate = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");

    useEffect(() => {
        const sessionData = sessionStorage.getItem("excelData");
        if (sessionData) {
            setExcelDataFromSession(JSON.parse(sessionData));
        }
    }, [openx]);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleOpenMapaModal = () => setOpenMapaModal(true);
    const handleCloseMapaModal = () => setOpenMapaModal(false);

    const handleFileUpload = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetsData = {};

            workbook.SheetNames.forEach((sheetName) => {
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                const filledSheet = sheet.map((row) => row.map((cell) => (cell === null || cell === undefined ? " " : cell)));
                const filteredSheet = filledSheet.filter((row) => row.some((cell) => cell !== ""));
                sheetsData[sheetName] = filteredSheet;
            });

            const selectedValues = JSON.parse(JSON.stringify(sheetsData));
            Object.keys(selectedValues).forEach((sheetName) => {
                selectedValues[sheetName].forEach((row, rowIndex) => {
                    row.forEach((cell, cellIndex) => {
                        if (typeof cell === 'string' && cell.includes(';')) {
                            selectedValues[sheetName][rowIndex][cellIndex] = cell.split(';')[0].trim();
                        }
                    });
                });
            });

            sessionStorage.setItem("excelData", JSON.stringify(selectedValues));
            setExcelDataFromSession(selectedValues);
            toast.success("¡Archivo cargado correctamente!");
        };

        reader.readAsArrayBuffer(file);
    };

    const handleInputChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    };
    const handleImportar = () => {
        const ep = JSON.parse(sessionStorage.getItem('selectedFicha') || 'null');
    
        if (!ep || !ep.cod) {
            toast.error("No se encontró el código de referencia para validar el archivo.");
            return;
        }
    
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".xlsx, .xls";
        fileInput.style.display = "none";
    
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
    
            if (!file || !file.name.toLowerCase().includes(ep.cod.toLowerCase())) {
                toast.error(`El archivo debe ser 'DocTec_${ep.cod}_******** '.`);
                document.body.removeChild(fileInput);
                return;
            }
    
            handleFileUpload(file);
            document.body.removeChild(fileInput);
        });
    
        document.body.appendChild(fileInput);
        fileInput.click();
    };
    
    

    const handleExport = () => {
        const sessionData = JSON.parse(sessionStorage.getItem("excelData"));
        const wb = XLSX.utils.book_new();

        Object.keys(sessionData).forEach((sheetName) => {
            const sheetData = sessionData[sheetName];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        const ep = JSON.parse(sessionStorage.getItem('selectedFicha') || 'null');

        const fileName = `DocTec_${ep.cod}_${formattedDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleCellEdit = (rowIndex, columnIndex, value, activeSheet) => {
        if (value.trim() === "") return;

        const updatedData = [...excelDataFromSession[activeSheet]];
        updatedData[rowIndex + 1][columnIndex] = value;

        const updatedSheets = { ...excelDataFromSession, [activeSheet]: updatedData };
        setExcelDataFromSession(updatedSheets);
        sessionStorage.setItem("excelData", JSON.stringify(updatedSheets));
    };

    const activeSheet = excelDataFromSession ? Object.keys(excelDataFromSession)[activeTab] : null;

    const columns = React.useMemo(() => {
        if (excelDataFromSession && activeSheet && excelDataFromSession[activeSheet]?.length > 0) {
            return excelDataFromSession[activeSheet][0].map((_, index) => ({
                Header: excelDataFromSession[activeSheet][0][index],
                accessor: index.toString(),
            }));
        }
        return [];
    }, [activeSheet, excelDataFromSession]);

    const data = React.useMemo(() => {
        if (excelDataFromSession && activeSheet) {
            return excelDataFromSession[activeSheet]?.slice(1) || [];
        }
        return [];
    }, [activeSheet, excelDataFromSession]);

    const menuOptions = [
        // { label: "Cancelar", icon: <CloseIcon />, onClick: cerrarModalx },
        { label: "Calcular", icon: <CalculateIcon />, onClick: handleRecalculate },
        { label: "Importar", icon: <CloudUploadIcon />, onClick: handleImportar },
        { label: "Exportar", icon: <CloudDownloadIcon />, onClick: handleExport },
        { label: "Ubicación", icon: <MapIcon />, onClick: handleOpenMapaModal },
    ];

    return (
        <>
            <Modal open={openx} onClose={cerrarModalx} BackdropComponent={Backdrop} BackdropProps={{ onClick: cerrarModalx }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        height: "90%",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        overflowY: "auto",
                    }}
                >
                    <IconButton
                        onClick={cerrarModalx}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            color: "grey.700"
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <AppBar position="static" sx={{ mb: 2, bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
                        <Container maxWidth="xl">
                            <Toolbar disableGutters>
                                {isMobile ? (
                                    <>
                                        <IconButton edge="start" color="black" onClick={handleMenuOpen}>
                                            <MenuIcon />
                                        </IconButton>
                                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                            {menuOptions.map((option, index) => (
                                                <MenuItem key={index} onClick={option.onClick}>
                                                    {option.icon}
                                                    <span style={{ marginLeft: "8px" }}>{option.label}</span>
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {menuOptions.map((option, index) => (
                                            <Button key={index} onClick={option.onClick} sx={{ color: "black" }}>
                                                {option.icon}
                                                <span style={{ marginLeft: "8px" }}>{option.label}</span>
                                            </Button>
                                        ))}
                                    </Box>
                                )}
                                <Box sx={{ flexGrow: 1 }} />
                            </Toolbar>
                        </Container>
                    </AppBar>

                    {excelDataFromSession && (
                        <>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                    {Object.keys(excelDataFromSession).map((sheet, index) => (
                                        <Tab key={index} label={sheet} />
                                    ))}
                                </Tabs>
                            </Box>

                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell key={column.accessor} sx={{ fontWeight: "bold", textAlign: "center" }}>
                                                    {column.Header}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {row.map((cell, cellIndex) => {
                                                    const original = JSON.parse(sessionStorage.getItem("excelData"));
                                                    const originalRow = original[activeSheet]?.[rowIndex + 1];
                                                    const originalCell = originalRow ? originalRow[cellIndex] : null;                                                    const isCommaSeparated = typeof originalCell === 'string' && originalCell.includes(';');
                                                    const options = isCommaSeparated ? originalCell.split(';') : [];

                                                    return (
                                                        <TableCell key={cellIndex}>
                                                            {isCommaSeparated ? (
                                                                <Select
                                                                    value={cell}
                                                                    onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value, activeSheet)}
                                                                    size="small"
                                                                    sx={{ width: '100%' }}
                                                                >
                                                                    {options.map((option, index) => (
                                                                        <MenuItem key={index} value={option.trim()}>
                                                                            {option.trim()}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            ) : (
                                                                <div
                                                                    contentEditable={cellIndex !== 0}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        if (cellIndex !== 0) {
                                                                            const value = e.target.innerText;
                                                                            handleCellEdit(rowIndex, cellIndex, value, activeSheet);
                                                                        }
                                                                    }}
                                                                >
                                                                    {cell}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Modal>

            <MapaModal open={openMapaModal} cerrarModal={handleCloseMapaModal} />
            <ToastContainer />
        </>
    );
};

export default ExcelUploaderStorage;
