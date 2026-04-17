import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Category({ params }: Props) {
  const { id } = await params;

  if (!['men', 'women', 'kids'].includes(id)) {
    notFound();
  }

  return (
    <div>
      <h1>Category Page</h1>
      <h2>{id}</h2>
    </div>
  ); 
}
