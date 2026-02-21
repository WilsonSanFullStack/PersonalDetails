// data/workspaces.ts
// Mock de workspaces para prerenderizado

export const workspaces = [
  {
    id: "ws1",
    name: "Workspace Demo",
    ownerId: "user1",
    members: ["user1", "user2"],
    aranceles: {
      usd: 1.0,
      euro: 0.9,
      gbp: 0.8,
      porcentaje: 5,
    },
    schemaVersion: 1,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
];
