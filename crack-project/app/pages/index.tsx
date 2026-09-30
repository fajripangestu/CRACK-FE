import { useEffect, useState } from 'react';
import { getUsers } from '../lib/api';

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Daftar Produk</h1>
      <ul>
        {users.map((p: any) => (
          <li key={p.id}>
            {p.name} - Rp{p.price.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
