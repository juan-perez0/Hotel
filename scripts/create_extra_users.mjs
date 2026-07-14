import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordRecepcion = await bcrypt.hash('recepcion123', 10);
  const passwordEmpleada = await bcrypt.hash('empleada123', 10);

  const recepcion = await prisma.usuario.upsert({
    where: { email: 'recepcion@hotel.com' },
    update: {},
    create: {
      email: 'recepcion@hotel.com',
      nombre: 'Recepcionista Principal',
      password: passwordRecepcion,
      rol: 'RECEPCIONISTA',
    },
  });

  const empleada = await prisma.usuario.upsert({
    where: { email: 'empleada@hotel.com' },
    update: {},
    create: {
      email: 'empleada@hotel.com',
      nombre: 'Empleada Limpieza',
      password: passwordEmpleada,
      rol: 'EMPLEADA',
    },
  });

  console.log('Usuarios adicionales creados exitosamente:', { recepcion, empleada });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
