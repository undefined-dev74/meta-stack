'use client';

import { useState } from 'react';
import { useGetUsers, usePostUsers } from '@/lib/api/users/users';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Auto-generated React Query hook for GET /users
  const { data: users, isLoading, error, refetch } = useGetUsers();

  // Auto-generated React Query mutation hook for POST /users
  const createUserMutation = usePostUsers({
    mutation: {
      onSuccess: () => {
        // Clear form
        setName('');
        setEmail('');
        // Refetch users list
        refetch();
      },
      onError: (error) => {
        console.error('Error creating user:', error);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Type-safe API call - TypeScript knows the exact shape of the data
    createUserMutation.mutate({
      data: {
        name,
        email,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            User Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Type-safe API with auto-generated React Query hooks
          </p>
        </div>

        {/* Create User Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Create New User
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="John Doe"
                required
                disabled={createUserMutation.isPending}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="john@example.com"
                required
                disabled={createUserMutation.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
            {createUserMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  Error: {createUserMutation.error.message}
                </p>
              </div>
            )}
            {createUserMutation.isSuccess && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  User created successfully!
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Users
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition duration-200"
            >
              Refresh
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                Error loading users: {error.message}
              </p>
            </div>
          )}

          {users && users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No users found. Create your first user above!
              </p>
            </div>
          )}

          {users && users.length > 0 && (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      ID: {user.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tech Stack Info */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Type-Safe API Integration
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
            This app demonstrates OpenAPI-first development with auto-generated type-safe API clients.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Backend:</span>
              <p className="text-blue-700 dark:text-blue-300">Fastify + Zod</p>
            </div>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Frontend:</span>
              <p className="text-blue-700 dark:text-blue-300">Next.js 16</p>
            </div>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Data Fetching:</span>
              <p className="text-blue-700 dark:text-blue-300">React Query</p>
            </div>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Code Gen:</span>
              <p className="text-blue-700 dark:text-blue-300">Orval</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
