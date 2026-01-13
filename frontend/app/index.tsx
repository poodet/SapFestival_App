import { Redirect } from 'expo-router';

export default function Index() {
  // This will be handled by the auth logic in _layout.tsx
  // Default to login page
  return <Redirect href="/(auth)/login" />;
}
