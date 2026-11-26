export type ID = string;
export type Role = "owner" | "freelancer" | "client";
export type Money = number;
export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
}
export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate: string;
  location: string;
  source: string;
  campaignId?: ID;
  externalId?: string;
  stage: string;
  budget: Money;
  owner: string;
  followUp: string;
  activities: string[];
  lossReason?: string;
}
export interface Campaign {
  id: ID;
  name: string;
  channel: string;
  spend: Money;
  start: string;
  end: string;
}
export interface QuoteItem {
  id: ID;
  label: string;
  quantity: number;
  rate: Money;
  optional: boolean;
  included: boolean;
}
export interface Quote {
  id: ID;
  leadId: ID;
  customerId: ID;
  name: string;
  version: number;
  status: string;
  items: QuoteItem[];
  discount: Money;
  taxPercent: number;
  advance: Money;
  notes: string;
  bookingId?: ID;
}
export interface Booking {
  id: ID;
  name: string;
  customerId: ID;
  quoteId?: ID;
  campaignId?: ID;
  service: string;
  location: string;
  status: string;
  contract: Money;
  advance: Money;
  plannedCosts: Record<string, Money>;
  dueDate: string;
  publicMilestones: string[];
  notes: string;
  refundReview?: boolean;
}
export interface Session {
  id: ID;
  bookingId: ID;
  name: string;
  start: string;
  end: string;
  location: string;
  venue: string;
  status: string;
  requirements: { role: string; count: number }[];
  gearRequired: number;
}
export interface Crew {
  id: ID;
  name: string;
  initials: string;
  skills: string[];
  location: string;
  rate: Money;
  email: string;
  notes: string;
  active: boolean;
}
export interface Assignment {
  id: ID;
  sessionId: ID;
  crewId: ID;
  role: string;
  rate: Money;
  status: string;
  approved: boolean;
}
export interface Asset {
  id: ID;
  model: string;
  category: string;
  serial: string;
  location: string;
  condition: string;
  value: Money;
  purchased: string;
}
export interface Kit {
  id: ID;
  name: string;
  assetIds: ID[];
}
export interface Reservation {
  id: ID;
  assetId: ID;
  sessionId: ID;
  start: string;
  end: string;
  status: string;
}
export interface Issue {
  id: ID;
  assetId: ID;
  sessionId: ID;
  crewId: ID;
  issuedAt: string;
  dueBack: string;
  status: string;
  acknowledged: boolean;
  returnRequested: boolean;
  conditionNote: string;
  returnedAt?: string;
}
export interface Movement {
  id: ID;
  assetId: ID;
  description: string;
  at: string;
  actor: string;
}
export interface Task {
  id: ID;
  bookingId: ID;
  title: string;
  type: string;
  assignee: string;
  due: string;
  status: string;
  version: number;
  comments: string[];
  blockedReason?: string;
  deliverableId: ID;
}
export interface Handover {
  id: ID;
  bookingId: ID;
  sessionId: ID;
  crewId: ID;
  reference: string;
  size: string;
  count: number;
  receivedBy: string;
  storage: string;
  backupConfirmed: boolean;
  at: string;
}
export interface Deliverable {
  id: ID;
  bookingId: ID;
  name: string;
  type: string;
  due: string;
  status: string;
  quantity: number;
  tracking?: string;
  method?: string;
  cost?: Money;
  acknowledgedAt?: string;
  externalUrl?: string;
  approved?: boolean;
}
export interface Media {
  id: ID;
  src: string;
  label: string;
  section: string;
  status: "Ready" | "Uploading" | "Failed";
}
export interface Gallery {
  id: ID;
  bookingId: ID;
  name: string;
  status: string;
  publishedAt?: string;
  expiresAt: string;
  coverId: ID;
  media: Media[];
  favorites: ID[];
  selected: ID[];
  target: number;
  submitted: boolean;
  paymentLock: boolean;
  externalUrl: string;
}
export interface Transaction {
  id: ID;
  bookingId: ID;
  crewId?: ID;
  assignmentId?: ID;
  kind: "Collection" | "Payout" | "Expense" | "Refund" | "Reversal";
  amount: Money;
  at: string;
  method: string;
  reference: string;
  verified: boolean;
  reversesId?: ID;
  category?: string;
  approval?: string;
}
export interface Audit {
  id: ID;
  at: string;
  actor: string;
  entityId: ID;
  message: string;
}
export interface DemoState {
  version: number;
  sequence: number;
  customers: Customer[];
  leads: Lead[];
  campaigns: Campaign[];
  quotes: Quote[];
  bookings: Booking[];
  sessions: Session[];
  crew: Crew[];
  assignments: Assignment[];
  assets: Asset[];
  kits: Kit[];
  reservations: Reservation[];
  issues: Issue[];
  movements: Movement[];
  tasks: Task[];
  handovers: Handover[];
  deliverables: Deliverable[];
  galleries: Gallery[];
  transactions: Transaction[];
  audit: Audit[];
  readNotifications: ID[];
  settings: {
    bufferMinutes: number;
    locations: string[];
    retentionDays: number;
  };
  identity: { role: Role; crewId: ID; customerId: ID };
}
export type InputValue = string | number | boolean | string[] | undefined;
export type Input = Record<string, InputValue>;
export type Command =
  | "lead.create"
  | "lead.update"
  | "lead.activity"
  | "lead.import"
  | "meta.receive"
  | "campaign.spend"
  | "quote.create"
  | "quote.save"
  | "quote.status"
  | "quote.convert"
  | "booking.confirm"
  | "booking.create"
  | "booking.cancel"
  | "booking.reschedule"
  | "session.create"
  | "session.complete"
  | "assignment.create"
  | "assignment.respond"
  | "reservation.create"
  | "gear.issue"
  | "gear.acknowledge"
  | "gear.requestReturn"
  | "gear.return"
  | "gear.maintenance"
  | "task.update"
  | "handover.create"
  | "deliverable.update"
  | "gallery.update"
  | "gallery.favorite"
  | "gallery.select"
  | "gallery.submit"
  | "gallery.reopen"
  | "gallery.upload"
  | "gallery.retry"
  | "collection.add"
  | "collection.refund"
  | "payout.add"
  | "payout.approve"
  | "expense.add"
  | "expense.approve"
  | "transaction.reverse"
  | "customer.notes"
  | "crew.update"
  | "settings.update"
  | "notification.read"
  | "identity.switch";
export type ActionResult =
  | { ok: true; state: DemoState; id?: string; message: string }
  | { ok: false; error: string };
