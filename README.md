# UPMYS Generador de Formatos

Una aplicación web para generar documentos en formato Word a partir de formularios, diseñada para los trámites de estadía profesional y servicio social de la universidad.

## Descripción

**UPMYS Generador de Formatos** permite completar formularios en línea y exportarlos como documentos Word (.docx) listos para revisar, imprimir y firmar. La aplicación simplifica el proceso de generación de documentos administrativos para trámites universitarios.

> Este repositorio contiene una herramienta de generación de documentos. No es un sistema oficial de recepción, validación o almacenamiento de trámites.

## Características Principales

- **Formularios Multi-paso**: Interfaz paso a paso con indicador de progreso (stepper)
- **Exportación a Word**: Generación directa de documentos .doc con formato oficial
- **Memoria de Formularios**: Guardado automático de datos en localStorage para continuar después
- **Sugerencias Inteligentes**: Autocompletado basado en entradas anteriores
- **Diseño Responsivo**: Funciona en dispositivos móviles y de escritorio
- **Vista Previa**: Opción de previsualizar el documento antes de exportar

## Formularios Disponibles

### Estadía Profesional

| Formato | Descripción | Tipo |
|---------|-------------|------|
| **F-01 Solicitud** | Solicitud de estadía y aceptación del organismo receptor | Local |
| **F-02 Aceptación** | Carta de aceptación institucional | Local |
| **F-03 Plan de Trabajo** | Programación de actividades y cronograma | Local |
| **F-04 Evaluación PE** | Evaluación del proceso de estadía | [Enlace externo](https://forms-upmys.pages.dev/form?id=evaluacion-pe) |
| **F-05 Evaluación OR** | Evaluación del organismo receptor | [Enlace externo](https://forms-upmys.pages.dev/form?id=evaluacion-or) |
| **F-06 Terminación** | Carta de terminación y liberación | Local |

### Servicio Social

- Módulo en preparación (próximamente)

## Tecnologías Utilizadas

- **Framework**: [SvelteKit](https://kit.svelte.dev/) v2
- **Estilo**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Iconos**: [Lucide Svelte](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Lenguaje**: JavaScript (Svelte 5 con runes)
- **Deploy**: [Cloudflare Pages](https://pages.cloudflare.com/)

## Estructura del Proyecto

```
upmys-generador-formatos/
├── src/
│   ├── lib/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── DashboardCard.svelte
│   │   │   ├── Footer.svelte
│   │   │   ├── FormInput.svelte
│   │   │   ├── FormNav.svelte
│   │   │   ├── Header.svelte
│   │   │   ├── PreviewPanel.svelte
│   │   │   ├── RadioGroup.svelte
│   │   │   ├── SelectField.svelte
│   │   │   └── Stepper.svelte
│   │   ├── data/             # Datos estáticos
│   │   │   ├── carreras.js   # Lista de carreras
│   │   │   └── forms.js      # Definición de formularios
│   │   └── utils/            # Utilidades
│   │       ├── exportWord.js # Exportación a Word
│   │       ├── formatters.js # Formateo de datos
│   │       └── formMemory.js # Gestión de memoria
│   └── routes/               # Páginas
│       ├── +layout.svelte    # Layout principal
│       ├── +page.svelte      # Página de inicio
│       ├── estadia/          # Formularios de estadía
│       │   ├── aceptacion/
│       │   ├── plan-trabajo/
│       │   ├── solicitud/
│       │   └── terminacion/
│       └── servicio-social/
├── static/                   # Archivos estáticos
├── package.json
├── svelte.config.js
├── vite.config.js
└── wrangler.toml            # Configuración Cloudflare
```

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/) v11.10.0 (gestor de paquetes)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/AngelCLA/upmys-generador-formatos.git
cd upmys-generador-formatos
```

2. Instalar dependencias (requiere pnpm):
```bash
pnpm install
```

3. Iniciar servidor de desarrollo:
```bash
pnpm dev
```

4. Abrir en el navegador:
```
http://localhost:5173
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar servidor de desarrollo |
| `pnpm build` | Construir para producción |
| `pnpm preview` | Previsualizar build de producción |
| `pnpm check` | Verificar tipos con svelte-check |

## Despliegue en Cloudflare Pages

El proyecto utiliza `@sveltejs/adapter-static` y genera el sitio estático en `build/`.

### Configuración del proyecto

En Cloudflare Pages, configura:

| Opción | Valor |
|--------|-------|
| Framework preset | `None` o `SvelteKit` |
| Build command | `pnpm build` |
| Build output directory | `build` |
| Variable `NODE_VERSION` | `20` o superior |

El archivo `wrangler.toml` ya define `build` como directorio de salida para despliegues con Wrangler.

### Despliegue desde la línea de comandos

1. Autentícate con Cloudflare:
   ```bash
   pnpm exec wrangler login
   ```
2. Genera el sitio:
   ```bash
   pnpm build
   ```
3. Publica el directorio generado:
   ```bash
   pnpm exec wrangler pages deploy build --project-name upmys-generador-formatos
   ```

No guardes tokens de Cloudflare ni credenciales en el repositorio. Usa la configuración de secretos de Cloudflare o variables de entorno locales.

## Funcionalidades Técnicas

### Privacidad

- Los datos introducidos en los formularios se guardan únicamente en el `localStorage` del navegador para ofrecer memoria y sugerencias.
- La aplicación no incluye un backend ni envía esos datos a un servidor.
- No introduzcas información sensible en equipos compartidos y borra los datos locales cuando termines.

### Exportación a Word

El módulo `exportWord.js` genera documentos Word (.docx) mediante la librería `docx`:

- Configuración de márgenes personalizables
- Fuentes y tamaños estándar (Arial, 12pt)
- Manejo de saltos de página
- Compatible con Microsoft Word y LibreOffice

### Memoria de Formularios

- Guardado automático en `localStorage`
- Persistencia entre sesiones
- Sistema de sugerencias por campo (últimos 10 valores)

### Componentes UI

- **Stepper**: Indicador visual de progreso en formularios multi-paso
- **FormInput**: Campo de entrada con soporte de memoria
- **SelectField**: Selector desplegable con opciones agrupadas
- **RadioGroup**: Grupo de opciones radio
- **FormNav**: Navegación entre pasos (anterior/siguiente)

## Contribuir

Consulta [`CONTRIBUTING.md`](CONTRIBUTING.md) para conocer el flujo de trabajo y los requisitos de Pull Requests.

## Autoría

Este proyecto fue desarrollado por **CLAAngel** mientras trabajaba en el Departamento de Sistemas Informáticos de la Universidad Politécnica del Mar y la Sierra.

La referencia laboral describe el contexto en el que se desarrolló el proyecto y no implica por sí sola una aprobación, patrocinio o cesión de derechos por parte de la universidad.

## Licencia

El código de este proyecto se distribuye bajo la [Apache License 2.0](LICENSE). Los logotipos, marcas, formatos oficiales y demás contenidos institucionales pueden estar sujetos a derechos independientes; esta licencia no concede autorización para utilizarlos fuera del contexto permitido por sus titulares.

Consulta `SECURITY.md` para reportar vulnerabilidades sin hacerlas públicas.

---

**Desarrollado para la Universidad Politécnica del Mar y la Sierra (UPMYS)**
