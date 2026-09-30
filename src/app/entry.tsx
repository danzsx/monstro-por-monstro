import { Redirect } from 'expo-router';

// Keep old entry links working with the theory-first home screen.
export default function Entry() {
  return <Redirect href="/" />;
}
