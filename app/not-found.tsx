'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Página no encontrada
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver atrás
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
