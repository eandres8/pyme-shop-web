jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { UploadFilesRepository } from './upload-files.repository';
import { v2 as cloudinary } from 'cloudinary';

const mockedUpload = cloudinary.uploader.upload as jest.Mock;
const mockedDestroy = cloudinary.uploader.destroy as jest.Mock;

const repo = UploadFilesRepository();

describe('UploadFilesRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImages', () => {
    it('uploads files and returns secure URLs', async () => {
      mockedUpload.mockResolvedValue({ secure_url: 'https://example.com/img.jpg' });

      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      const result = await repo.uploadImages([file]);

      expect(mockedUpload).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual(['https://example.com/img.jpg']);
      }
    });

    it('returns empty array when no files provided', async () => {
      const result = await repo.uploadImages([]);

      expect(mockedUpload).not.toHaveBeenCalled();
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('filters out failed uploads', async () => {
      mockedUpload
        .mockResolvedValueOnce({ secure_url: 'https://example.com/img1.jpg' })
        .mockRejectedValueOnce(new Error('Upload failed'));

      const files = [
        new File(['fake1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['fake2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      const result = await repo.uploadImages(files);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual(['https://example.com/img1.jpg']);
      }
    });
  });

  describe('deleteImage', () => {
    it('deletes image and returns result', async () => {
      mockedDestroy.mockResolvedValue('ok');

      const result = await repo.deleteImage('https://example.com/img.jpg');

      expect(mockedDestroy).toHaveBeenCalledWith('https://example.com/img.jpg');
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe('ok');
      }
    });

    it('returns Result.failure when cloudinary throws', async () => {
      mockedDestroy.mockRejectedValue(new Error('Destroy error'));

      const result = await repo.deleteImage('https://example.com/img.jpg');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Destroy error');
      }
    });
  });
});
