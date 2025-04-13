import { Heart, Utensils, Search, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage({
  user,
  onLogout,
}: {
  user: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">FoodLink</span>
            </div>
            <div className="flex space-x-4 items-center">
              {user ? (
                <>
                  <span className="text-gray-600">Welcome, {user}</span>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Food, Share Love
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with your community to reduce food waste and help those in
            need. Every meal shared is a step towards a better world.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
              <Utensils className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Donate Food</h3>
            <p className="text-gray-600">
              Share your surplus food with those who need it most.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
              <Search className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Food</h3>
            <p className="text-gray-600">
              Discover available food donations in your area.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">
              Coordinate pickups through our secure messaging system.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-3xl font-bold mb-4">
                Make a Difference Today
              </h2>
              <p className="text-gray-600 mb-6">
                Join our growing community of food donors and recipients.
                Together, we can reduce food waste while helping those in need.
              </p>
              <Link
                to="/upload-food"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Upload Food
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800"
                alt="Fresh vegetables and fruits"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 FoodLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
