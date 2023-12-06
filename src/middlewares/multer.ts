import multer, { StorageEngine, Multer} from 'multer';

const storage: StorageEngine = multer.memoryStorage();
const imageUpload = multer({ storage }).single('image');
const vidUpload = multer({ storage }).single('video');

export { imageUpload, vidUpload };
