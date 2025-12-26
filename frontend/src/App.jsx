import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProblemDetails from './pages/ProblemDetails';
import AddProblem from './pages/AddProblem';
import CreateProblemSet from './pages/CreateProblemSet';
import SetDetails from './pages/SetDetails';
import Profile from './pages/Profile';
import TeamSelection from './pages/TeamSelection';
import EditTeam from './pages/EditTeam';
import { useAuth } from './context/AuthContext';

// Helper to force team selection if not in team
const TeamGuard = ({ children }) => {
  const { user } = useAuth();
  if (user && !user.currentTeam) {
    return <Navigate to="/team-selection" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '1rem',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              success: {
                style: {
                  background: 'white',
                  color: '#10b981',
                  border: '1px solid #d1fae5',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
              },
              error: {
                style: {
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #fee2e2',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/team-selection" element={
                <PrivateRoute>
                  <TeamSelection />
                </PrivateRoute>
              } />
              <Route path="/team/edit/:id" element={
                <PrivateRoute>
                  <EditTeam />
                </PrivateRoute>
              } />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <TeamGuard>
                      <Dashboard />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/problem/:id"
                element={
                  <PrivateRoute>
                    <TeamGuard>
                      <ProblemDetails />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-problem"
                element={
                  <PrivateRoute>
                    {/* Any team member can add problems now */}
                    <TeamGuard>
                      <AddProblem />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/problem/edit/:id"
                element={
                  <PrivateRoute>
                    <TeamGuard>
                      <AddProblem />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/set/:id"
                element={
                  <PrivateRoute>
                    <TeamGuard>
                      <SetDetails />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/set/edit/:id"
                element={
                  <PrivateRoute>
                    <TeamGuard>
                      <CreateProblemSet />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-set"
                element={
                  <PrivateRoute>
                    {/* Only leaders should create sets? Or anyone? User asked "each member... can add problems normally" 
                         but sets might be leader only? Let's assume democratized for now or leader. 
                         Let's allow everyone based on request "Eliminate admin role entirely". 
                      */}
                    <TeamGuard>
                      <CreateProblemSet />
                    </TeamGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
