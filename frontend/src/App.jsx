// App.jsx — now just decides which page to show based on the URL.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './ChatPage';
import AdminPage from './AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;