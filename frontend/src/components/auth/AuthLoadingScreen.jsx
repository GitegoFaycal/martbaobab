import { LoaderCircle, ShoppingCart, Sprout } from "lucide-react";

export default function AuthLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-baobab-cream px-4">
      <div className="text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-baobab-wine text-white shadow-lg">
          <ShoppingCart size={30} />

          <Sprout
            size={20}
            className="absolute -right-1 -top-1 text-baobab-mint"
          />
        </div>

        <LoaderCircle
          size={30}
          className="mx-auto mt-6 animate-spin text-baobab-orange"
        />

        <p className="mt-3 font-semibold text-baobab-wine">
          Loading MartBaobab...
        </p>
      </div>
    </div>
  );
}