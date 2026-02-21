// data/pageWorks.ts
// Mock de pageWorks para prerenderizado

export const pageWorks = [
  {
    id: "pw1",
    dayId: "d1",
    pageId: "p1",
    pageType: "normal",
    status: "active",
    coins: 10,
    usd: 5,
    euro: 4.5,
    gbp: 4,
    cop: 20000,
    adelantos: 1,
    createdBy: "user1",
    createdAt: new Date("2026-02-01T10:00:00Z"),
  },
  {
    id: "pw2",
    dayId: "d2",
    pageId: "p2",
    pageType: "control",
    status: "inactive",
    coins: 0,
    usd: 0,
    euro: 0,
    gbp: 0,
    cop: 0,
    adelantos: 0,
    createdBy: "user2",
    createdAt: new Date("2026-02-02T11:00:00Z"),
  },
];
