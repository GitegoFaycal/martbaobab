import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizePhone } from "../constants/rwanda.js";
import {
  httpError,
  orderReference,
  serialize,
} from "../utils/helpers.js";

const orderInclude = {
  items: {
    include: {
      listing: {
        select: {
          slug: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  },
  payment: true,
  shop: {
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsapp: true,
      district: true,
      ownerId: true,
    },
  },
  customer: { select: { id: true, name: true, phone: true } },
};

// Flat delivery fee for now. Later: distance-based moto delivery pricing.
const DELIVERY_FEE_SAME_DISTRICT = 1000;
const DELIVERY_FEE_OTHER_DISTRICT = 2500;

export const createOrder = asyncHandler(async (req, res) => {
  const body = req.validated.body;

  const shop = await prisma.shop.findUnique({ where: { id: body.shopId } });

  if (!shop) {
    throw httpError(404, "Shop not found");
  }

  if (shop.ownerId === req.user.id) {
    throw httpError(400, "You cannot order from your own shop");
  }

  const ids = [...new Set(body.items.map((item) => item.listingId))];

  const listings = await prisma.listing.findMany({
    where: { id: { in: ids }, shopId: shop.id, active: true },
  });

  if (listings.length !== ids.length) {
    throw httpError(
      400,
      "Some items are no longer available or belong to another shop"
    );
  }

  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  let subtotal = 0;

  const items = body.items.map((item) => {
    const listing = byId.get(item.listingId);

    if (listing.stock != null && listing.stock < item.quantity) {
      throw httpError(
        400,
        `Only ${listing.stock} of "${listing.name}" left in stock`
      );
    }

    const unitPrice = Number(listing.price);
    subtotal += unitPrice * item.quantity;

    return {
      name: listing.name,
      quantity: item.quantity,
      unitPrice,
      listingId: listing.id,
    };
  });

  const deliveryFee =
    body.deliveryDistrict === shop.district
      ? DELIVERY_FEE_SAME_DISTRICT
      : DELIVERY_FEE_OTHER_DISTRICT;

  const total = subtotal + deliveryFee;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: orderReference(),
        subtotal,
        deliveryFee,
        total,
        customerPhone: normalizePhone(body.customerPhone),
        deliveryDistrict: body.deliveryDistrict,
        deliveryAddress: body.deliveryAddress,
        note: body.note || null,
        customerId: req.user.id,
        shopId: shop.id,
        items: { create: items },
        payment: {
          create: {
            provider: body.paymentProvider,
            amount: total,
            status: "PENDING",
          },
        },
      },
      include: orderInclude,
    });

    for (const item of items) {
      const listing = byId.get(item.listingId);

      if (listing.stock != null) {
        await tx.listing.update({
          where: { id: listing.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return created;
  });

  return res.status(201).json({
    success: true,
    message:
      body.paymentProvider === "CASH_ON_DELIVERY"
        ? "Order placed. Pay the delivery person when your order arrives."
        : "Order placed. You will receive a mobile money prompt shortly.",
    order: serialize(order),
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, orders: serialize(orders) });
});

export const listShopOrders = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({ where: { ownerId: req.user.id } });

  if (!shop) {
    return res.status(200).json({ success: true, orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, orders: serialize(orders) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: orderInclude,
  });

  if (
    !order ||
    (order.customerId !== req.user.id &&
      order.shop.ownerId !== req.user.id &&
      req.user.role !== "ADMIN")
  ) {
    throw httpError(404, "Order not found");
  }

  return res.status(200).json({ success: true, order: serialize(order) });
});

const SELLER_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "OUT_FOR_DELIVERY"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.validated.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { shop: { select: { ownerId: true } } },
  });

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isSeller = order.shop.ownerId === req.user.id;
  const isCustomer = order.customerId === req.user.id;

  if (isCustomer && !isSeller) {
    if (status !== "CANCELLED" || order.status !== "PENDING") {
      throw httpError(403, "You can only cancel an order that is still pending");
    }
  } else if (isSeller || req.user.role === "ADMIN") {
    if (!SELLER_TRANSITIONS[order.status].includes(status)) {
      throw httpError(
        400,
        `An order that is ${order.status.toLowerCase()} cannot move to ${status.toLowerCase()}`
      );
    }
  } else {
    throw httpError(404, "Order not found");
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      ...(status === "DELIVERED"
        ? { payment: { update: { status: "PAID" } } }
        : {}),
    },
    include: orderInclude,
  });

  return res.status(200).json({
    success: true,
    message: `Order marked as ${status.toLowerCase().replace(/_/g, " ")}`,
    order: serialize(updated),
  });
});
