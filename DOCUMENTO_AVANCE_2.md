# S2-Tarea 2.1: Avance de Proyecto 2

## Portada

**Asignatura:** Tecnologías Emergentes  
**Tema:** Avance de Proyecto 2  
**Nombre del proyecto:** Sistema de Gestión de Clubes y Organizaciones Estudiantiles  
**Estudiantes:** Genesis Jusselphy Medina Anariba - 62251243, Johan Josue Peraza Avilez - 62211083, Miguel Angel Carranza Avilez - 62211533  
**Sede:** Sede Central  
**Docente:** Gerson Josue Velasquez Guzman  
**Sección:** 862 Tecnologías Emergentes  
**Fecha de entrega:** 5 de mayo de 2026

## Introducción

El presente documento corresponde al segundo avance del proyecto Sistema de Gestión de Clubes y Organizaciones Estudiantiles. En esta etapa se desarrolló el esqueleto funcional de la aplicación web utilizando Angular, con el objetivo de contar con una estructura inicial organizada y preparada para continuar el desarrollo durante el resto del curso.

Este avance incluye la creación de componentes principales, configuración de rutas, navegación entre páginas y una maqueta visual básica. Además, el proyecto está preparado para ser subido a GitHub y desplegado en Firebase Hosting.

## Enlace al repositorio de GitHub

Pegar aquí el enlace del repositorio:

```text
https://github.com/usuario/sistema-clubes-estudiantiles
```

## Enlace a Firebase Hosting

Pegar aquí la URL pública generada por Firebase:

```text
https://nombre-del-proyecto.web.app
```

## Componentes base

Se crearon los siguientes componentes en Angular:

- Inicio
- Login
- Registro
- Clubes
- Detalle de Club
- Panel de Usuario
- Navbar

Cada componente representa una sección principal del sistema y está registrado correctamente dentro del archivo de rutas.

## Configuración de rutas

Las rutas principales configuradas son:

- `/` para la página de Inicio.
- `/login` para la página de Login.
- `/registro` para la página de Registro.
- `/clubes` para el directorio de clubes.
- `/clubes/:id` para el detalle de cada club.
- `/panel-usuario` para el panel del usuario.

## Navegación

La navegación entre páginas se implementó mediante una barra de navegación principal. Esta barra permite acceder a Inicio, Clubes, Panel de Usuario, Login y Registro.

## Evidencias para capturas

### Evidencia 1: Estructura de carpetas y componentes

Pegar captura de Visual Studio Code mostrando la carpeta `src/app/components`.

### Evidencia 2: Archivo de rutas

Pegar captura del archivo `src/app/app.routes.ts`.

### Evidencia 3: Navegación funcionando

Pegar capturas de las páginas Inicio, Clubes, Login, Registro y Panel de Usuario.

### Evidencia 4: Repositorio de GitHub

Pegar captura del repositorio con los archivos del proyecto subidos.

### Evidencia 5: Firebase Hosting

Pegar captura de la aplicación desplegada y accesible mediante la URL pública.

## Conclusión

En este segundo avance se logró crear la base funcional del proyecto Sistema de Gestión de Clubes y Organizaciones Estudiantiles. La aplicación cuenta con una estructura inicial en Angular, componentes principales, rutas configuradas y navegación entre las diferentes secciones.

Aunque el sistema aún se encuentra en una etapa inicial, este avance permite establecer una base sólida para continuar desarrollando funcionalidades más completas en futuros avances, como autenticación, gestión de clubes, administración de miembros, eventos y solicitudes de ingreso.
