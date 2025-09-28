import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Mumbai University ABC App
          </h1>
          <p className="text-gray-600">
            Academic Bank of Credits Management System
          </p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Welcome to ABC Portal</h2>
            <p className="text-gray-700 mb-4">
              This is the Mumbai University Academic Bank of Credits (ABC) management system.
              Please log in to access your dashboard.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Students</h3>
                <p className="text-sm text-blue-600">
                  Track your academic progress and manage activities
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Faculty</h3>
                <p className="text-sm text-green-600">
                  Verify documents and monitor student performance
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Admin</h3>
                <p className="text-sm text-purple-600">
                  Generate reports and manage institutional data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;