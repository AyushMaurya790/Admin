import { Link } from 'react-router-dom';
// Header Component
    const Header = ({ admin, handleLogout }) => {
      return (
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Welcome, {admin.email}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      );
    };
    export default Header;