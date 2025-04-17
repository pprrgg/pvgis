// src/components/MiModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const MiModal = ({ openx, cerrarModalx, handleRecalculate }) => {
    return (
        <Modal
            open={openx}
            onClose={cerrarModalx}
            aria-labelledby="modal-titulo"
            aria-describedby="modal-descripcion"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    width: 400,
                    maxWidth: '90%',
                    outline: 'none'
                }}
            >
                <Typography id="modal-titulo" variant="h6" component="h2" gutterBottom>
                    Contenido del Modal
                </Typography>
                <Typography id="modal-descripcion" variant="body1" sx={{ mb: 2 }}>
                    Este es un modal usando React MUI.
                </Typography>
                <Button onClick={cerrarModalx} variant="contained" color="primary">
                    Cerrar
                </Button>
            </Box>
        </Modal>
    );
};

export default MiModal;

