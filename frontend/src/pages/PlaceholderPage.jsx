import { Link, useLocation, useParams } from "react-router-dom";

function titleFromPath(page, pathname) {
  const slug = page || pathname.replace(/^\/+|\/+$/g, "") || "page";

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PlaceholderPage() {
  const { page } = useParams();
  const { pathname } = useLocation();
  const title = titleFromPath(page, pathname);

  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-20 text-center">
      <span className="rounded-full bg-baobab-mint/20 px-4 py-2 font-bold text-baobab-wine">
        MartBaobab module
      </span>

      <h1 className="mt-6 text-5xl font-black text-baobab-wine">{title}</h1>

      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        This route is prepared for the next development sprint. The first
        sprint establishes the visual system, reusable navigation and
        marketplace homepage.
      </p>

      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-baobab-orange px-6 py-3 font-bold text-white"
      >
        Back home
      </Link>
    </main>
  );
}
