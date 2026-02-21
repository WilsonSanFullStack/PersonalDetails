// data/pages.ts
// Mock de pages para prerenderizado

export const pages = [
  {
    id: "p1",
    workspaceId: "ws1",
    name: "Página 1",
    coins: true,
    valorCoins: 10,
    moneda: "USD",
    mensual: false,
    tope: 100,
    descuento: 5,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p2",
    workspaceId: "ws1",
    name: "Página 2",
    coins: false,
    valorCoins: 0,
    moneda: "EUR",
    mensual: true,
    tope: 200,
    descuento: 10,
    status: "inactive",
    createdAt: new Date("2026-01-02T00:00:00Z"),
  },
];
