# Guia de Ejecucion - MechNow

## Descripcion

MechNow es una aplicacion web mobile-first para reservar servicios de
mecanica movil. Incluye:

- Landing publica.
- Flujo de reserva en `/booking`.
- Login administrativo en `/admin/login`.
- Dashboard protegido en `/admin/dashboard`.

## Requisitos

- Node.js 20 o superior.
- pnpm instalado.
- Proyecto Supabase para probar persistencia y panel administrativo.

Comprobar versiones:

```bash
node --version
pnpm --version
```

## 1. Instalar dependencias

Desde la carpeta raiz del proyecto:

```bash
pnpm install
```

## 2. Configurar variables de entorno

Crear un archivo `.env.local` en la raiz del proyecto tomando como base
`.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ADMIN_PHONE_NUMBER=

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

SESSION_SECRET=
```

Variables necesarias para probar reservas reales y administracion:

```env
NEXT_PUBLIC_SUPABASE_URL=URL_DEL_PROYECTO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=CLAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=CLAVE_SERVICE_ROLE
SESSION_SECRET=CLAVE_ALEATORIA_LARGA
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` y `SESSION_SECRET` son secretos de servidor. No deben compartirse publicamente ni subirse a Git.
- Twilio es opcional. Sin esas variables no se envian SMS, pero la reserva puede guardarse.
- Google Maps es opcional. Sin esa clave, la direccion se confirma mediante texto.

Para generar `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Preparar Supabase

1. Crear un proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar el archivo:

```text
scripts/004-full-setup.sql
```

Este script crea:

- `appointments`
- `admin_users`
- `zip_code_waitlist`
- `reviews`
- `technicians`
- `service_zip_codes`

Tambien agrega ZIPs iniciales de Sacramento y proteccion contra dobles reservas
en el mismo horario.

## 4. Crear usuario administrador

Generar un hash bcrypt para la contrasena del administrador. Una forma simple:

```bash
node -e "require('bcryptjs').hash('TU_PASSWORD', 12).then(console.log)"
```

Luego ejecutar en Supabase SQL Editor:

```sql
insert into admin_users (email, password_hash)
values ('admin@example.com', 'HASH_BCRYPT_GENERADO');
```

Usar ese correo y contrasena para entrar en `/admin/login`.

## 5. Ejecutar la app

```bash
pnpm dev
```

Abrir en el navegador:

- Inicio: http://localhost:3000
- Reserva: http://localhost:3000/booking
- Login admin: http://localhost:3000/admin/login

Si se ejecuta el proyecto desde WSL y `node` no aparece en el shell, usar:

```bash
cmd.exe /c pnpm dev
```

## 6. Probar en vista movil

La app es una web mobile-first.

En Chrome o Edge:

1. Abrir `http://localhost:3000`.
2. Presionar `F12`.
3. Activar modo dispositivo con `Ctrl + Shift + M`.
4. Elegir un dispositivo o configurar ancho de `375px`.
5. Recorrer el flujo en `/booking`.

## 7. Flujo de prueba recomendado

### Cliente

1. Abrir `/booking`.
2. Ingresar un ZIP con cobertura, por ejemplo `95814`.
3. Completar vehiculo manualmente o probar VIN.
4. Seleccionar uno o varios servicios.
5. Registrar y confirmar direccion.
6. Completar datos personales.
7. Elegir fecha futura y horario.
8. Confirmar reserva.

### Administrador

1. Abrir `/admin/login`.
2. Iniciar sesion con el admin creado en Supabase.
3. Revisar la cita creada.
4. Cambiar su estado.
5. Crear un tecnico y asignarlo a la cita.
6. Administrar ZIPs y moderar resenas.

## 8. Verificar el proyecto

Antes de entregar cambios:

```bash
pnpm lint
pnpm test
pnpm build
```

En WSL, si hace falta usar Node de Windows:

```bash
cmd.exe /c pnpm lint
cmd.exe /c pnpm test
cmd.exe /c pnpm build
```

## Solucion de problemas

### La reserva dice que el servicio no esta disponible

Verificar que `.env.local` tenga las variables de Supabase y reiniciar `pnpm dev`.

### No se puede iniciar sesion como admin

Verificar:

- Que se ejecuto `scripts/004-full-setup.sql`.
- Que existe un registro en `admin_users`.
- Que el hash corresponde a la contrasena usada.
- Que `SESSION_SECRET` esta configurado.

### No llegan SMS

Los SMS solo funcionan si se configuraron todas las variables de Twilio y
`ADMIN_PHONE_NUMBER`. La ausencia de SMS no debe impedir guardar una cita.

### No aparece el mapa

El mapa requiere `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Sin esa variable la app
muestra la direccion en texto para confirmar ubicacion.
