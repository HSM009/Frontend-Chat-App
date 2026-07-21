import { Tabs } from "expo-router";

import AuthGuard from "@/src/components/AuthGuard";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs>
        <Tabs.Screen name="index" />

        <Tabs.Screen name="profile" />
      </Tabs>
    </AuthGuard>
  );
}
