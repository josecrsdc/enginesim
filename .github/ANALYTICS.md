# Estadísticas y valoraciones — v0.4.0

Los informes están en el proyecto independiente enginesim de Supabase. Se consultan como propietario en SQL Editor; la web no puede leerlos. No hay panel público de administración.

```sql
-- Sesiones y tiempo visible por día (Europe/Madrid) y versión
select * from public.enginesim_daily_stats order by day desc, app_version;
-- Motores usados mientras están encendidos
select * from public.enginesim_engine_stats order by engine_minutes desc;
-- Estrellas por motor y versión
select * from public.enginesim_rating_stats order by average_score desc;
```

Las estadísticas requieren activar Compartir estadísticas de uso. No representan todas las visitas. Cada carga de página genera un identificador temporal aleatorio en memoria: no cuenta personas únicas, y recargar inicia otra sesión. El servidor guarda su hash SHA-256. Solo se guarda localmente la preferencia sí/no. Se mide tiempo visible aproximado en bloques de hasta 30 segundos; cierres bruscos y fallos de conexión pueden perder el último bloque. Las coordenadas GPS no se envían.

Las valoraciones se envían solo al pulsar el botón. Se puede actualizar el voto del mismo motor dentro de la misma sesión y versión, sin duplicarlo. Recargar permite otro voto: no es una encuesta verificada por persona. Las valoraciones son independientes del consentimiento de estadísticas.

Backend: migración add_usage_statistics_and_engine_ratings y Edge Function enginesim-ingest, versión 1, en Supabase. Tablas privadas: enginesim_usage_events, enginesim_engine_ratings y enginesim_ingest_limits. RPC enginesim_ingest solo ejecutable por service_role. Todas tienen RLS y ningún permiso de lectura/escritura para anon o authenticated; ausencia de políticas públicas es intencionada. La clave service_role permanece en el entorno del servidor. La clave publicable no es un secreto ni identifica usuarios.

El endpoint público solo acepta escrituras validadas, origen de GitHub Pages y clave publicable. Tiene límite por identificador de sesión; no garantiza protección contra bots que cambien de identificador. No ofrece lecturas de datos. No registrar cuerpos ni coordenadas.

## Versiones y restauración

main siempre determina la web publicada. Las etiquetas de GitHub conservan versiones. Para restaurar, recuperar el index.html de la etiqueta elegida y crear un commit en main. Mantener _config.yml con versions/ excluido y no reintroducir un selector de versiones para visitantes. Volver al frontend v0.3.1 detiene estas nuevas escrituras sin borrar datos; el contador Realtime sigue funcionando. Las migraciones y funciones del backend tienen su historial separado en Supabase.
