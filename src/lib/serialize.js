// Ticket, TicketLog, dan TicketAssignment memakai primary key BigInt yang
// tidak bisa di-JSON-serialize langsung — konversi ke string sebelum dikirim
// sebagai response.
export const serialize = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
