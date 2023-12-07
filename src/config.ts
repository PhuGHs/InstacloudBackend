import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENDGRID_SENDER: string | undefined;
  public MONGODB_HOST: string | undefined;
  // public MONGODB_USERNAME: string | undefined;
  // public MONGODB_PASSWORD: string | undefined;
  // public MONGODB_ATLAS_PROJECT_ID: string | undefined;
  // public MONGODB_ATLAS_CLUSTER: string | undefined;
  // public MONGODB_ATLAS_PUBLIC_KEY: string | undefined;
  // public MONGODB_ATLAS_PRIVATE_KEY: string | undefined;
  // public ATLAS_CLUSTER_API_URL: string | undefined;
  // public ATLAS_SEARCH_INDEX_API_URL: string | undefined;
  // public DIGEST_AUTH: string | undefined;

  public readonly ATLAS_API_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0';
  private readonly defaultDBURL: string = 'mongodb://localhost:27017/midcloud';

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.defaultDBURL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_PASSWORD = process.env.SENDER_PASSWORD || '';
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    this.MONGODB_HOST = process.env.MONGODB_HOST || '';
    // this.MONGODB_USERNAME = process.env.MONGODB_USERNAME || '';
    // this.MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || '';
    // this.MONGODB_ATLAS_PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID || '';
    // this.MONGODB_ATLAS_CLUSTER = process.env.MONGODB_ATLAS_CLUSTER || '';
    // this.MONGODB_ATLAS_PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY || '';
    // this.MONGODB_ATLAS_PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY || '';
    // this.ATLAS_CLUSTER_API_URL = `${this.ATLAS_API_BASE_URL}/groups/${this.MONGODB_ATLAS_PROJECT_ID}/clusters/${this.MONGODB_ATLAS_CLUSTER}`;
    // this.ATLAS_SEARCH_INDEX_API_URL = `${this.ATLAS_CLUSTER_API_URL}/fts/indexes`;
    // this.DIGEST_AUTH = `${this.MONGODB_ATLAS_PUBLIC_KEY}:${this.MONGODB_ATLAS_PRIVATE_KEY}`;
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfigs(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config: Config = new Config();
