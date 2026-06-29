import { PrismaClient, UserRole } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = "mukulkms@gmail.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await argon2.hash("mks78955");

  await prisma.user.create({
    data: {
      name: "Mukul",
      email:"mukulkms@gmail.com",
      phone: "6396354017",
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });