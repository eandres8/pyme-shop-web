"use client";

import { useEffect, useRef, useReducer } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ToastContainer, toast } from 'react-toastify';

import type { TCategory, TProductData } from "@/src/core/types";
import { deleteProductImage, updateProductInfo, validateProductSlug } from "@/src/server/actions";
import { ProductImage } from "@/src/shared/components/product";
import {
  slugReducer,
  initialSlugState,
} from './product-form-slug.reducer';

type Props = {
  product: TProductData;
  categories: TCategory[];
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

type FormInputs = {
  title: string;
  slug: string;
  description: string;
  price: number;
  inStock: number;
  sizes: string[];
  tags: string;
  gender: 'men' | 'women' | 'kid';
  categoryId: string;
  images?: FileList;
};

export const ProductForm: React.FC<Props> = ({ product, categories }) => {
  const router = useRouter();
  const [slugState, dispatch] = useReducer(slugReducer, initialSlugState);
  const originalSlug = useRef(product.slug);
  const isNewProduct = !product.id;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { handleSubmit, register, formState: { isValid }, getValues, setValue, watch } = useForm<FormInputs>({
    defaultValues: {
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      inStock: product.in_stock,
      sizes: product.sizes || [],
      tags: product.tags.join(', '),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gender: product.gender as any,
      categoryId: product.category_id,
      images: undefined,
    },
  });

  watch('sizes');

  useEffect(() => {
    if (!isNewProduct) return;

    const subscription = watch((value, { name }) => {
      if (name === 'title' && value.title) {
        const generatedSlug = (value.title as string)
          .toLowerCase()
          .replaceAll(/ /g, '_')
          .trim();
        setValue('slug', generatedSlug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isNewProduct, setValue]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name !== 'slug') return;

      const currentSlug = value.slug as string;
      if (!currentSlug || currentSlug.length < 3) return;

      if (!isNewProduct && currentSlug === originalSlug.current) {
        dispatch({ type: 'AVAILABLE' });
        return;
      }

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        dispatch({ type: 'CHECKING' });
        try {
          const result = await validateProductSlug(currentSlug);

          if (result.success) {
            if (result.data.available) {
              dispatch({ type: 'AVAILABLE' });
            } else {
              dispatch({ type: 'TAKEN', message: 'Este slug ya está en uso' });
            }
          } else {
            dispatch({ type: 'ERROR', message: result.message ?? 'Error al validar slug' });
          }
        } catch {
          dispatch({ type: 'ERROR', message: 'Error de conexión al validar slug' });
        }
      }, 500);
    });

    return () => subscription.unsubscribe();
  }, [watch, isNewProduct, setValue]);

  const onSizeChanged = (size: string) => () => {
    const sizes = new Set(getValues('sizes'));

    if (sizes.has(size)) {
      sizes.delete(size)
    } else {
      sizes.add(size);
    }

    setValue('sizes', Array.from(sizes));
  }

  const deleteImage = (imageId: string, imageUrl: string) => async () => {
    const result = await deleteProductImage(imageId, imageUrl);
  }

  const onSubmit = async (data: FormInputs) => {
    const formData = new FormData();

    const { images, ...productInfo } = data;

    if (product.id) {
      formData.append('id', product.id);
    }

    formData.append('title', productInfo.title);
    formData.append('slug', productInfo.slug);
    formData.append('description', productInfo.description);
    formData.append('price', productInfo.price.toString());
    formData.append('inStock', productInfo.inStock.toString());
    formData.append('sizes', productInfo.sizes.toString());
    formData.append('tags', productInfo.tags);
    formData.append('categoryId', productInfo.categoryId);
    formData.append('gender', productInfo.gender);

    if (images) {
      for (const image of images) {
        formData.append('images', image);
      }
    }

    const result = await updateProductInfo(formData);

    if (result.success === false) {
      toast.error(`😨 ${result.message}`);
      return;
    }

    toast.success('👍 Hecho!');
    router.replace(`/admin/product/${result.data.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid px-5 mb-16 grid-cols-1 sm:px-0 sm:grid-cols-2 gap-4">
      {/* Textos */}
      <div className="flex flex-col gap-2 px-4 w-full">
        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">Título</span>
          <input type="text" className="p-2 border rounded-md bg-gray-50" {...register('title', { required: true })} />
        </div>

        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">url</span>
          <input
            type="text"
            className={clsx("p-2 border rounded-md bg-gray-50", {
              "border-red-500": slugState.status === 'taken',
              "border-green-500": slugState.status === 'available',
            })}
            {...register('slug', { required: true })}
          />
          {slugState.status === 'checking' && (
            <span className="text-xs text-gray-500 mt-1">Verificando…</span>
          )}
          {slugState.error && (
            <span className="text-xs text-red-600 mt-1">{slugState.error}</span>
          )}
          {slugState.status === 'available' && (
            <span className="text-xs text-green-600 mt-1">Slug disponible</span>
          )}
        </div>

        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">Descripción</span>
          <textarea
            rows={5}
            className="p-2 border rounded-md bg-gray-50"
            {...register('description', { required: true })}
          ></textarea>
        </div>

        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">Precio</span>
          <input type="number" className="p-2 border rounded-md bg-gray-50" {...register('price', { required: true, min: 0 })} />
        </div>

        <div className="hidden">
          <div className="flex flex-col mb-2">
            <span className="text-sm font-bold">Tags</span>
            <input type="text" className="p-2 border rounded-md bg-gray-50" {...register('tags')} />
          </div>
        </div>

        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">Género</span>
          <select className="p-2 border rounded-md bg-gray-50" {...register('gender', { required: true })} >
            <option value="">[Seleccione una opción]</option>
            <option value="men">Hombre</option>
            <option value="women">Mujer</option>
            <option value="kid">Niño</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className="flex flex-col mb-2">
          <span className="text-sm font-bold">Categoría</span>
          <select className="p-2 border rounded-md bg-gray-50" {...register('categoryId', { required: true })}>
            <option value="">[Seleccione una opción]</option>
            {
              categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            }
          </select>
        </div>

        <button type="submit" disabled={!isValid} className={clsx({
          "btn-primary w-full": isValid,
          "btn-disabled w-full": !isValid,
        })}>
          Guardar
        </button>
      </div>

      {/* Selector de tallas y fotos */}
      <div className="flex flex-col gap-2 px-4 w-full">
        {/* As checkboxes */}
        <div className="flex flex-col">
          <div className="flex flex-col mb-2">
            <span className="text-sm font-bold">Inventario</span>
            <input type="number" className="p-2 border rounded-md bg-gray-50" {...register('inStock', { required: true, min: 0 })} />
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-sm font-bold">Tallas</span>
            <div className="flex flex-wrap">
              {sizes.map((size) => (
                <div
                  key={size}
                  className={
                    clsx(
                      "flex items-center justify-center w-10 h-10 mr-2 border rounded-md cursor-pointer",
                      {
                        "bg-blue-500 text-white": getValues('sizes').includes(size),
                      }
                    )
                  }
                  onClick={onSizeChanged(size)}
                >
                  <span>{size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <span className="text-sm font-bold">Fotos</span>
            <input
              type="file"
              multiple
              className="p-2 border rounded-md bg-gray-50"
              placeholder="Selecciona tus imagenes"
              accept="image/png, image/jpeg, image/avif"
              { ...register('images') }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {
              product.product_images.map((pi) => (
                <div key={pi.id}>
                  <ProductImage
                    alt={product.title}
                    src={pi.url}
                    width={300}
                    height={300}
                    className="rounded-t-sm shadow-md"
                  />
                  <button
                    type="button"
                    className="bg-red-600 hover:bg-red-800 text-white w-full py-2 px-4 rounded-b-xl transition-all cursor-pointer"
                    onClick={deleteImage(pi.id, pi.url)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <ToastContainer />
    </form>
  );
};
