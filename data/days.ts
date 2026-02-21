// data/days.ts
// Mock de días para prerenderizado

export const days = [
  {
    id: "d1",
    quincenaId: "q1",
    date: new Date("2026-02-01T00:00:00Z"),
    type: "normal",
    totalCoins: 100,
    totalUsd: 50,
    totalEuro: 45,
    totalGbp: 40,
    totalCop: 200000,
    totalAdelantos: 10,
    totalCreditos: 5,
    worked: true,
  },
  {
    id: "d2",
    quincenaId: "q1",
    date: new Date("2026-02-02T00:00:00Z"),
    type: "parcial",
    totalCoins: 120,
    totalUsd: 60,
    totalEuro: 54,
    totalGbp: 48,
    totalCop: 240000,
    totalAdelantos: 12,
    totalCreditos: 6,
    worked: true,
  },
];
