import { titleFont } from "@/src/config/fonts";

export default function Home() {
  return (
    <article className="">
      <h1>Rick Sanchez</h1>
      <h1 className={titleFont.className}>Morty Smith</h1>
    </article>
  );
}
