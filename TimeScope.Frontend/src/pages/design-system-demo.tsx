import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Palette, Type, Layout } from 'lucide-react';

export default function DesignSystemDemo() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-6 p-6">

          <PageHeader
            icon={Palette}
            title="Design System FocusTime"
            description="Palette de couleurs, typographie et composants"
            gradient="from-purple-50 via-pink-50 to-orange-50"
          />

          {/* Palette de Couleurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Palette de Couleurs FocusTime
              </CardTitle>
              <CardDescription>
                Toutes les couleurs du design system avec codes HEX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Couleurs Principales */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Couleurs Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Primaire */}
                  <div className="space-y-2">
                    <div className="bg-focustime-primary h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Primaire</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-primary">Bleu Profond</p>
                      <p className="text-gray-600 font-mono">#0A2540</p>
                      <p className="text-xs text-gray-500">Titres, menus, structure</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="space-y-2">
                    <div className="bg-focustime-action h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Action</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-action">Vert Vif</p>
                      <p className="text-gray-600 font-mono">#10B981</p>
                      <p className="text-xs text-gray-500">Démarrer, Valider, Succès</p>
                    </div>
                  </div>

                  {/* Alerte */}
                  <div className="space-y-2">
                    <div className="bg-focustime-alert h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Alerte</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-alert">Rouge</p>
                      <p className="text-gray-600 font-mono">#EF4444</p>
                      <p className="text-xs text-gray-500">Arrêter, Supprimer, Erreur</p>
                    </div>
                  </div>

                  {/* Avertissement */}
                  <div className="space-y-2">
                    <div className="bg-focustime-warning h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Avertissement</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-warning">Orange</p>
                      <p className="text-gray-600 font-mono">#F59E0B</p>
                      <p className="text-xs text-gray-500">Warnings, Info</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Couleurs Structurelles */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Couleurs Structurelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Fond */}
                  <div className="space-y-2">
                    <div className="bg-focustime-bg h-24 rounded-lg shadow-md border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-gray-700 font-bold">Fond</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">Blanc Cassé</p>
                      <p className="text-gray-600 font-mono">#F6F9FC</p>
                      <p className="text-xs text-gray-500">Fond principal</p>
                    </div>
                  </div>

                  {/* Structure */}
                  <div className="space-y-2">
                    <div className="bg-focustime-structure h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-gray-700 font-bold">Structure</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">Gris Clair</p>
                      <p className="text-gray-600 font-mono">#E6EBF1</p>
                      <p className="text-xs text-gray-500">Bordures, séparateurs</p>
                    </div>
                  </div>

                  {/* Texte Principal */}
                  <div className="space-y-2">
                    <div className="bg-focustime-text h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Texte</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-text">Gris Foncé</p>
                      <p className="text-gray-600 font-mono">#32325D</p>
                      <p className="text-xs text-gray-500">Texte principal</p>
                    </div>
                  </div>

                  {/* Texte Secondaire */}
                  <div className="space-y-2">
                    <div className="bg-focustime-text-secondary h-24 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-white font-bold">Texte 2nd</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-focustime-text-secondary">Gris Moyen</p>
                      <p className="text-gray-600 font-mono">#6B7C93</p>
                      <p className="text-xs text-gray-500">Labels, aide</p>
                    </div>
                  </div>

                </div>
              </div>

            </CardContent>
          </Card>

          {/* Typographie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typographie
              </CardTitle>
              <CardDescription>
                Polices Poppins (titres) et Inter (UI)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-3">
                <h1>Titre H1 - Poppins Bold 40px</h1>
                <h2>Titre H2 - Poppins SemiBold 32px</h2>
                <h3>Titre H3 - Poppins SemiBold 24px</h3>
                <h4>Titre H4 - Poppins SemiBold 20px</h4>
                <h5>Titre H5 - Poppins SemiBold 18px</h5>
                <h6>Titre H6 - Poppins SemiBold 16px</h6>
              </div>

              <div className="pt-4 border-t">
                <p className="font-body text-base">
                  Corps de texte - Inter Regular 16px
                </p>
                <p className="font-body text-sm text-focustime-text-secondary mt-2">
                  Texte secondaire - Inter Regular 14px
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Boutons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Boutons
              </CardTitle>
              <CardDescription>
                Styles de boutons standardisés
              </CardDescription>
            </CardHeader>
            <CardContent>

              <div className="space-y-6">

                {/* Boutons Action */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Boutons d'Action (Vert #10B981)</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-focustime-action hover:opacity-90">
                      Démarrer
                    </Button>
                    <Button className="bg-focustime-action hover:opacity-90">
                      Valider
                    </Button>
                    <Button className="bg-focustime-action hover:opacity-90">
                      Enregistrer
                    </Button>
                  </div>
                </div>

                {/* Boutons Alerte */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Boutons d'Alerte (Rouge #EF4444)</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-focustime-alert hover:opacity-90">
                      Arrêter
                    </Button>
                    <Button className="bg-focustime-alert hover:opacity-90">
                      Supprimer
                    </Button>
                    <Button className="bg-focustime-alert hover:opacity-90">
                      Annuler
                    </Button>
                  </div>
                </div>

                {/* Boutons Primary */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Boutons Primaires (Bleu #0A2540)</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-focustime-primary hover:opacity-90">
                      Confirmer
                    </Button>
                    <Button className="bg-focustime-primary hover:opacity-90">
                      Continuer
                    </Button>
                  </div>
                </div>

                {/* Boutons Warning */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Boutons d'Avertissement (Orange #F59E0B)</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-focustime-warning hover:opacity-90">
                      Attention
                    </Button>
                    <Button className="bg-focustime-warning hover:opacity-90">
                      Réessayer
                    </Button>
                  </div>
                </div>

                {/* Autres variantes */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Autres Variantes</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Classes Tailwind */}
          <Card>
            <CardHeader>
              <CardTitle>Classes Tailwind CSS Disponibles</CardTitle>
              <CardDescription>
                Utilisez ces classes dans vos composants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <p><code className="bg-gray-100 px-2 py-1 rounded">bg-focustime-primary</code> - Fond bleu profond</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">bg-focustime-action</code> - Fond vert vif</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">bg-focustime-alert</code> - Fond rouge</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">bg-focustime-warning</code> - Fond orange</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">text-focustime-primary</code> - Texte bleu</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">text-focustime-text</code> - Texte gris foncé</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">text-focustime-text-secondary</code> - Texte gris moyen</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">font-heading</code> - Police Poppins</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">font-body</code> - Police Inter</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
