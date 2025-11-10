import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface LocalTimeEntry {
  id: string
  date: string
  groupeId: string
  groupeName: string
  projetId: string
  projetName: string
  themeId: string
  themeName: string
  taskId: string
  taskName: string
  heures: number
  description: string
  status: 'draft' | 'saved'
}

interface Group {
  id: string
  name: string
}

interface ExportPDFOptions {
  entries: LocalTimeEntry[]
  groups: Group[]
  monthName: string
  year: number
  groupId: string
}

// Couleurs du thème TimeScope
const COLORS = {
  primary: [59, 130, 246] as [number, number, number],      // Bleu principal
  primaryDark: [37, 99, 235] as [number, number, number],   // Bleu foncé
  success: [34, 197, 94] as [number, number, number],        // Vert
  gray: [107, 114, 128] as [number, number, number],         // Gris
  lightGray: [243, 244, 246] as [number, number, number],    // Gris clair
  white: [255, 255, 255] as [number, number, number],        // Blanc
  text: [17, 24, 39] as [number, number, number]             // Texte principal
}

export async function exportToPDF(options: ExportPDFOptions): Promise<void> {
  const { entries, groups, monthName, year, groupId } = options

  const doc = new jsPDF()

  // Ajouter le logo (SVG converti en texte stylisé pour l'instant)
  // Note: Pour un vrai logo, vous devrez le convertir en base64 ou utiliser doc.addImage()
  doc.setFontSize(24)
  doc.setTextColor(...COLORS.primary)
  doc.text('⏱️ TimeScope', 105, 15, { align: 'center' })

  // Ligne de séparation
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(20, 20, 190, 20)

  // Titre du rapport
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.text)
  doc.text(`Rapport d'activité`, 105, 30, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.gray)
  doc.text(`${monthName} ${year}`, 105, 37, { align: 'center' })

  // Informations du groupe
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.text)
  if (groupId !== 'all') {
    const group = groups.find(g => g.id === groupId)
    doc.text(`Société/Groupe: ${group?.name || 'N/A'}`, 20, 47)
  } else {
    doc.text('Toutes les sociétés/groupes', 20, 47)
  }

  // Grouper par date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = []
    }
    acc[entry.date].push(entry)
    return acc
  }, {} as Record<string, typeof entries>)

  // Calculer les statistiques
  const totalHours = entries.reduce((sum, entry) => sum + entry.heures, 0)
  const workingDaysCount = Object.keys(entriesByDate).length

  // Box de statistiques avec fond coloré
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(20, 52, 170, 20, 2, 2, 'F')

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.white)
  doc.text(`Total: ${totalHours.toFixed(1)}h`, 30, 60)
  doc.text(`Jours: ${workingDaysCount}`, 80, 60)
  doc.text(`Entrées: ${entries.length}`, 130, 60)

  // Préparer les données du tableau
  const tableData = Object.entries(entriesByDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .flatMap(([date, dateEntries]) =>
      dateEntries.map((entry, index) => [
        index === 0 ? new Date(date).toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        }) : '',
        entry.groupeName,
        entry.projetName,
        entry.taskName,
        `${entry.heures.toFixed(1)}h`,
        entry.description || '-'
      ])
    )

  // Générer le tableau avec les couleurs du thème
  autoTable(doc, {
    startY: 78,
    head: [['Date', 'Groupe', 'Projet', 'Tâche', 'Heures', 'Description']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: COLORS.text
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', textColor: COLORS.primaryDark },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: COLORS.success },
      5: { cellWidth: 58 }
    },
    didParseCell: function(data) {
      // Ajouter une bordure gauche pour la colonne date
      if (data.column.index === 0 && data.cell.text[0] !== '') {
        data.cell.styles.lineWidth = 0.5
        data.cell.styles.lineColor = COLORS.primary
      }
    }
  })

  // Pied de page avec design amélioré
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Ligne de séparation
    doc.setDrawColor(...COLORS.lightGray)
    doc.setLineWidth(0.5)
    doc.line(20, 282, 190, 282)

    // Texte du pied de page
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.gray)
    const footerText = `Page ${i}/${pageCount} • Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    doc.text(footerText, 105, 287, { align: 'center' })

    // Branding
    doc.setTextColor(...COLORS.primary)
    doc.text('TimeScope', 190, 287, { align: 'right' })
  }

  // Nom du fichier
  const groupName = groupId === 'all' ? 'tous' : groups.find(g => g.id === groupId)?.name || 'export'
  const fileName = `TimeScope_${monthName}_${year}_${groupName}.pdf`

  // Télécharger
  doc.save(fileName)
}
