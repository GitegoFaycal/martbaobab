import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "loco.cart";

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch {
    // Ignore corrupt or unavailable storage.
  }

  return { shop: null, items: [] };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage unavailable; the cart lives in memory for this visit.
    }
  }, [cart]);

  // LOCO orders are placed with one shop at a time (like a local errand), so
  // adding an item from another shop asks the caller to confirm first.
  const addItem = useCallback((listing, quantity = 1, { replace = false } = {}) => {
    let result = { ok: true };

    setCart((current) => {
      const listingShop = listing.shop;

      if (
        current.shop &&
        current.items.length > 0 &&
        current.shop.id !== listingShop.id &&
        !replace
      ) {
        result = { ok: false, reason: "different-shop", shop: current.shop };
        return current;
      }

      const base =
        replace || !current.shop || current.shop.id !== listingShop.id
          ? { shop: null, items: [] }
          : current;

      const existing = base.items.find((item) => item.id === listing.id);
      const maxQuantity = listing.stock ?? 999;

      const items = existing
        ? base.items.map((item) =>
            item.id === listing.id
              ? {
                  ...item,
                  quantity: Math.min(maxQuantity, item.quantity + quantity),
                }
              : item
          )
        : [
            ...base.items,
            {
              id: listing.id,
              slug: listing.slug,
              name: listing.name,
              price: Number(listing.price),
              unit: listing.unit || null,
              stock: listing.stock ?? null,
              image: listing.images?.[0]?.url || null,
              quantity: Math.min(maxQuantity, quantity),
            },
          ];

      return {
        shop: {
          id: listingShop.id,
          name: listingShop.name,
          slug: listingShop.slug,
          district: listingShop.district,
        },
        items,
      };
    });

    return result;
  }, []);

  const updateQuantity = useCallback((listingId, quantity) => {
    setCart((current) => {
      const items = current.items
        .map((item) =>
          item.id === listingId
            ? { ...item, quantity: Math.min(item.stock ?? 999, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      return { shop: items.length ? current.shop : null, items };
    });
  }, []);

  const removeItem = useCallback((listingId) => {
    setCart((current) => {
      const items = current.items.filter((item) => item.id !== listingId);
      return { shop: items.length ? current.shop : null, items };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ shop: null, items: [] });
  }, []);

  const value = useMemo(() => {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      shop: cart.shop,
      items: cart.items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [cart, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
