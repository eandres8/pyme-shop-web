import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  className?: React.StyleHTMLAttributes<HTMLImageElement>["className"];
  style?: React.StyleHTMLAttributes<HTMLImageElement>["style"];
  width: number;
  height: number;
};

export const ProductImage: React.FC<Props> = ({
  src,
  alt,
  className,
  width,
  height,
  style,
}) => {
  const path = src
    ? src.startsWith("http")
      ? src
      : `/images/products/${src}`
    : "/images/placeholder.jpg";

  return (
    <Image
      src={path}
      width={width}
      height={height}
      alt={alt}
      className={className}
      style={style}
    />
  );
};
