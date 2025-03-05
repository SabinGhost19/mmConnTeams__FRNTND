import React from "react";
import ProductCard from "../components/ProductCard";

interface User {
  id: number;
  name: string;
  email: string;
}

const userPage = async () => {
  const responde = await fetch("https://jsonplaceholder.typicode.com/users");
  const users: User[] = await responde.json();
  return (
    <div>
      <div>Salut de la Componenta User</div>
      <div>
        <table className="table table-border">
          <tr>
            <th>Email</th>
            <th>Name</th>
          </tr>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <th>{user.name}</th>
                <th>{user.email}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductCard />
    </div>
  );
};

export default userPage;
