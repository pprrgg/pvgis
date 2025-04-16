#!/usr/bin/env python3

import shutil
import os
import subprocess

SCRIPTS_TO_RUN = [
    "p11_fastapi_json2catalogo_json.py",
    # "p21_catalogo_json2ArchivosJsx.py",
    "p21_catalogo_json2ArchivosXlsx.py",
    # "p23_catalogo_json2componentsMap_jsx.py",

]
# Ejecutar scripts

os.chdir(os.path.dirname(os.path.abspath(__file__)))

for script in SCRIPTS_TO_RUN:
    if os.path.isfile(f"./{script}"):
        subprocess.run(["python3", f"./{script}"])
        print('='*222+f"\n\nEjecutado: {script}")
    else:
        print(f"No se encontró el script: {script}")



