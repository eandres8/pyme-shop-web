jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../../providers", () => ({
  productImageRepository: {
    deleteImage: jest.fn(),
  },
  uploadFilesRepository: {
    deleteImage: jest.fn(),
  },
}));

import { deleteProductImage } from "./delete-product-image";
import { Result } from "@/src/core/utils";

const mockProductImageRepository = jest.requireMock("../../providers").productImageRepository;
const mockUploadFilesRepository = jest.requireMock("../../providers").uploadFilesRepository;

describe("deleteProductImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when image URL does not start with https://", async () => {
    const result = await deleteProductImage("img-1", "http://example.com/image.jpg");

    expect(result).toEqual({ success: false, message: "Invalid image URL" });
    expect(mockProductImageRepository.deleteImage).not.toHaveBeenCalled();
    expect(mockUploadFilesRepository.deleteImage).not.toHaveBeenCalled();
  });

  it("deletes image and calls revalidatePath on success", async () => {
    mockUploadFilesRepository.deleteImage.mockResolvedValue(Result.success("deleted"));
    mockProductImageRepository.deleteImage.mockResolvedValue(
      Result.success({ productSlug: "test-product" }),
    );

    const result = await deleteProductImage("img-1", "https://res.cloudinary.com/test/image.jpg");

    expect(result).toEqual({ success: true, data: "Imagen eliminada correctamente" });
    expect(mockUploadFilesRepository.deleteImage).toHaveBeenCalled();
    expect(mockProductImageRepository.deleteImage).toHaveBeenCalledWith("img-1");
  });

  it("returns failure when image deletion in repository fails", async () => {
    mockUploadFilesRepository.deleteImage.mockResolvedValue(Result.success("deleted"));
    mockProductImageRepository.deleteImage.mockResolvedValue(
      Result.failure(new Error("Delete failed")),
    );

    const result = await deleteProductImage("img-1", "https://res.cloudinary.com/test/image.jpg");

    expect(result).toEqual({ success: false, message: "Delete failed" });
  });
});
