// Уведомления демо-приложения. В рабочей версии их будет слать сервер (Web Push),
// сейчас — сам браузер, чтобы показать, как это выглядит у клиента.
export const canNotify = () => typeof window !== "undefined" && "Notification" in window;

export async function enableNotify(): Promise<boolean> {
  if (!canNotify()) return false;
  const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (p !== "granted") return false;
  await notify("Уведомления FOX включены", "Сообщим, когда мастер подтвердит запись и когда машина будет готова.");
  return true;
}

export async function notify(title: string, body: string) {
  if (!canNotify() || Notification.permission !== "granted") return false;
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: title });
    else new Notification(title, { body, icon: "/icon-192.png" });
    return true;
  } catch { return false; }
}
