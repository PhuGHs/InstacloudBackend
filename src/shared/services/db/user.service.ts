import { UserModel } from '@root/features/users/models/user.schema';
import { IUserDocument } from '@user/interfaces/user.interface';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
}

export const userService: UserService = new UserService();
