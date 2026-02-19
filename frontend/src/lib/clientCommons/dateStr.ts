export const convertInputDate = (date: string | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("sv-SE");
};

export const convertDisplayDate = (date: string | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ja-JP");
};

export const convertDbDate = (date: string | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("sv-SE");
};
