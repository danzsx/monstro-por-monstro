import { Redirect } from 'expo-router';

// Preserve phase-0 links while the real entry lives at /entry.
export default function FormerEntryPrototype() { return <Redirect href="/entry" />; }
