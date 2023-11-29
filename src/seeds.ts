import { faker } from '@faker-js/faker';
import { floor, random } from 'lodash';
import axios from 'axios';
import { createCanvas } from 'canvas';
import { IUserDocument } from './features/users/interfaces/user.interface';
import { UserModel } from './features/users/models/user.schema';
import { AuthModel } from './features/auth/models/auth.schema';
import { IAuthDocument } from './features/auth/interfaces/auth.interface';


function avatarColor(): string {
  const colors: string[] = [
    '#f44336',
    '#e91e63',
    '#219613',
    '#9c27b0',
    '#3151b5',
    '#00bcd4',
    '#4caf50',
    '#ff9800',
    '#8bc34a',
    '#009688',
    '#03a9f4',
    '#cddc39',
    '#2962ff',
    '#448aff',
    '#84ffff',
    '#00e676',
    '#43a047',
    '#d32f2f',
    '#ff1744',
    '#ad1457',
    '#6a1b9a',
    '#1a237e',
    '#1de9b6',
    '#d84315',
  ];
  return colors[floor(random(0.9) * colors.length)];
}

function generateAvatar(text: string, backgroundColor: string, foregroundColor = 'white') {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'normal 80p sans-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

async function seedUserData(count: number): Promise<void> {
  let i = 0;
  try {
    for(i = 0; i < count; i++) {
      const username: string = faker.helpers.unique(faker.word.adjective, [8]);
      const firstname: string = faker.person.firstName();
      const lastname: string = faker.person.lastName();
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        firstname,
        lastname,
        email: faker.internet.email(),
        password: 'qwerty',
        avatarImage: avatar
      };
      console.log(`****ADDING USER TO DATABASE**** - ${i + 1} of ${count} - ${username}`);
      await axios.post('http://localhost:5000/api/v1/signup', body);
    }
  } catch(error: any) {
    console.log(error?.response?.data);
  }
}

async function getAllUsers(): Promise<IAuthDocument[]> {
  const auths: IAuthDocument[] = await AuthModel.find({}).limit(10);
  return auths;
}

// function aggregateProject() {
//   return {
//     _id: 1,
//     username: '$authId.username',
//     uId: '$authId.uId',
//     email: '$authId.email',
//     profilePicture: 1
//   };
// }


async function seedUserPost(count: number, user: IAuthDocument): Promise<void> {
  try {
    for (let i = 0; i < count; i++) {
      const post = faker.lorem.lines({ min: 1, max: 3 });
      const body = {
        uId: user.uId,
        userId: user._id,
        username: user.username,
        email: user.email,
        post,
        privacy: 'public',
        gifUrl: '',
        profilePicture: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQgByBT5IiAT_a2x9pUVb4VMoOrlzHH7Jrzj-HB5jzHlR4lNLMS',
      };
      console.log(`****ADDING POST TO DATABASE**** - ${i + 1} of ${count}`);
      await axios.post('http://localhost:5000/api/v1/post/seeds', body);
    }
  } catch (error: any) {
    console.log(error?.response?.data);
  }
}

async function getUsers(): Promise<void> {
  const users: IAuthDocument[] = await getAllUsers();
  console.log(users);
    for (const user of users) {
      await seedUserPost(1, user);
    }
    console.log('All posts seeded successfully!');
}

getAllUsers();
