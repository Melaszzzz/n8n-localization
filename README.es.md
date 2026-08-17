# Localización de n8n — Paquete de idioma en chino y español

Documentación: [English](README.md) | [简体中文](README.zh-CN.md) | Español

Localización de la interfaz para instalaciones autohospedadas de n8n. Incluye chino simplificado (`zh-CN`), chino tradicional (`zh-TW`) y español (`es`). Este proyecto proporciona traducciones y un instalador reversible; no incluye, instala ni redistribuye n8n.

## Paquetes de idioma disponibles

| Código | Idioma | Estado | Versión base completa |
| --- | --- | --- | --- |
| `zh-CN` | Chino simplificado | Completo | n8n 2.34.6 |
| `zh-TW` | Chino tradicional (Taiwán) | Vista previa | n8n 2.34.6 |
| `es` | Español | Vista previa | n8n 2.34.6 |

Los idiomas en vista previa tienen cobertura automatizada completa de las claves y superan las pruebas del instalador, pero aún necesitan una revisión de la interfaz real por parte de hablantes competentes. Los idiomas previstos y sus criterios de publicación se detallan en la [hoja de ruta de localización](ROADMAP.md).

## Características

- Se instala sobre una instalación existente de n8n sin reemplazar toda la compilación del editor.
- Todos los cambios se controlan mediante manifiestos y se pueden desinstalar de forma segura.
- La interfaz principal y los parámetros de los nodos se traducen mediante mecanismos separados y compatibles.
- Solo se traduce el texto de origen que coincide exactamente. El texto desconocido o modificado permanece en inglés.
- No modifica flujos de trabajo, credenciales, bases de datos, datos de API, entradas del usuario, código ni expresiones.
- Se prueba en macOS, Windows y Linux.

## Compatibilidad

- n8n autohospedado, instalado de forma local o global mediante npm.
- macOS, Windows y Linux.
- Docker, siempre que el instalador se ejecute durante la construcción de la imagen.
- Se admiten otras versiones de n8n; las cadenas que no coincidan permanecen en inglés.
- n8n Cloud no es compatible porque no permite modificar los archivos del editor.

## Instalación

Requisitos: una instalación de n8n que ya funcione y Node.js 18 o posterior.

Consultar los idiomas disponibles:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --list-locales
```

Instalar español:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale es
```

Use `--locale zh-CN` para chino simplificado o `--locale zh-TW` para chino tradicional (Taiwán). El instalador muestra un aviso antes de instalar un idioma en vista previa.

Si n8n no se encuentra automáticamente, especifique el proyecto, el directorio `node_modules` o el directorio del paquete:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale es --target /ruta/al/proyecto/n8n
```

Windows PowerShell:

```powershell
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale es --target "C:\ruta\al\proyecto\n8n"
```

Después de la instalación, reinicie el servicio de n8n y vuelva a cargar el editor sin usar la caché del navegador.

Si este paquete le resulta útil, marque el repositorio con una estrella para encontrarlo de nuevo y seguir las futuras actualizaciones.

## Desinstalación

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale es --uninstall
```

El desinstalador solo restaura los archivos administrados por este proyecto. Los archivos modificados después de la instalación se notifican como conflictos y se conservan. Desinstale el idioma activo antes de cambiar a otro.

## Criterios de traducción

- Se prioriza el mecanismo nativo de traducción de nodos de n8n; el texto faltante de la interfaz principal se completa mediante una capa de traducción restringida.
- Los términos técnicos consolidados, como AI, API, HTTP, JSON, MCP y Webhook, se mantienen en inglés.
- Los términos ambiguos o relacionados con la seguridad se muestran en ambos idiomas cuando mejora la precisión.
- No se traducen código, expresiones, datos del usuario, valores de campos, errores sin procesar, nombres de flujos de trabajo, nombres de credenciales ni secretos.
- No se utilizan coincidencias aproximadas ni reemplazos parciales.

## Para asistentes de AI

Use estos comandos solo cuando el usuario ya tenga una instalación autohospedada de n8n. Consulte [AI_INSTALL.md](AI_INSTALL.md) para identificar la ruta de destino, instalar en Docker, revisar los límites de seguridad y resolver errores. La lista de idiomas en formato legible por máquinas se encuentra en [locales.json](locales.json).

## Desarrollo

```bash
npm test
npm pack --dry-run
```

GitHub Actions valida los diccionarios, los instaladores y el contenido del paquete en macOS, Windows y Linux. El origen de las traducciones se documenta en [localization/PROVENANCE.md](localization/PROVENANCE.md).

## Licencia

Las versiones publicadas desde `v0.4.0` tienen el código fuente disponible bajo la [licencia PolyForm Strict 1.0.0](LICENSE). Se permite el uso no comercial sin modificaciones; el uso comercial, la modificación, las obras derivadas y la redistribución requieren autorización previa por escrito. Consulte [LICENSING.md](LICENSING.md).

n8n no está incluido y sigue sujeto a la [licencia oficial de n8n](https://github.com/n8n-io/n8n/blob/master/LICENSE.md). Consulte [NOTICE](NOTICE) para obtener más información.
