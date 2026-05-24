import * as Linking from "expo-linking";

export const connectPhantom = async () => {
  const redirectLink = Linking.createURL("phantom-connect");

  const url =
    "https://phantom.app/ul/v1/connect" +
    "?app_url=https://aranium.app" +
    "&dapp_encryption_public_key=demo" +
    "&redirect_link=" +
    encodeURIComponent(redirectLink) +
    "&cluster=mainnet-beta";

  try {
    await Linking.openURL(url);
  } catch (error) {
    console.log("Phantom connect error:", error);
  }
};
