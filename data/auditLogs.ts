// data/auditLogs.ts
// Mock de auditLogs para prerenderizado

export const auditLogs = [
  {
    id: "log1",
    workspaceId: "ws1",
    type: "QUINCENA_CIERRE",
    entityId: "q1",
    createdBy: "user1",
    createdAt: new Date("2026-02-15T23:59:59Z"),
    metadata: { reason: "Cierre automático" },
  },
  {
    id: "log2",
    workspaceId: "ws1",
    type: "PARCIAL_REEMPLAZADO",
    entityId: "d2",
    createdBy: "user2",
    createdAt: new Date("2026-02-02T12:00:00Z"),
    metadata: { oldValue: 120, newValue: 130 },
  },
];
