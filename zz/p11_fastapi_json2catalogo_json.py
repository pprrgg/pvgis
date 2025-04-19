import json
import os
import re
import shutil

# Mover al directorio actual del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Ruta del archivo original
origen = '/home/pk/Desktop/backend/zz/fastapi.json'

# Copiar a la carpeta actual (.)
destino = './fastapi.json'

# Copiar el archivo
shutil.copy(origen, destino)

# Ruta del directorio a borrar y recrear
docs_dir = "../src/components/"


# Cargar resultado.json
with open('fastapi.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

catalogo = []

for path, contenido in datos.items():
    partes = path.split('/')
    if len(partes) < 3:
        continue

    grupo = partes[0]
    sector = partes[1]
    archivo = os.path.splitext(partes[2])[0]  # sin .py

    # Extraer el código inicial (ej: CER1739, AIF030, etc.)
    match = re.match(r'^([A-Za-z]+[0-9]+)(.+)$', archivo)
    if match:
        codigo_base, nombre_restante = match.groups()
        nombre_legible = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', nombre_restante)
        codigo_legible = f"{codigo_base.upper()} {nombre_legible}".upper()
        co = codigo_base.upper()
    else:
        codigo_legible = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', archivo).upper()
        co = archivo.upper()

    catalogo.append({
        "categoria": "libre",
        "codigo": codigo_legible,
        "sector": sector,
        "grupo": grupo,
        "cod": archivo,
        "co": co
    })

# Guardar como catalogo.json
with open(os.path.join(docs_dir, "Catalogo.json"), 'w', encoding='utf-8') as f:
    json.dump(catalogo, f, ensure_ascii=False, indent=4)

print("Archivo Catalogo.json generado correctamente.")
