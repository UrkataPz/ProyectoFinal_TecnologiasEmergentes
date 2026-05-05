# Sistema de Gestión de Clubes y Organizaciones Estudiantiles

Proyecto académico para la asignatura **862 - Tecnologías Emergentes**.

## Descripción

Este proyecto corresponde al **S2-Tarea 2.1: Avance de Proyecto 2**. Consiste en el esqueleto funcional de una aplicación web desarrollada en Angular para gestionar clubes y organizaciones estudiantiles.

La aplicación incluye páginas base, componentes, rutas y navegación funcional entre secciones principales.

## Integrantes

- Genesis Jusselphy Medina Anariba - 62251243
- Johan Josue Peraza Avilez - 62211083
- Miguel Angel Carranza Avilez - 62211533

## Componentes creados

- Inicio
- Login
- Registro
- Clubes
- Detalle de Club
- Panel de Usuario
- Navbar

## Rutas configuradas

| Ruta | Componente |
|---|---|
| `/` | InicioComponent |
| `/login` | LoginComponent |
| `/registro` | RegistroComponent |
| `/clubes` | ClubesComponent |
| `/clubes/:id` | DetalleClubComponent |
| `/panel-usuario` | PanelUsuarioComponent |

## Requisitos

- Node.js instalado
- Angular CLI instalado
- Cuenta de GitHub
- Cuenta de Firebase

## Instalación

```bash
npm install
```

## Ejecutar localmente

```bash
npm start
```

Luego abrir:

```text
http://localhost:4200
```

## Compilar el proyecto

```bash
npm run build
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Avance 2 - estructura base del proyecto Angular"
git branch -M main
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

## Desplegar en Firebase Hosting

1. Crear un proyecto en Firebase Console.
2. Instalar Firebase CLI:

```bash
npm install -g firebase-tools
```

3. Iniciar sesión:

```bash
firebase login
```

4. Inicializar Hosting:

```bash
firebase init hosting
```

Configuración recomendada:

- Public directory: `dist/sistema-clubes-estudiantiles/browser`
- Configure as single-page app: `Yes`
- Set up automatic builds and deploys with GitHub: opcional

5. Compilar y desplegar:

```bash
npm run build
firebase deploy
```

## Evidencias sugeridas para el PDF

- Captura del repositorio en GitHub.
- Captura de la estructura de carpetas en Visual Studio Code.
- Captura del archivo `app.routes.ts`.
- Capturas de navegación entre Inicio, Clubes, Login, Registro y Panel.
- Captura de la URL pública de Firebase Hosting.
