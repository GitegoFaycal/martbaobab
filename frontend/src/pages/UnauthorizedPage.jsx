import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-[75vh] place-items-center bg-baobab-cream px-4">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100 text-red-700">
          <ShieldX size={40} />
        </span>

        <p className="mt-7 font-bold text-baobab-orange">
          Access restricted
        </p>

        <h1 className="mt-2 text-4xl font-black text-baobab-wine">
          You cannot access this page
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Your MartBaobab account does not have permission to open the
          requested page.
        </p>

        <Link
          to="/"
          className="mt-7 inline-block rounded-full bg-baobab-wine px-7 py-3 font-bold text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}