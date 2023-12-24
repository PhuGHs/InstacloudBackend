import { IUserDocument } from '@user/interfaces/user.interface';

export const userdata: IUserDocument = {
  _id: '6567fd28ec30e86a7dc57d20',
  profilePicture: 'http://localhost:3000/src/assets/images/user.jpg',
  postsCount: 3,
  followersCount: 0,
  followingCount: 0,
  blocked: [],
  blockedBy: [],
  notifications: {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  work: '',
  school: '',
  location: '',
  quote: '',
  authId: '60263f14648fed5246e322d3',
  username: 'phule',
  uId: '1621613119252066',
  fullname: 'Phu Le',
  createdAt: '2023-11-30T03:10:32.539Z',
  email: 'phule@gmail.com'
} as unknown as IUserDocument;
