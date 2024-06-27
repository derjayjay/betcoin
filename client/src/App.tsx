import { Register } from './components/Register';
import { Home } from './components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './components/Game';
import { PublicRoutes } from './components/PublicRoutes';
import { PrivateRoutes } from './components/PrivateRoutes';
import { Login } from './components/Login';
import { Logout } from './components/Logout';

function App() {
  return (
    <>
      <main className="flex flex-1 flex-col pb-2 lg:px-2">
        <div className="grow p-6 lg:rounded-lg lg:p-10 lg:shadow-sm lg:ring-1 lg:bg-zinc-900 lg:ring-white/10">
          <BrowserRouter>
            <Routes>
              <Route element={<PrivateRoutes />}>
                <Route element={<Game />} path="/game" />
                <Route element={<Logout />} path="/logout" />
              </Route>
              <Route element={<PublicRoutes />}>
                <Route element={<Login />} path="/login" />
                <Route element={<Register />} path="/register" />
                <Route element={<Home />} path="*" />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </main>
    </>
  );
}

export default App;
