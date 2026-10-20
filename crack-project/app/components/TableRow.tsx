interface TableRowProps<T> {
  row: T;
  columns: (keyof T)[];
  onClick?: () => void;
}

export default function TableRow<T>({ row, columns, onClick }: TableRowProps<T>) {
  return (
    <tr
      onClick={onClick}
      className="hover:bg-blue-50 cursor-pointer transition"
    >
      {columns.map((col, idx) => (
        <td key={idx} className="border px-4 py-2">
          {String(row[col])}
        </td>
      ))}
    </tr>
  );
}