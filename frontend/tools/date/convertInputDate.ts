const convertInputDate = (input: Date | string | null | undefined): string => {
  if (!input) return "";

  // 文字列の場合は空文字列チェック
  if (typeof input === "string" && input.trim() === "") return "";

  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return ""; // Invalid date
  }

  return date.toISOString().split("T")[0];
};

export default convertInputDate;
