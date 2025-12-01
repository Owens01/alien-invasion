import { useState } from "react";

export type UseSettingsPanelReturn = {
  showSettings: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
};

export default function useSettingsPanel(): UseSettingsPanelReturn {
  const [showSettings, setShowSettings] = useState(false);

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);
  const toggleSettings = () => setShowSettings((prev) => !prev);

  return { showSettings, openSettings, closeSettings, toggleSettings };
}
