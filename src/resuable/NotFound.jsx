import { useNavigate } from "react-router-dom";

export default function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      
      <div className="text-center space-y-4 max-w-md">
        
        <h1 className="text-2xl font-semibold">
          🚧 Under Maintenance
        </h1>

        <p className="text-gray-400 text-sm">
          This page is currently not available or is under development.
          Please check back later.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm"
        >
          Go to Dashboard
        </button>

      </div>

    </div>
  );
}