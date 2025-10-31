// app/i18n/messages.ts
export type Messages = typeof import("@/app/messages/en.json");

export type MessageKeys = keyof Messages;
