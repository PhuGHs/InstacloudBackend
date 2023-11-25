import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { IFileImageDocument } from '@image/interfaces/image.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { imageService } from '@service/db/image.service';
import { postService } from '@service/db/post.service';
import { userService } from '@service/db/user.service';
import { PostCache } from '@service/redis/post.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const SIZE = 12;

export interface IGetAllUser {
  skip: number,
  limit: number,
  newSkip: number,
  userId: string,
}

const userCache: UserCache = new UserCache();
const postCache: PostCache = new PostCache();

export class Get {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * SIZE;
    const limit = parseInt(page) * SIZE;
    const newSkip = skip === 0 ? skip : skip + 1;
    const data: IGetAllUser = {
      skip,
      limit,
      newSkip,
      userId: req.currentUser!.userId
    };

  }

  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await
    userService.getUserById(req.currentUser!.userId);
    res.status(STATUS_CODE.OK).json({ message: 'current user profile', user});
  }

  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await
    userService.getUserById(userId);
    res.status(STATUS_CODE.OK).json({ message: `user with id: ${userId} profile`, user});
  }

  public async profileMaterials(req: Request, res: Response): Promise<void> {
    const { userId, username, uId } = req.params;
    const userName: string = SupportiveMethods.uppercaseFirstLetter(username) as string;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCacheOfAUser('post', parseInt(uId, 10));
    const posts: IPostDocument[] = cachedPosts.length ? cachedPosts :
    await postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });

    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser :
    await userService.getUserById(userId);

    const image: IFileImageDocument[] = await imageService.getImagesFromDB(req.currentUser!.userId);

    res.status(STATUS_CODE.OK).json({ message: 'user materials: ', posts, user, image });
  }

  public async userSuggestion(req: Request, res: Response): Promise<void> {
    
  }
}
