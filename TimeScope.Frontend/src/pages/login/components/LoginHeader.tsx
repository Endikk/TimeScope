export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <img
        src="/assets/images/1.svg"
        alt="TimeScope Logo"
        className="w-52 h-50"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          }}
      />
      <h2 className="text-xl font-heading font-bold text-gray-900">Bienvenue</h2>
      <p className="text-gray-600 mt-0.5 text-xs font-body">Connectez-vous à votre compte</p>
    </div>
  );
}
