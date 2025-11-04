export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <img
        src="/assets/1.svg"
        alt="TimeScope Logo"
        className="w-52 h-28 object-contain mb-2"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="w-28 h-28 bg-indigo-600 rounded-xl flex items-center justify-center mb-2"><span class="text-4xl font-bold text-white font-heading">TS</span></div>';
          }
        }}
      />
      <h2 className="text-xl font-heading font-bold text-gray-900">Bienvenue</h2>
      <p className="text-gray-600 mt-0.5 text-xs font-body">Connectez-vous à votre compte</p>
    </div>
  );
}
