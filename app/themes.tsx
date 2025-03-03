import { Platform } from "react-native";

const WEB_FONT_STACK =
  'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const customLightTheme = {
  dark: false,
  colors: {
    primary: "rgb(255, 45, 85)",
    background: "rgb(242, 242, 242)",
    card: "rgb(255, 255, 255)",
    text: "rgb(28, 28, 30)",
    border: "rgb(199, 199, 204)",
    notification: "rgb(255, 69, 58)",
  },
  fonts: Platform.select({
    web: {
      regular: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "400",
      },
      medium: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "500",
      },
      bold: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "600",
      },
      heavy: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "700",
      },
    },
    ios: {
      regular: {
        fontFamily: "System",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "System",
        fontWeight: "600",
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "700",
      },
    },
    default: {
      regular: {
        fontFamily: "sans-serif",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "sans-serif-medium",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "sans-serif",
        fontWeight: "600",
      },
      heavy: {
        fontFamily: "sans-serif",
        fontWeight: "700",
      },
    },
  }),
};

const customDarkTheme = {
  dark: true,
  colors: {
    primary: "rgb(7, 94, 255)",
    background: "rgb(36, 36, 36)",
    card: "rgb(255, 255, 255)",
    text: "rgb(206, 206, 206)",
    border: "rgb(199, 199, 204)",
    notification: "rgb(255, 69, 58)",
  },
  fonts: Platform.select({
    web: {
      regular: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "400",
      },
      medium: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "500",
      },
      bold: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "600",
      },
      heavy: {
        fontFamily: WEB_FONT_STACK,
        fontWeight: "700",
      },
    },
    ios: {
      regular: {
        fontFamily: "System",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "System",
        fontWeight: "600",
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "700",
      },
    },
    default: {
      regular: {
        fontFamily: "sans-serif",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "sans-serif-medium",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "sans-serif",
        fontWeight: "600",
      },
      heavy: {
        fontFamily: "sans-serif",
        fontWeight: "700",
      },
    },
  }),
};
const themes = { customLightTheme, customDarkTheme };
export default themes;
