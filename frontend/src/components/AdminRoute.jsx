import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../lib/adminToken.js';

export default function AdminRoute({ children }) {
  return getAdminToken() ? children : <Navigate to="/admin" replace />;
}
