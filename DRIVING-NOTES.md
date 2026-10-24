# EngineSim v0.7.0

## Retención y cambios
Al soltar el acelerador conserva la marcha (salvo protección por exceso de régimen). Reducciones secuenciales con 0,9 s entre cambios, a 33–43 % del régimen máximo según freno. A fondo conserva el kickdown. Memoria de carga e histéresis para evitar oscilaciones. Rev matching y ráfagas de escape acotadas. Perfiles y generador de sonido de v0.6.1 conservados; cambia su respuesta a las reducciones y la intensidad de los transitorios.

Referencia: controlador oficial de BeamNG (memoria de agresividad al levantar, suavizado e histéresis) y su DCT (rev matching). Adaptación propia a la preferencia del usuario, sin copiar código de BeamNG.
https://docs.beamng.com/modding/vehicle/vehicle_system/controller/main/vehiclecontroller/
https://docs.beamng.com/modding/vehicle/vehicle_system/controller/main/vehiclecontroller/shiftlogic-dctgearbox/

## GPS
Seleccionar GPS cancela Demo y solicita ubicación independientemente del audio. Una sola suscripción; reintentos invalidan callbacks antiguos. Ayuda específica para permiso denegado, proveedor no disponible y espera. Velocidad directa o estimación por desplazamiento con control de precisión cuando falta; también cuando dos lecturas confirman movimiento pese a velocidad cero. Descarta muestras antiguas/desordenadas. Frescura ampliada de 4,5 a 12 s; sin datos válidos muestra — y no genera nuevas reducciones. Recupera suscripción al volver a la pestaña si ha caducado. Coordenadas solo en memoria local, sin cambios en estadísticas.

## Pruebas
`node test-driving.cjs`: mantener tercera durante 20 s, reducciones secuenciales, límites de régimen, crucero sin oscilaciones, ráfagas acotadas, Demo→GPS, velocidad directa/estimada, lecturas espaciadas/caducadas, permisos, reintentos y callbacks desordenados.
`node test-audio.mjs`: arranque completo, respaldo, adaptador físico de tres motores, blip, silencio al parar y parámetros finitos.
GPS probado con datos simulados; pendiente validación del hardware y permisos del usuario.

## Restauración
La v0.6.1 permanece en su etiqueta. Restauración desde GitHub; sin selector público.
