import os
import shutil
from pathlib import Path

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Directorios de origen y destino
src_root = Path('/home/pk/Desktop/backend/app/routers')
dst_root = Path('../public/pdfs')

# Recorrer los archivos recursivamente
for file in src_root.rglob('*.pdf'):
    if file.is_file() and file.name.endswith('_.pdf'):
        # Obtener la ruta relativa al directorio de origen
        relative_path = file.relative_to(src_root)
        # Crear la ruta completa en el directorio destino
        dst_file = dst_root / relative_path
        # Crear directorios si no existen
        dst_file.parent.mkdir(parents=True, exist_ok=True)
        # Copiar archivo
        shutil.copy2(file, dst_file)
        print(f'Copiado: {file} -> {dst_file}')
