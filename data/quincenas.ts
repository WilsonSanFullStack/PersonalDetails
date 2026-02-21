// data/quincenas.ts
// Mock de quincenas para prerenderizado

export const quincenas = [
  {
    id: "q1",
    workspaceId: "ws1",
    startDate: new Date("2026-02-01T00:00:00Z"),
    endDate: new Date("2026-02-15T23:59:59Z"),
    cerrado: false,
    fechaCierre: null,
    fechaReapertura: null,
    reabiertaPor: null,
    totalCoins: 1000,
    totalUsd: 500,
    totalEuro: 450,
    totalGbp: 400,
    totalCop: 2000000,
    totalAdelantos: 100,
    totalCreditos: 50,
    diasTrabajados: 10,
    ultimoParcialDayId: null,
    ultimoCorteDayId: null,
    moneda: {
      estadisticas: { usd: 1.0, euro: 0.9, gbp: 0.8 },
      pago: { usd: 1.0, euro: 0.9, gbp: 0.8 },
    },
    createdAt: new Date("2026-02-01T00:00:00Z"),
  },
];
