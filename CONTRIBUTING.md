# Contribuir

Gracias por tu interés en mejorar UPMYS Generador de Formatos.

## Preparar el entorno

Requisitos:

- Node.js 18 o superior.
- pnpm 11.10.0 o compatible.

Instala las dependencias y arranca el servidor local:

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Flujo de trabajo

1. Crea una rama descriptiva desde `main`:
   ```bash
   git checkout -b feature/nombre-del-cambio
   ```
2. Mantén los cambios enfocados y respeta los patrones existentes de SvelteKit.
3. Ejecuta las validaciones antes de abrir el Pull Request:
   ```bash
   pnpm check
   pnpm build
   ```
4. Describe en el Pull Request qué cambió, por qué se necesita y cómo se verificó.

## Formularios y datos

- No incluyas datos personales reales, documentos reales ni credenciales en el código, capturas o commits.
- Usa valores de ejemplo claramente ficticios.
- Recuerda que los datos de los formularios se guardan en `localStorage` del navegador.
- No añadas un servicio externo para procesar datos sin documentar expresamente su finalidad y tratamiento.

## Commits

Usa mensajes breves y descriptivos, por ejemplo:

```text
Agregar validación al formulario F-03
Corregir exportación de fechas a DOCX
```

## Alcance de los cambios

Los logotipos, marcas y formatos institucionales pueden tener derechos independientes del código. No los sustituyas, redistribuyas o modifiques sin la autorización correspondiente.

Para reportar vulnerabilidades, consulta [`SECURITY.md`](SECURITY.md) y no abras un issue público.
