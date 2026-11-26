import type { DemoState, Booking } from "./types";
import { NOW } from "./selectors";
import { STAGES } from "./statuses";
export { STAGES, TASK_STATES } from "./statuses";
export const SERVICES = [
  "Wedding",
  "Pre-wedding",
  "Baby shower",
  "Baby photography",
  "Engagement",
  "Corporate",
];
export const LOCATIONS = ["Chennai", "Coimbatore", "Tirunelveli"];
export function createSeed(): DemoState {
  const customers = [
    "Rahul & Priya",
    "Kavin & Meera",
    "Arjun & Nila",
    "Aditya & Kavya",
    "Sanjay & Divya",
    "Vikram & Ananya",
    "Rohan & Ishani",
    "Studio Collective",
  ].map((name, i) => ({
    id: `C-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `customer${i + 1}@example.test`,
    phone: "+91 ••••• ••000",
    location: LOCATIONS[i % 3],
    notes: "Fictional demo customer. Contact details are illustrative.",
  }));
  const bookingNames = [
    "Rahul & Priya Wedding",
    "Kavin & Meera Wedding",
    "Arjun & Nila Engagement",
    "Aditya & Kavya Wedding",
    "Sanjay & Divya Reception",
    "Vikram & Ananya Wedding",
    "Rohan & Ishani Pre-wedding",
    "Studio Collective Portraits",
  ];
  const bookingIds = [
    "EVT-0124",
    "EVT-0118",
    "EVT-0120",
    "EVT-0126",
    "EVT-0115",
    "EVT-0112",
    "EVT-0123",
    "EVT-0122",
  ];
  const bookings: Booking[] = bookingNames.map<Booking>((name, i) => ({
    id: bookingIds[i],
    name,
    customerId: customers[i].id,
    campaignId: `CMP-00${(i % 4) + 1}`,
    service:
      i === 2
        ? "Engagement"
        : i === 6
          ? "Pre-wedding"
          : i === 7
            ? "Corporate"
            : "Wedding",
    location: i === 7 ? "Chennai" : LOCATIONS[i % 3],
    status: [
      "Confirmed",
      "Delivered",
      "Production",
      "Confirmed",
      "Production",
      "Closed",
      "Confirmed",
      "In progress",
    ][i],
    contract:
      [150000, 120000, 65000, 180000, 90000, 110000, 45000, 35000][i] * 100,
    advance: [50000, 40000, 20000, 60000, 30000, 35000, 15000, 10000][i] * 100,
    plannedCosts:
      i === 0
        ? {
            Crew: 4000000,
            Editing: 1500000,
            Printing: 1200000,
            Travel: 600000,
            Rental: 400000,
            "Advertising allocation": 250000,
            Other: 300000,
          }
        : {
            Crew: 2000000,
            Editing: 800000,
            Printing: 500000,
            Travel: 200000,
            Rental: 0,
            "Advertising allocation": 0,
            Other: 0,
          },
    dueDate: [
      "2027-01-10",
      "2026-11-21",
      "2026-11-28",
      "2027-01-20",
      "2026-11-26",
      "2026-11-10",
      "2026-12-16",
      "2026-12-01",
    ][i],
    publicMilestones:
      i === 1
        ? [
            "Booking confirmed",
            "Shoot completed",
            "Photo editing approved",
            "Gallery published",
          ]
        : ["Booking confirmed"],
    notes:
      "Internal: coordinate crew call times and media handover separately from delivery.",
  }));
  const sessionSpecs = [
    ["S-001", 0, "Pre-wedding", "2026-12-02", "07:00", "11:00"],
    ["S-002", 0, "Sangeet", "2026-12-05", "17:00", "22:00"],
    ["S-003", 0, "Wedding", "2026-12-06", "06:00", "14:00"],
    ["S-004", 0, "Reception", "2026-12-07", "18:00", "22:00"],
    ["S-005", 1, "Wedding", "2026-11-15", "06:00", "14:00"],
    ["S-006", 1, "Reception", "2026-11-15", "18:00", "22:00"],
    ["S-007", 2, "Engagement", "2026-11-20", "08:00", "13:00"],
    ["S-008", 3, "Wedding", "2026-12-06", "07:00", "15:00"],
    ["S-009", 3, "Reception", "2026-12-08", "18:00", "22:00"],
    ["S-010", 4, "Reception", "2026-11-18", "18:00", "22:00"],
    ["S-011", 5, "Wedding", "2026-11-03", "07:00", "13:00"],
    ["S-012", 5, "Reception", "2026-11-04", "18:00", "22:00"],
    ["S-013", 6, "Pre-wedding", "2026-11-28", "06:00", "10:00"],
    ["S-014", 7, "Brand portraits", "2026-11-24", "11:00", "16:00"],
    ["S-015", 4, "Album consultation", "2026-11-26", "10:00", "11:00"],
  ] as const;
  const sessions = sessionSpecs.map(([id, bi, name, day, start, end]) => ({
    id,
    bookingId: bookings[bi].id,
    name,
    start: new Date(`${day}T${start}:00+05:30`).toISOString(),
    end: new Date(`${day}T${end}:00+05:30`).toISOString(),
    location: bookings[bi].location,
    venue:
      bi === 0
        ? "The Leela Palace · Chennai"
        : bi === 7
          ? "Sample studio · Chennai"
          : `Sample venue · ${bookings[bi].location}`,
    status: day < "2026-11-24" ? "Completed" : "Planned",
    requirements: [
      { role: "Photographer", count: name === "Wedding" ? 2 : 1 },
      { role: "Videographer", count: 1 },
    ],
    gearRequired: 3,
  }));
  const crew = [
    "Arun Kumar",
    "Dev Menon",
    "Prakash Ravi",
    "Siddharth Raj",
    "Naveen Bala",
    "Hari Shankar",
    "Aakash V",
    "Nithya Raman",
    "Sahana S",
    "Madhan K",
    "Ritika Sen",
    "Surya P",
  ].map((name, i) => ({
    id: `F-${String(i + 1).padStart(3, "0")}`,
    name,
    initials: name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    skills:
      i === 0
        ? ["Photographer", "Videographer"]
        : i === 3
          ? ["Photographer", "Videographer"]
          : i % 3 === 0
            ? ["Videographer"]
            : i % 3 === 1
              ? ["Photographer", "Editor"]
              : ["Photographer"],
    location: LOCATIONS[i % 3],
    rate: (i < 4 ? 8000 : 6000) * 100,
    email: `crew${i + 1}@example.test`,
    notes: "Sample freelance professional · rate agreed per session.",
    active: true,
  }));
  const assignments = [
    {
      id: "A-001",
      sessionId: "S-001",
      crewId: "F-001",
      role: "Photographer",
      rate: 800000,
      status: "Proposed",
      approved: false,
    },
    {
      id: "A-002",
      sessionId: "S-008",
      crewId: "F-003",
      role: "Photographer",
      rate: 800000,
      status: "Accepted",
      approved: true,
    },
    {
      id: "A-003",
      sessionId: "S-014",
      crewId: "F-001",
      role: "Photographer",
      rate: 800000,
      status: "Accepted",
      approved: true,
    },
    {
      id: "A-004",
      sessionId: "S-014",
      crewId: "F-004",
      role: "Videographer",
      rate: 800000,
      status: "Accepted",
      approved: true,
    },
    {
      id: "A-005",
      sessionId: "S-005",
      crewId: "F-001",
      role: "Photographer",
      rate: 800000,
      status: "Completed",
      approved: true,
    },
    {
      id: "A-006",
      sessionId: "S-007",
      crewId: "F-002",
      role: "Photographer",
      rate: 600000,
      status: "Completed",
      approved: true,
    },
    {
      id: "A-007",
      sessionId: "S-010",
      crewId: "F-005",
      role: "Photographer",
      rate: 600000,
      status: "Completed",
      approved: true,
    },
    {
      id: "A-008",
      sessionId: "S-003",
      crewId: "F-001",
      role: "Photographer",
      rate: 800000,
      status: "Accepted",
      approved: true,
    },
  ];
  const models = [
    "Sony A7 IV",
    "Sony A7S III",
    "Canon EOS R6 II",
    "Sony FX3",
    "Sony A7 III",
    "Canon EOS R5",
    "Sony FE 24–70mm GM",
    "Sony FE 70–200mm GM",
    "Sigma 35mm Art",
    "Sony FE 85mm",
    "Canon RF 50mm",
    "Tamron 28–75mm",
    "Godox V1",
    "Godox AD200",
    "Aputure Amaran",
    "Godox SL60",
    "DJI RS 3 Pro",
    "DJI Mini 4 Pro",
    "Manfrotto Tripod",
    "Peak Design Strap",
    "RØDE Wireless GO II",
    "Zoom H6",
    "SanDisk 256GB CFexpress",
    "Samsung T7 Shield",
  ];
  const assets = models.map((model, i) => ({
    id:
      i < 6
        ? `CAM-${String(i + 1).padStart(3, "0")}`
        : i < 12
          ? `LEN-${String(i - 5).padStart(3, "0")}`
          : `GEAR-${String(i - 11).padStart(3, "0")}`,
    model,
    category:
      i < 6
        ? "Camera"
        : i < 12
          ? "Lens"
          : i < 16
            ? "Lighting"
            : i < 20
              ? "Support"
              : "Audio & storage",
    serial: `TS-${2024 + (i % 3)}-${String(i + 1001)}`,
    location: "Sample stockroom · Chennai",
    condition: i === 5 ? "Maintenance" : "Good",
    value: (i < 6 ? 180000 : i < 12 ? 90000 : 25000) * 100,
    purchased: `2024-0${(i % 8) + 1}-15`,
  }));
  const issueSpecs = [
    [
      "I-001",
      "CAM-005",
      "S-010",
      "F-005",
      "2026-11-18T11:30:00Z",
      "2026-11-19T12:30:00Z",
      "Issued",
    ],
    [
      "I-002",
      "LEN-005",
      "S-007",
      "F-002",
      "2026-11-20T01:30:00Z",
      "2026-11-21T12:30:00Z",
      "Returned",
    ],
    [
      "I-003",
      "GEAR-009",
      "S-005",
      "F-001",
      "2026-11-15T00:30:00Z",
      "2026-11-16T12:30:00Z",
      "Returned",
    ],
    [
      "I-004",
      "LEN-006",
      "S-014",
      "F-001",
      NOW,
      "2026-11-24T14:30:00Z",
      "Issued",
    ],
  ] as const;
  const issues = issueSpecs.map(
    ([id, assetId, sessionId, crewId, issuedAt, dueBack, status]) => ({
      id,
      assetId,
      sessionId,
      crewId,
      issuedAt,
      dueBack,
      status,
      acknowledged: true,
      returnRequested: false,
      conditionNote: "Good at issue",
      ...(status === "Returned" ? { returnedAt: dueBack } : {}),
    }),
  );
  const leads = [
    "Ananya Iyer",
    "Vishal & Rhea",
    "Deepa Krishnan",
    "Karthik S",
    "Neha & Ashwin",
    "Maya Raman",
    "Aravind P",
    "Rohini & Sethu",
    "Naren Kumar",
    "Preethi S",
    "Anjali & Varun",
    "Manoj Raj",
    "Rahul & Priya",
    "Kavin & Meera",
  ].map((name, i) => ({
    id: `L-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `lead${i + 1}@example.test`,
    phone: "+91 ••••• ••000",
    service: SERVICES[i % 6],
    eventDate: `2026-12-${String(i + 10).padStart(2, "0")}`,
    location: LOCATIONS[i % 3],
    source: ["Meta", "Instagram", "Referral", "Website"][i % 4],
    campaignId: i % 4 === 0 ? `CMP-00${(i % 4) + 1}` : undefined,
    stage: i > 11 ? "Won" : STAGES[i % 5],
    budget: (60000 + i * 5000) * 100,
    owner: "Studio owner",
    followUp: i < 4 ? "2026-11-24" : "2026-11-27",
    activities: ["Enquiry received · 21 Nov 2026"],
  }));
  leads[12].campaignId = "CMP-001";
  leads[13].campaignId = "CMP-002";
  const campaigns = [
    "Wedding stories · Chennai",
    "Intimate celebrations",
    "Portrait season",
    "Winter weddings",
  ].map((name, i) => ({
    id: `CMP-00${i + 1}`,
    name,
    channel: i < 3 ? "Meta" : "Manual",
    spend: [18500, 12000, 7500, 9500][i] * 100,
    start: "2026-11-01",
    end: "2026-11-30",
  }));
  const deliverables = bookings.flatMap((b, i) => [
    {
      id: `D-${i}-photo`,
      bookingId: b.id,
      name: "Edited JPEG collection",
      type: "Digital",
      due: b.dueDate,
      status: i === 1 || i === 5 ? "Delivered" : "In production",
      quantity: 250,
    },
    {
      id: `D-${i}-album`,
      bookingId: b.id,
      name: "Premium wedding album",
      type: "Printed album",
      due: b.dueDate,
      status: i === 1 ? "Ready" : "In production",
      quantity: 1,
    },
    {
      id: `D-${i}-film`,
      bookingId: b.id,
      name: "Wedding highlight film",
      type: "Digital",
      due: b.dueDate,
      status: i === 1 ? "Delivered" : "Planned",
      quantity: 1,
    },
  ]);
  const taskTypes = [
    "Photo culling",
    "Photo editing",
    "Video editing",
    "Album design",
    "Quality check",
  ];
  const tasks = Array.from({ length: 20 }, (_, i) => {
    const bi = [2, 4, 7, 0][Math.floor(i / 5)];
    return {
      id: `T-${String(i + 1).padStart(3, "0")}`,
      bookingId: bookings[bi].id,
      title: taskTypes[i % 5],
      type: taskTypes[i % 5],
      assignee: crew[(i + 1) % 12].name,
      due: i < 3 ? "2026-11-23" : i < 10 ? "2026-11-27" : "2026-12-10",
      status: ["In progress", "Review", "Changes requested", "Todo", "Blocked"][
        i % 5
      ],
      version: 1,
      comments: ["Source media received. Please follow the agreed style."],
      blockedReason: i % 5 === 4 ? "Awaiting edited master" : undefined,
      deliverableId: `D-${bi}-${i % 5 === 2 ? "film" : i % 5 === 3 ? "album" : "photo"}`,
    };
  });
  const photoIds = [
    24023466, 1444442, 265730, 169198, 1024981, 32805940, 1456613, 20609907,
    31046031, 27910023, 2959192, 1043902,
  ];
  const media = photoIds.map((_, i) => ({
    id: `PHOTO-${String(i + 1).padStart(3, "0")}`,
    src: `/demo-media/wedding-${String(i + 1).padStart(2, "0")}.webp`,
    label: `KM_${String(i + 1).padStart(4, "0")}.jpg`,
    section: ["Wedding", "Reception", "Portraits"][Math.floor(i / 4)],
    status: "Ready" as const,
  }));
  const galleries = [
    {
      id: "GAL-0118",
      bookingId: "EVT-0118",
      name: "Kavin & Meera",
      status: "Published",
      publishedAt: "2026-11-21",
      expiresAt: "2026-12-21",
      coverId: "PHOTO-002",
      media,
      favorites: [],
      selected: [],
      target: 6,
      submitted: false,
      paymentLock: true,
      externalUrl: "",
    },
    {
      id: "GAL-0120",
      bookingId: "EVT-0120",
      name: "Arjun & Nila",
      status: "Draft",
      expiresAt: "2026-12-24",
      coverId: "PHOTO-002",
      media: media.slice(0, 8).map((m) => ({ ...m, id: `AN-${m.id}` })),
      favorites: [],
      selected: [],
      target: 6,
      submitted: false,
      paymentLock: false,
      externalUrl: "",
    },
  ];
  galleries[1].coverId = galleries[1].media[0].id;
  const transactions: DemoState["transactions"] = bookings.map((b, i) => ({
    id: `TX-${String(i + 1).padStart(3, "0")}`,
    bookingId: b.id,
    kind: "Collection",
    amount: i === 1 || i === 5 ? b.contract : b.advance,
    at: `2026-11-${String(i * 2 + 3).padStart(2, "0")}T06:00:00Z`,
    method: i % 2 ? "Bank transfer" : "UPI",
    reference: `DEMO-ADV-${i + 1}`,
    verified: true,
  }));
  transactions.push(
    {
      id: "TX-009",
      bookingId: "EVT-0118",
      crewId: "F-001",
      assignmentId: "A-005",
      kind: "Payout",
      amount: 800000,
      at: "2026-11-18T06:00:00Z",
      method: "Bank transfer",
      reference: "DEMO-PAYOUT-1",
      verified: true,
    },
    {
      id: "TX-010",
      bookingId: "EVT-0120",
      kind: "Expense",
      amount: 350000,
      at: "2026-11-20T06:00:00Z",
      method: "UPI",
      reference: "Travel · sample receipt",
      verified: true,
      category: "Travel",
      approval: "Approved",
    },
    {
      id: "TX-011",
      bookingId: "EVT-0115",
      kind: "Expense",
      amount: 450000,
      at: "2026-11-19T06:00:00Z",
      method: "Bank transfer",
      reference: "Album printing",
      verified: true,
      category: "Printing",
      approval: "Approved",
    },
    {
      id: "TX-012",
      bookingId: "EVT-0122",
      kind: "Expense",
      amount: 120000,
      at: NOW,
      method: "UPI",
      reference: "Local transport",
      verified: false,
      category: "Travel",
      approval: "Pending",
    },
  );
  return {
    version: 1,
    sequence: 1000,
    customers,
    leads,
    campaigns,
    quotes: [
      {
        id: "Q-0124",
        leadId: "L-013",
        customerId: "C-001",
        name: "Rahul & Priya · Signature Wedding",
        version: 1,
        status: "Accepted",
        items: [
          {
            id: "QI-1",
            label: "Signature wedding collection · four sessions",
            quantity: 1,
            rate: 15000000,
            optional: false,
            included: true,
          },
        ],
        discount: 0,
        taxPercent: 0,
        advance: 5000000,
        notes: "Four sessions. Final media and printed album per agreed scope.",
        bookingId: "EVT-0124",
      },
    ],
    bookings: bookings.map((b, i) =>
      i === 0 ? { ...b, quoteId: "Q-0124" } : b,
    ),
    sessions,
    crew,
    assignments,
    assets,
    kits: [
      {
        id: "KIT-001",
        name: "Wedding essentials",
        assetIds: ["CAM-001", "LEN-001", "GEAR-001"],
      },
      {
        id: "KIT-002",
        name: "Cinema kit",
        assetIds: ["CAM-004", "LEN-002", "GEAR-005"],
      },
      {
        id: "KIT-003",
        name: "Portrait kit",
        assetIds: ["CAM-003", "LEN-004", "GEAR-002"],
      },
    ],
    reservations: [
      {
        id: "R-001",
        assetId: "CAM-002",
        sessionId: "S-008",
        start: sessions[7].start,
        end: sessions[7].end,
        status: "Confirmed",
      },
      {
        id: "R-002",
        assetId: "LEN-001",
        sessionId: "S-001",
        start: sessions[0].start,
        end: sessions[0].end,
        status: "Confirmed",
      },
      {
        id: "R-003",
        assetId: "GEAR-001",
        sessionId: "S-014",
        start: sessions[13].start,
        end: sessions[13].end,
        status: "Confirmed",
      },
    ],
    issues,
    movements: issues.map((i, idx) => ({
      id: `M-${idx}`,
      assetId: i.assetId,
      description:
        i.status === "Returned"
          ? "Returned · condition verified good"
          : `Issued to ${crew.find((c) => c.id === i.crewId)?.name}`,
      at: i.issuedAt,
      actor: "Studio owner",
    })),
    tasks,
    handovers: [
      {
        id: "H-001",
        bookingId: "EVT-0120",
        sessionId: "S-007",
        crewId: "F-002",
        reference: "CARD-AN-01",
        size: "64 GB",
        count: 1260,
        receivedBy: "Studio owner",
        storage: "Local archive / AN / card-01",
        backupConfirmed: true,
        at: "2026-11-20T12:00:00Z",
      },
    ],
    deliverables,
    galleries,
    transactions,
    audit: [
      {
        id: "AUD-SEED",
        at: NOW,
        actor: "Studio owner",
        entityId: "EVT-0124",
        message: "Demo initialized · all records are fictional",
      },
    ],
    readNotifications: [],
    settings: { bufferMinutes: 30, locations: LOCATIONS, retentionDays: 60 },
    identity: { role: "owner", crewId: "F-001", customerId: "C-002" },
  };
}
