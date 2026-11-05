import {
  BadgeCheck,
  Eye,
  ImageOff,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard";
import {
  Badge,
  Breadcrumbs,
  Button,
  Container,
  EmptyState,
  Message,
  Spinner,
} from "../../components/ui";
import { useCart } from "../../context/CartContext";
import useFetch from "../../hooks/useFetch";
import { discountPercent, formatRWF, timeAgo } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

export default function ListingDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data, loading, error } = useFetch(`/listings/${slug}`);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [notice, setNotice] = useState(null);

  if (loading) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Spinner label="Loading listing..." />
      </main>
    );
  }

  if (error || !data?.listing) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container>
          <EmptyState
            title="Listing not found"
            description="It may have been sold or removed by the seller."
            action={<Button as={Link} to="/shop">Back to shop</Button>}
          />
        </Container>
      </main>
    );
  }

  const { listing, related } = data;
  const images = listing.images || [];
  const image = images[activeImage]?.url;
  const discount = discountPercent(listing.originalPrice, listing.price);
  const soldOut = listing.type === "PRODUCT" && listing.stock != null && listing.stock <= 0;
  const isService = listing.type === "SERVICE";
  const district = listing.district || listing.shop?.district;
  const whatsapp = whatsappLink(
    listing.shop?.whatsapp || listing.shop?.phone,
    `Hello ${listing.shop?.name}, I saw "${listing.name}" on LOCO. Is it still available?`
  );

  const sectionPath =
    listing.condition === "USED" ? "/second-hand" : isService ? "/services" : "/shop";
  const sectionLabel =
    listing.condition === "USED" ? "Second-hand" : isService ? "Services" : "Shop";

  function handleAdd(buyNow = false) {
    const result = addItem(listing, quantity);

    if (result.ok) {
      if (buyNow) {
        navigate("/cart");
      } else {
        setNotice({ type: "success", text: "Added to your cart." });
      }
    } else {
      setNotice({
        type: "conflict",
        text: `Your cart has items from ${result.shop.name}. Replace it with this item?`,
      });
    }
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: sectionLabel, to: sectionPath },
            ...(listing.category
              ? [{ label: listing.category.name, to: `${sectionPath}?category=${listing.category.slug}` }]
              : []),
            { label: listing.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white">
              <div className="aspect-[4/3] w-full">
                {image ? (
                  <img src={image} alt={listing.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-loco-wine/30">
                    <ImageOff size={64} />
                  </div>
                )}
              </div>
              <div className="absolute left-4 top-4 flex gap-2">
                {listing.condition === "USED" && (
                  <span className="rounded-full bg-loco-wine px-3 py-1 text-xs font-bold text-white">Second-hand</span>
                )}
                {isService && (
                  <span className="rounded-full bg-loco-mint px-3 py-1 text-xs font-bold text-loco-wine-dark">Service</span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-loco-orange px-3 py-1 text-xs font-bold text-white">Save {discount}%</span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${
                      index === activeImage ? "border-loco-orange" : "border-transparent"
                    }`}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-black text-loco-ink sm:text-3xl">{listing.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl font-black text-loco-wine">{formatRWF(listing.price)}</strong>
              {listing.unit && <span className="text-sm text-gray-500">per {listing.unit}</span>}
              {listing.originalPrice && discount > 0 && (
                <span className="text-gray-400 line-through">{formatRWF(listing.originalPrice)}</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {listing.negotiable && <Badge tone="amber">Price negotiable</Badge>}
              {listing.condition === "USED" && listing.originalPrice && (
                <Badge tone="mint">New price was {formatRWF(listing.originalPrice)}</Badge>
              )}
              {listing.stock != null && !isService && (
                <Badge tone={listing.stock > 0 ? "green" : "red"}>
                  {listing.stock > 0 ? `${listing.stock} in stock` : "Sold out"}
                </Badge>
              )}
            </div>

            {listing.description && (
              <p className="mt-5 whitespace-pre-line leading-7 text-gray-700">{listing.description}</p>
            )}

            {notice && (
              <div className="mt-5">
                <Message type={notice.type === "success" ? "success" : "error"}>
                  {notice.text}
                  {notice.type === "conflict" && (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(listing, quantity, { replace: true });
                        setNotice({ type: "success", text: "Cart replaced. Item added." });
                      }}
                      className="ml-2 font-bold underline"
                    >
                      Yes, replace it
                    </button>
                  )}
                </Message>
              </div>
            )}

            {!isService && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center rounded-xl border border-gray-200">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-3 text-loco-wine hover:bg-loco-cream"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-10 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(listing.stock ?? 999, q + 1))}
                    className="px-3 py-3 text-loco-wine hover:bg-loco-cream"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button variant="outline" className="flex-1" disabled={soldOut} onClick={() => handleAdd(false)}>
                  <ShoppingCart size={18} /> Add to cart
                </Button>
                <Button variant="orange" className="flex-1" disabled={soldOut} onClick={() => handleAdd(true)}>
                  Buy now
                </Button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {listing.shop?.phone && (
                <Button as="a" href={`tel:${listing.shop.phone}`} variant="ghost" className="flex-1 border border-orange-100">
                  <Phone size={17} /> {formatPhoneForDisplay(listing.shop.phone)}
                </Button>
              )}
              {whatsapp && (
                <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="mint" className="flex-1">
                  <MessageCircle size={17} /> WhatsApp seller
                </Button>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-loco-cream p-4">
              <Link to={`/shops/${listing.shop.slug}`} className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-loco-wine text-white">
                  {listing.shop.logoUrl ? (
                    <img src={listing.shop.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Store size={22} />
                  )}
                </span>
                <span className="min-w-0">
                  <strong className="flex items-center gap-1 text-loco-wine">
                    {listing.shop.name}
                    {listing.shop.verified && <BadgeCheck size={16} className="text-loco-mint-dark" />}
                  </strong>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} className="text-loco-orange" />
                    {district}
                    {listing.shop.sector ? `, ${listing.shop.sector}` : ""}
                  </span>
                </span>
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1"><Eye size={13} /> {listing.views} views</span>
              <span>Listed {timeAgo(listing.createdAt)}</span>
            </p>
          </div>
        </div>

        {related?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
