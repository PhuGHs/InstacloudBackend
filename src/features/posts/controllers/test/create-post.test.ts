/* eslint-disable @typescript-eslint/no-explicit-any */
import { authUserPayload } from '@mock/auth.mock';
import { post, postMockRequest, postMockResponse, postWithImage, postWithImageFieldEmpty, postWithVideo, postWithVideoFieldEmpty } from '@mock/post.mock';
import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { Create } from '../create-post';
import { Server } from 'socket.io';
import * as postServer from '@socket/post.socket';
import * as cloudinaryUpload from '@global/helpers/cloudinary-upload';
import { CustomError } from '@global/helpers/error-handler';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/post.queue');
jest.mock('@service/redis/post.cache');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Create Post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('post without image or video', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(post, authUserPayload) as Request;
      const res: Response = postMockResponse();

      const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
      jest.spyOn(postQueue, 'addPostJob');
      jest.spyOn(postServer.socketIOPostObject, 'emit');

      await Create.prototype.post(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: req.currentUser!.userId,
        uId: req.currentUser!.uId,
        createdPost
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'post created successfully!',
        post: createdPost
      });
    });
  });

  describe('post with image', () => {
    it('should throw an error if image is not available', () => {
      const req: Request = postMockRequest(post, authUserPayload) as Request;
      const res: Response = postMockResponse();

      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Image is a required field');
      });
    });

    it('should throw an error if image is empty', () => {
      const req: Request = postMockRequest(postWithImageFieldEmpty, authUserPayload) as Request;
      const res: Response = postMockResponse();

      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Image property is not allowed to be empty');
      });
    });

    it('should throw upload error', () => {
      const req: Request = postMockRequest(postWithImage, authUserPayload) as Request;
      const res: Response = postMockResponse();

      jest.spyOn(cloudinaryUpload, 'upload').mockImplementation((): any => Promise.resolve({version: '', public_id: '', message: 'Upload error'}));
      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('File upload error. Please try again!');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = postMockRequest(postWithImage, authUserPayload) as Request;
      const res: Response = postMockResponse();

      const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
      jest.spyOn(postQueue, 'addPostJob');
      jest.spyOn(cloudinaryUpload, 'upload').mockImplementation((): any => Promise.resolve({version: '1231321', public_id: '1231321'}));
      jest.spyOn(postServer.socketIOPostObject, 'emit');

      await Create.prototype.postWithImage(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: req.currentUser!.userId,
        uId: req.currentUser!.uId,
        createdPost
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'post with image created successfully!',
        post: createdPost
      });
    });
  });

  describe('post with video', () => {
    it('should throw an error if video field is not available', () => {
      const req: Request = postMockRequest(post, authUserPayload) as Request;
      const res: Response = postMockResponse();

      Create.prototype.postWithVideo(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Video is a required field');
      });
    });

    it('should throw an error if video field is empty', () => {
      const req: Request = postMockRequest(postWithVideoFieldEmpty, authUserPayload) as Request;
      const res: Response = postMockResponse();

      Create.prototype.postWithVideo(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Video property is not allowed to be empty');
      });
    });

    it('should throw upload error', () => {
      const req: Request = postMockRequest(postWithVideo, authUserPayload) as Request;
      const res: Response = postMockResponse();

      jest.spyOn(cloudinaryUpload, 'vidUpload').mockImplementation((): any => Promise.resolve({version: '', public_id: '', message: 'Upload error'}));
      Create.prototype.postWithVideo(req, res).catch((error: CustomError) => {
        expect(error.code).toEqual(400);
        expect(error.serializeErrors().message).toEqual('File upload error. Please try again!');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = postMockRequest(postWithVideo, authUserPayload) as Request;
      const res: Response = postMockResponse();

      const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
      jest.spyOn(postQueue, 'addPostJob');
      jest.spyOn(cloudinaryUpload, 'vidUpload').mockImplementation((): any => Promise.resolve({version: '1231321', public_id: '1231321'}));
      jest.spyOn(postServer.socketIOPostObject, 'emit');

      await Create.prototype.postWithVideo(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: req.currentUser!.userId,
        uId: req.currentUser!.uId,
        createdPost
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'post with video created successfully!',
        post: createdPost
      });
    });
  });
});
