import { LoaderCircle, MapPin } from "lucide-react";

export default function AuthLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-loco-ice px-4">
      <div className="text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-loco-navy text-white shadow-lg">
          <MapPin size={30} />
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-loco-blue ring-2 ring-white" />
        </div>
        <LoaderCircle size={30} className="mx-auto mt-6 animate-spin text-loco-blue" />
        <p className="mt-3 font-semibold text-loco-navy">Loading LOCO...</p>
      </div>
    </div>
  );
}
