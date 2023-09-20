import cloudinary, {UploadApiResponse, UploadApiErrorResponse} from 'cloudinary';


export function upload(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean,
) : Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id: public_id,
        overwrite: overwrite,
        invalidate: invalidate,
      },
      (error: UploadApiErrorResponse | undefined, result : UploadApiResponse | undefined) => {
        if(error) resolve(error);
        resolve(result);
      }
    );
  });
}
