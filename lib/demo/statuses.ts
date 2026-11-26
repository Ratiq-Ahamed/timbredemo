export const STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Quoted",
  "Negotiating",
  "Won",
  "Lost",
];
export const TASK_STATES = [
  "Todo",
  "In progress",
  "Review",
  "Changes requested",
  "Approved",
  "Done",
  "Blocked",
];
export const BOOKING_STATES = [
  "Draft",
  "Hold",
  "Confirmed",
  "In progress",
  "Production",
  "Delivered",
  "Closed",
  "Cancelled",
];
export const QUOTE_TRANSITIONS: Record<string, string[]> = {
  Draft: ["Sent"],
  Sent: ["Accepted", "Declined", "Expired"],
};
export const TASK_TRANSITIONS: Record<string, string[]> = {
  Todo: ["In progress", "Blocked"],
  "In progress": ["Review", "Blocked"],
  Review: ["Approved", "Changes requested", "Blocked"],
  "Changes requested": ["In progress", "Review", "Blocked"],
  Approved: ["Done", "Changes requested"],
  Done: ["Changes requested"],
  Blocked: ["Todo", "In progress"],
};
export const DELIVERABLE_TRANSITIONS: Record<string, string[]> = {
  Planned: ["In production"],
  "In production": ["Ready"],
  Ready: ["Released", "Dispatched"],
  Released: ["Delivered"],
  Dispatched: ["Delivered"],
};
