'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import {
  initialProfessionals,
  type Professional,
} from '../_data/professionals';

import { initialUsers, type AdminUser, type UserStatus } from '../_data/users';

type AdminState = {
  professionals: Professional[];
  save: (record: Professional) => void;
  users: AdminUser[];
  setUserStatus: (userId: string, status: UserStatus) => void;
};

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] =
    useState<Professional[]>(initialProfessionals);

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  function save(record: Professional) {
    setProfessionals((current) => {
      const exists = current.some((item) => item.id === record.id);

      if (exists) {
        return current.map((item) => (item.id === record.id ? record : item));
      }

      return [...current, record];
    });
  }

  function setUserStatus(userId: string, status: UserStatus) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  }

  return (
    <AdminContext.Provider
      value={{
        professionals,
        save,
        users,
        setUserStatus,
      }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider');
  }

  return context;
}
