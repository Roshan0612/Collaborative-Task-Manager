import prisma from '../config/database';

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
  create(data: { name: string; email: string; password: string }) {
    return prisma.user.create({ data });
  }
  updateProfile(id: string, data: { name?: string }) {
    return prisma.user.update({ where: { id }, data });
  }
  findAll() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true } });
  }
}
