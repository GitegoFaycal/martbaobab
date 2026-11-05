import { ImageOff, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatRWF } from "../../lib/format";

export default function CartPage() {
  const { shop, items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container>
          <PageHeader eyebrow="Your cart" title="Cart" />
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Add everyday goods from a shop near you and we will bring them by moto."
            action={<Button as={Link} to="/shop" variant="orange">Start shopping</Button>}
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader
          eyebrow="Your cart"
          title="Cart"
          description={
            <>
              Items from <Link to={`/shops/${shop.slug}`} className="font-bold text-loco-wine">{shop.name}</Link>
              {shop.district ? ` in ${shop.district}` : ""}. Orders are placed with one shop at a time.
            </>
          }
          action={
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 size={16} /> Clear cart
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                <Link to={`/listings/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-loco-cream">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-loco-wine/30"><ImageOff /></span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/listings/${item.slug}`} className="line-clamp-2 font-bold text-loco-ink hover:text-loco-wine">{item.name}</Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatRWF(item.price)}{item.unit ? ` / ${item.unit}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-xl border border-gray-200">
                      <button type="button" aria-label="Decrease" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-loco-wine hover:bg-loco-cream"><Minus size={15} /></button>
                      <span className="min-w-9 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" aria-label="Increase" disabled={item.stock != null && item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-loco-wine hover:bg-loco-cream disabled:opacity-40"><Plus size={15} /></button>
                    </div>
                    <strong className="text-loco-wine">{formatRWF(item.price * item.quantity)}</strong>
                    <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline">
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-black text-loco-wine">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd className="font-semibold">{formatRWF(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Moto delivery</dt><dd className="font-semibold">RWF 1,000 – 2,500</dd></div>
            </dl>
            <p className="mt-2 text-xs text-gray-400">Delivery is RWF 1,000 inside {shop.district || "the shop's district"} and RWF 2,500 to other districts. The exact total shows at checkout.</p>

            <Button as={Link} to={isAuthenticated ? "/checkout" : "/login"} state={{ from: { pathname: "/checkout" }, message: "Log in to place your order." }} variant="orange" className="mt-6 w-full">
              Checkout
            </Button>
            <Button as={Link} to={`/shops/${shop.slug}`} variant="ghost" className="mt-2 w-full">
              Add more from {shop.name}
            </Button>
          </aside>
        </div>
      </Container>
    </main>
  );
}
