# 🏨 Sistema de Gestión Hotelera

Sistema interno de gestión hotelera empresarial construido con **Next.js 16**, **Prisma ORM** y **MySQL**.

## Módulos

- **Admin** → Gestión de usuarios y habitaciones
- **Recepción** → Check-in, Check-out, Huéspedes, Reservas
- **Limpieza** → Estado físico de habitaciones por piso

## Tecnologías

- Next.js 16 (App Router)
- Prisma + MySQL
- JWT (jose) + bcrypt
- TypeScript + CSS puro

## Usuarios de prueba (tras ejecutar setup)

| Rol            | Email                  | Contraseña    |
|----------------|------------------------|---------------|
| Admin          | admin@hotel.com        | admin123      |
| Recepcionista  | recepcion@hotel.com    | recepcion123  |
| Empleada       | empleada@hotel.com     | empleada123   |

## Iniciar en desarrollo

```bash
npm run dev
# → http://localhost:3000
```
