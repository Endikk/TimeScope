export default function LoginFooter() {
  return (
    <div className="space-y-2">
      <div className="text-center text-[10px] text-gray-600 font-body">
        <p>
          Vous n'avez pas de compte ?{' '}
          <a 
            href="mailto:support@timescope.com?subject=Demande de création de compte TimeScope"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors cursor-pointer"
          >
            Contactez votre administrateur
          </a>
        </p>
      </div>

      <div className="text-center text-[9px] text-gray-500 font-body">
        <p>TimeScope v1.0.0 - © 2025 Tous droits réservés</p>
      </div>
    </div>
  );
}
