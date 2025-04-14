#!/usr/bin/env python3

import shutil
import os
import subprocess

SCRIPTS_TO_RUN = [
    "p22_Catalogo_de_los_jsx_de_doc________.py",
]
# Ejecutar scripts

os.chdir(os.path.dirname(os.path.abspath(__file__)))

for script in SCRIPTS_TO_RUN:
    if os.path.isfile(f"./{script}"):
        subprocess.run(["python3", f"./{script}"])
        print('='*222+f"\n\nEjecutado: {script}")
    else:
        print(f"No se encontró el script: {script}")



