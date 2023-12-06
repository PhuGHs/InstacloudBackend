import { config } from '@root/config';
import { IAuthDocument, ISignUpData } from '@root/features/auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import Logger from 'bunyan';
import {faker} from '@faker-js/faker';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import axios from 'axios';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async getAuthUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: SupportiveMethods.lowercase(username) }, { email: SupportiveMethods.lowercase(email) }]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument;
    return user;
  }

  public async updateResetPasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );
  }

  public async seedPostsForUsers() {
    const batchSize = 90; // Adjust the batch size as needed
    let skip = 0;
    try {
      // Fetch all users
      while (true) {
        const users = await AuthModel.find({}).skip(skip).limit(batchSize);

        if (users.length === 0) {
          break;
        }

        for (const user of users) {
          const numPosts = faker.number.int({ min: 1, max: 2 });

          for (let i = 0; i < numPosts; i++) {
            const postData = {
              userId: user._id,
              username: user.username,
              email: user.email,
              uId: user.uId,
              profilePicture: 'a path',
              post: faker.lorem.sentence(),
              privacy: 'public',
              gifUrl: '',
            };
              await axios.post('http://localhost:5000/api/v1/post/seeds', postData);
          }
        }

        skip += batchSize;
      }
    } catch (error) {
      console.error('Error seeding posts:', error);
    }
  }
}

export const authService: AuthService = new AuthService();
