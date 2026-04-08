

# Plan: Profesionalizar identidad visual de 98 Fitness Club

## Cambios necesarios

### 1. Copiar logo a `public/` para favicon y OG image
El logo está en `src/assets/logo.jpg` (solo accesible en build). Necesitamos copiarlo a `public/` para que esté disponible como favicon y como imagen OG con URL absoluta.

- Copiar `src/assets/logo.jpg` → `public/logo.jpg`
- Eliminar `public/favicon.ico` si existe

### 2. Actualizar `index.html`
- **Title**: `98 Fitness Club | Transforma tu cuerpo`
- **Meta description**: Descripción del gimnasio
- **OG title**: `98 Fitness Club - Entrenamiento de Élite`
- **OG description**: `Gimnasio especializado en entrenamiento de fuerza y resistencia basado en evidencia. ¡Únete a nuestra comunidad y alcanza tus metas!`
- **OG image**: `https://fitnessclub98.lovable.app/logo.jpg` (URL absoluta del logo)
- **Twitter tags**: Actualizar con los mismos datos, quitar `@Lovable`
- **Favicon**: `<link rel="icon" href="/logo.jpg" type="image/jpeg">`
- Cambiar `lang="en"` → `lang="es"` para coherencia con el contenido en español

### Archivos a modificar
- `index.html` — metatags, título, favicon, idioma

