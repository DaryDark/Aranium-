import "react-native-get-random-values";
import { Stack } from "expo-router";
import { PhantomProvider, AddressType, darkTheme } from "@phantom/react-native-sdk";

export default function Layout() {
  return (
    <PhantomProvider
      config={{
        providers: ["google", "apple"],
        appId: "3f772481-ad8b-413b-a894-732a8bfadb57",
        scheme: "aranium",
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: "aranium://phantom-auth-callback",
        },
      }}
      theme={darkTheme}
      appName="ARAN"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </PhantomProvider>
  );
}
