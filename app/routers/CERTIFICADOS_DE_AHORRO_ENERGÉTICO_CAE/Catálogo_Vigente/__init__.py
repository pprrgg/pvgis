from fastapi import APIRouter
router = APIRouter()
from .SecretariaDeEstadoDeEnergíaMinisterioDirecciónGeneralDePlanificaciónYParaLaTransiciónEcológicaYElRetoDemográficoCoordinaciónEnergéticaTra020SistemaDeTelemetríaYGeoposicionamientoEnFlotaDeTransporte import router as SecretariaDeEstadoDeEnergíaMinisterioDirecciónGeneralDePlanificaciónYParaLaTransiciónEcológicaYElRetoDemográficoCoordinaciónEnergéticaTra020SistemaDeTelemetríaYGeoposicionamientoEnFlotaDeTransporte_router
router.include_router(SecretariaDeEstadoDeEnergíaMinisterioDirecciónGeneralDePlanificaciónYParaLaTransiciónEcológicaYElRetoDemográficoCoordinaciónEnergéticaTra020SistemaDeTelemetríaYGeoposicionamientoEnFlotaDeTransporte_router, prefix='/SecretariaDeEstadoDeEnergíaMinisterioDirecciónGeneralDePlanificaciónYParaLaTransiciónEcológicaYElRetoDemográficoCoordinaciónEnergéticaTra020SistemaDeTelemetríaYGeoposicionamientoEnFlotaDeTransporte', tags=['root - CERTIFICADOS_DE_AHORRO_ENERGÉTICO_CAE - Catálogo_Vigente'])
from .AnexoideLasFichasAnexoIDeclaraciónResponsableFormalizadaPorEl import router as AnexoideLasFichasAnexoIDeclaraciónResponsableFormalizadaPorEl_router
router.include_router(AnexoideLasFichasAnexoIDeclaraciónResponsableFormalizadaPorEl_router, prefix='/AnexoideLasFichasAnexoIDeclaraciónResponsableFormalizadaPorEl', tags=['root - CERTIFICADOS_DE_AHORRO_ENERGÉTICO_CAE - Catálogo_Vigente'])
