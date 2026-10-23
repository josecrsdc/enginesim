# Audio y conducción — v0.5.0

Los motores de combustión usan fragmentos de grabaciones CC0 con tres capas por motor. El banco `engine-bank-v1.json` se aloja junto a la aplicación: no depende de peticiones a Freesound durante la conducción. Las capas se mezclan con ganancias de igual potencia y altura ajustada a las RPM simuladas. El volumen responde a la carga y hay un corte breve al cambiar de marcha.

| Perfil | Grabación | Autor | Licencia |
|---|---|---|---|
| V8 | [v8 engine rev.wav](https://freesound.org/people/overmedium/sounds/651534/) | overmedium | CC0 1.0 |
| V12 | [Auston Martin Rapide Start Engine, Engine Revs & Stut Off.wav](https://freesound.org/people/Paul368/sounds/320096/) | Paul368 | CC0 1.0 |
| Bóxer 6 | [porsche_911.wav](https://freesound.org/people/mharo/sounds/55727/) | mharo | CC0 1.0 |
| Petardeo | [BACKFIRE.ogg](https://freesound.org/people/CeebFrack/sounds/105351/) | CeebFrack | CC0 1.0 |

Se utilizaron las versiones MP3 de alta calidad publicadas por Freesound. Edición: conversión a mono, recorte, filtro de graves subsónicos, normalización moderada, bucles con fundido y ajuste de altura. El petardeo es un efecto diseñado por su autor, no se presenta como una grabación de campo. Las anclas de RPM son una calibración perceptiva de juego, no mediciones del régimen original. No son bancos profesionales multicarga ni réplicas exactas de un modelo. El eléctrico conserva su diseño electrónico. No se ha extraído audio ni código de TeslaSound.

Licencia de los fragmentos de audio: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Cada entrada del banco conserva autor y fuente. La licencia del audio no cambia por sí sola la licencia del resto del proyecto.

## Cambios de conducción

- Pedal progresivo por posición vertical con captura de puntero y liberación al cancelar. Teclado: arriba/W a fondo; Mayús + arriba/W a un 28 %. Espacio/Intro en un pedal también lo acciona.
- Umbral de subida variable con la demanda, kickdown limitado por las RPM de la marcha destino y tiempo mínimo entre cambios.
- Corte de carga al subir y un breve golpe de gas al reducir. El eléctrico mantiene una sola relación.
- Aceleración GPS calculada a partir de muestras con su marca de tiempo, antes de suavizar la velocidad visual. Una muestra con más de 4,5 segundos deja de considerarse actual.
- Petardeo corto en retención tras levantar gas y en cambios con carga; no crepitar continuo al azar.

## Validación

Pruebas de la caja con la misma rampa de velocidad V8: con demanda 25 %, primera subida a 31,1 km/h y segunda a 53,65; a fondo, primera a 51,75 y segunda a 89,35. Reducción de 5ª a 2ª a 65 km/h sin superar el límite. Cero cambios de ida y vuelta en 30 segundos a 80 ± 0,6 km/h. Escenarios GPS de crucero, aceleración fuerte y señal caducada. Sintaxis de los tres scripts y decodificación de los nueve bucles verificadas.

La calidad percibida necesita una escucha en el equipo del coche; estas pruebas no sustituyen esa valoración. El modo GPS estima la demanda a partir de velocidad, no lee el pedal ni la transmisión reales del vehículo.

## Restaurar

La etiqueta v0.4.1 conserva la entrega anterior. Se restaura con un commit en main desde GitHub. No hay selector público de versiones. Las estadísticas automáticas y sus permisos privados permanecen en esta entrega.
