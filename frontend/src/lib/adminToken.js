const KEY = 'ca_admin_token';
export const getAdminToken = () => sessionStorage.getItem(KEY);
export const setAdminToken = (t) => sessionStorage.setItem(KEY, t);
export const clearAdminToken = () => sessionStorage.removeItem(KEY);
