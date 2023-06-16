export const AllEntryTypes = ['mentor', 'lesson', 'club'] as const

export type EntryType = typeof AllEntryTypes[number]