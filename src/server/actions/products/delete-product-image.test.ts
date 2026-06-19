jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { deleteProductImageAction } from "./delete-product-image";
import { MockProductImageRepository, MockUploadFilesRepository } from "@/tests/mocks/repositories";
import { DeleteProductImage } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import { revalidatePath } from "next/cache";

describe("deleteProductImageAction", () => {
  beforeEach(() => {
    (revalidatePath as jest.Mock).mockClear();
  });

  it("returns failure when image URL does not start with https://", async () => {
    const mockImageRepo = MockProductImageRepository();
    const mockUploadRepo = MockUploadFilesRepository();

    const action = deleteProductImageAction(mockImageRepo, mockUploadRepo);
    const result = await action("img-1", "http://example.com/image.jpg");

    expect(result).toEqual({ success: false, message: "Invalid image URL" });
  });

  it("deletes image and calls revalidatePath on success", async () => {
    const deletedImage = DeleteProductImage.fromJson({
      id: "img-1",
      product: { slug: "test-product" },
    });
    const mockImageRepo = MockProductImageRepository({
      deleteImage: async () => Result.success(deletedImage),
    });
    const mockUploadRepo = MockUploadFilesRepository({
      deleteImage: async () => Result.success("ok"),
    });

    const action = deleteProductImageAction(mockImageRepo, mockUploadRepo);
    const result = await action("img-1", "https://res.cloudinary.com/test/image.jpg");

    expect(result).toEqual({ success: true, data: "Imagen eliminada correctamente" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/product/test-product");
    expect(revalidatePath).toHaveBeenCalledWith("/product/test-product");
  });

  it("returns failure when image deletion in repository fails", async () => {
    const mockImageRepo = MockProductImageRepository({
      deleteImage: async () => Result.failure(new Error("Delete failed")),
    });
    const mockUploadRepo = MockUploadFilesRepository({
      deleteImage: async () => Result.success("ok"),
    });

    const action = deleteProductImageAction(mockImageRepo, mockUploadRepo);
    const result = await action("img-1", "https://res.cloudinary.com/test/image.jpg");

    expect(result).toEqual({ success: false, message: "Delete failed" });
  });
});
