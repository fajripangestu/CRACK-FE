interface TableHeaderProps {
  columns: string[];
}

export default function TableHeader({ columns }: TableHeaderProps) {
  return (
    <thead className="bg-primary text-white">
      <tr>
        {columns.map((col, idx) => (
          <th key={idx} className="px-4 py-2 border text-center font-bold">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}