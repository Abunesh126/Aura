import { useState } from 'react'
import NcoAdminApp from './pages/admin'
import NcoSingleForm from './pages/output'

function App() {
  const [currentPage, setCurrentPage] = useState<'admin' | 'output'>('admin')

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">NCO Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin Assistant
                </button>
                <button
                  onClick={() => setCurrentPage('output')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'output'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Single Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'admin' ? <NcoAdminApp /> : <NcoSingleForm />}
    </div>
  )
}

export default App
