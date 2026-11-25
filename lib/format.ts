const rupiahFormatter = new Intl.NumberFormat("id-ID");

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatRupiah(value: number): string {
  return `Rp ${rupiahFormatter.format(value)}`;
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return `${dateTimeFormatter.format(date)} WIB`;
}
