// app/users/loading.tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 z-50">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-4 border-blue-500"></div>

      {/* Teks */}
      <p className="mt-4 text-white text-lg font-medium">Loading Data...</p>
    </div>
  );
}