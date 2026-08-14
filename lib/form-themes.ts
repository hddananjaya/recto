export interface FormTheme {
  id: string;
  label: string;
  backgroundImage?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
  overlay?: string;
}

export const formThemes: FormTheme[] = [
  {
    id: "none",
    label: "Default",
  },
  {
    id: "image-1",
    label: "Ocean",
    backgroundImage: "/images/theme-ocean-desktop.png",
    backgroundFrom: "#2c4f7c",
    backgroundTo: "#7aa7d9",
  },
  {
    id: "image-2",
    label: "Dusk",
    backgroundImage: "/images/theme-dusk-desktop.png",
    backgroundFrom: "#264a75",
    backgroundTo: "#6f9fd3",
  },
  {
    id: "image-3",
    label: "Sky",
    backgroundImage: "/images/theme-sky-desktop.png",
    backgroundFrom: "#2a5078",
    backgroundTo: "#82b0dc",
  },
  {
    id: "image-4",
    label: "Cloud",
    backgroundImage: "/images/theme-cloud-desktop.png",
    backgroundFrom: "#3a6088",
    backgroundTo: "#9cc2e6",
  },
  {
    id: "image-5",
    label: "Horizon",
    backgroundImage: "/images/theme-horizon-desktop.png",
    backgroundFrom: "#305a89",
    backgroundTo: "#8bb8e2",
  },
];

export function getFormTheme(themeId?: string): FormTheme | undefined {
  return formThemes.find((t) => t.id === themeId);
}
