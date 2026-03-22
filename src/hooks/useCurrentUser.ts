import { useQuery } from '@tanstack/react-query';

export interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

/**
 * Hook para obtener la información del usuario autenticado actual
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('No autorizado');
        }
        throw new Error('Error al cargar información del usuario');
      }
      
      return res.json();
    },
    staleTime: 300000, // 5 minutos
    retry: 1,
  });
}
