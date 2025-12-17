import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';

const users = new UserRepository();

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await users.findByEmail(email);
    if (existing) {
      throw new Error('USER_EXISTS');
    }
    const hashed = await hashPassword(password);
    const user = await users.create({ name, email, password: hashed });
    return user;
  }

  async login(email: string, password: string) {
    const user = await users.findByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error('INVALID_CREDENTIALS');
    return user;
  }
}
