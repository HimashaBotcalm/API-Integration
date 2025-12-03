import { cookieUtils } from '@/lib/cookies';

export const TokenTestButton = () => {
  const handleDeleteToken = () => {
    cookieUtils.removeToken();
    alert('Token deleted! You should be automatically logged out in 1 second.');
  };

  return (
    <button
      onClick={handleDeleteToken}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
    >
      🧪 Test Auto-Logout (Delete Token)
    </button>
  );
};