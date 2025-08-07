// src/pages/orders/ordersMock.js

export const orders = [
  {
    _id: "688c71dcc6f38894294c66db",
    orderId: "COD_1754034651878",
    orderDate: "2025-08-01T07:50:51.879Z",
    orderStatus: "placed",
    paymentMethod: "cod",
    paymentStatus: "not_paid",
    deliveryMethod: "standard",
    returnStatus: "none",
    expectedDeliverySlot: {
      from: "2025-08-02T00:30:00.000Z",
      to: "2025-08-02T02:30:00.000Z"
    },
    items: [
      {
        itemId: "68593f1c1b010d7b8e34576b",
        itemName: "Carrot",
        imageUrl: "https://ik.imagekit.io/odbeydnbj/dumpalu/carrots.avif?updatedAt=1752152081486",
        quantity: 1,
        price: 66,
        _id: "688c71dcc6f38894294c66dc"
      }
    ],
    totalPrice: 66,
    charges: {
      delivery: 60,
      handling: 0,
      gst: 1,
      platform: 4,
      tip: 0,
      discount: 0
    },
    finalAmount: 66,
    address: {
      name: "test",
      apartment: "test",
      street: "test",
      type: "home",
      lat: 16.186044,
      lon: 81.137758,
      pincode: "521001",
      address: "test, test, Machilipatnam, 521001"
    }
  },
  {
    _id: "1",
    orderId: "ORD123456",
    orderDate: "2025-07-25T10:00:00Z",
    orderStatus: "processing",
    paymentMethod: "cod",
    paymentStatus: "not_paid",
    deliveryMethod: "standard",
    returnStatus: "none",
    expectedDeliverySlot: {
      from: "2025-07-28T16:00:00Z",
      to: "2025-07-28T18:00:00Z"
    },
    items: [
      { itemId: "a1", itemName: "Tomato", imageUrl: "/images/tomato.png", quantity: 1, price: 20 },
      { itemId: "a2", itemName: "Onion", imageUrl: "/images/onion.png", quantity: 1, price: 30 },
      { itemId: "a3", itemName: "Potato", imageUrl: "/images/potato.png", quantity: 1, price: 25 },
      { itemId: "a4", itemName: "Potato", imageUrl: "/images/potato.png", quantity: 1, price: 25 }
    ],
    totalPrice: 100,
    charges: {
      delivery: 0,
      handling: 0,
      gst: 0,
      platform: 0,
      tip: 0,
      discount: 0
    },
    finalAmount: 100,
    address: {
      name: "John Doe",
      apartment: "Apt 101",
      street: "Main Street",
      type: "home",
      lat: 16.123456,
      lon: 81.123456,
      pincode: "521001",
      address: "Apt 101, Main Street, Machilipatnam, 521001"
    }
  },
  {
    _id: "2",
    orderId: "ORD654321",
    orderDate: "2025-07-24T09:00:00Z",
    orderStatus: "delivered",
    paymentMethod: "online",
    paymentStatus: "paid",
    deliveryMethod: "express",
    returnStatus: "none",
    expectedDeliverySlot: {
      from: "2025-07-26T14:00:00Z",
      to: "2025-07-26T16:00:00Z"
    },
    items: [
      { itemId: "b1", itemName: "Carrot", imageUrl: "/images/carrot.png", quantity: 2, price: 50 },
      { itemId: "b2", itemName: "Cabbage", imageUrl: "/images/cabbage.png", quantity: 1, price: 50 }
    ],
    totalPrice: 150,
    charges: {
      delivery: 0,
      handling: 0,
      gst: 0,
      platform: 0,
      tip: 0,
      discount: 0
    },
    finalAmount: 150,
    address: {
      name: "Jane Doe",
      apartment: "Bldg 3",
      street: "Green Avenue",
      type: "work",
      lat: 16.654321,
      lon: 81.654321,
      pincode: "521002",
      address: "Bldg 3, Green Avenue, Machilipatnam, 521002"
    }
  }
];
