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

  // Helper: fetch an SVG from public path and rasterize to PNG dataURL
  async function svgUrlToPngDataUrl(svgUrl: string, targetWidth: number, targetHeight: number): Promise<string> {
    try {
      const response = await fetch(svgUrl)
      if (!response.ok) throw new Error('SVG fetch failed')
      const svgText = await response.text()

      // Create a blob URL for the SVG and draw it to a canvas
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      return await new Promise<string>((resolve, reject) => {
        const img = new Image()
        // Important for CORS; public assets should be same-origin in this app
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = targetWidth
            canvas.height = targetHeight
            const ctx = canvas.getContext('2d')!
            // optional background white
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/png'))
          } catch (err) {
            URL.revokeObjectURL(url)
            reject(err)
          }
        }
        img.onerror = (e) => {
          URL.revokeObjectURL(url)
          reject(e)
        }
        img.src = url
      })
    } catch (err) {
      // propagate so caller can fallback
      throw err
    }
  }

  // Try to rasterize the SVG logo from public assets; fallback to text if it fails
  let logoDataUrl: string | null = null
  try {
    logoDataUrl = await svgUrlToPngDataUrl('/assets/images/1.svg', 300, 90)
  } catch (err) {
    logoDataUrl = null
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

  // Calculer la répartition par projet
  const projectStats = entries.reduce((acc, entry) => {
    const projectName = entry.projetName
    if (!acc[projectName]) {
      acc[projectName] = 0
    }
    acc[projectName] += entry.heures
    return acc
  }, {} as Record<string, number>)

  // page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Get dates from entries
  const dates = Object.keys(entriesByDate).sort()
  const firstDate = dates.length > 0 ? new Date(dates[0]) : new Date()
  const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date()

  let currentY = 20

  // =====================================
  // PAGE 1 - INFORMATIONS GÉNÉRALES
  // =====================================

  // Header logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 20, 15, 50, 18)
    } catch (e) {
      doc.setFontSize(18)
      doc.setTextColor(...COLORS.text)
      doc.text('TimeScope', 20, 25)
    }
  } else {
    doc.setFontSize(18)
    doc.setTextColor(...COLORS.text)
    doc.text('TimeScope', 20, 25)
  }

  currentY = 50

  // Blue bar (full width, prominent)
  doc.setFillColor(...COLORS.primary)
  doc.rect(20, currentY, pageWidth - 40, 8, 'F')
  currentY += 20

  // Title
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.text)
  doc.text(`Compte Rendu d'Activité`, pageWidth / 2, currentY, { align: 'center' })
  currentY += 10

  doc.setFontSize(13)
  doc.setTextColor(...COLORS.gray)
  doc.text(`${monthName} ${year}`, pageWidth / 2, currentY, { align: 'center' })
  currentY += 20

  // Section 1: Informations générales
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Informations générales', 20, currentY)
  doc.setFont('helvetica', 'normal')
  currentY += 10

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.text)

  // Nom et prénom (à remplir manuellement)
  doc.text('Nom et prénom de l\'employé : ___________________________________', 25, currentY)
  currentY += 10

  // Période concernée
  const periodText = `Période concernée : du ${firstDate.toLocaleDateString('fr-FR')} au ${lastDate.toLocaleDateString('fr-FR')}`
  doc.text(periodText, 25, currentY)
  currentY += 8

  // Date de rédaction
  const redactionDate = `Date de rédaction : ${new Date().toLocaleDateString('fr-FR')}`
  doc.text(redactionDate, 25, currentY)
  currentY += 8

  // Société/Groupe
  if (groupId !== 'all') {
    const group = groups.find(g => g.id === groupId)
    doc.text(`Société/Groupe : ${group?.name || 'N/A'}`, 25, currentY)
  } else {
    doc.text('Société/Groupe : Toutes les sociétés/groupes', 25, currentY)
  }
  currentY += 18

  // Section 2: Commentaires / Observations
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Commentaires / Observations', 20, currentY)
  doc.setFont('helvetica', 'normal')
  currentY += 10

  // Cadre blanc pour commentaires (plus grand)
  doc.setDrawColor(...COLORS.gray)
  doc.setFillColor(...COLORS.white)
  doc.setLineWidth(0.5)
  doc.roundedRect(25, currentY, pageWidth - 50, 60, 3, 3, 'FD')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('(Espace réservé aux commentaires, observations ou remarques particulières)', 30, currentY + 8)

  // Start table on a new page
  doc.addPage()

  // =====================================
  // PAGE 2+ - TABLEAU DE SUIVI DU TEMPS
  // =====================================

  currentY = 80 // Start after the header that will be drawn by didDrawPage

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
    startY: currentY,
    head: [['Date', 'Groupe', 'Projet', 'Tâche', 'Heures', 'Description']],
    body: tableData,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.text,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { 
        cellWidth: 24, 
        fontStyle: 'bold', 
        textColor: COLORS.primaryDark,
        halign: 'center'
      },
      1: { cellWidth: 30, fontSize: 8 },
      2: { cellWidth: 28, fontSize: 8 },
      3: { cellWidth: 30, fontSize: 8 },
      4: { 
        cellWidth: 18, 
        halign: 'center', 
        fontStyle: 'bold', 
        textColor: COLORS.success,
        fontSize: 8
      },
      5: { cellWidth: 40, fontSize: 7 }
    },
    didParseCell: function(data) {
      // Bordure gauche épaisse pour la colonne date avec date
      if (data.column.index === 0 && data.cell.text[0] !== '' && data.section === 'body') {
        data.cell.styles.lineWidth = 2
        data.cell.styles.lineColor = COLORS.primary
      }
    }
    ,
    // draw header/footer on each page
    didDrawPage: function(data) {
      const pageNumber = data.pageNumber
      const pageCount = doc.getNumberOfPages()

      // For table pages (page 2 and onwards) show header
      if (pageNumber >= 2) {
        // Logo
        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, 'PNG', 20, 15, 50, 18)
          } catch (e) {
            // fallback
            doc.setFontSize(18)
            doc.setTextColor(...COLORS.text)
            doc.text('TimeScope', 20, 25)
          }
        } else {
          doc.setFontSize(18)
          doc.setTextColor(...COLORS.text)
          doc.text('TimeScope', 20, 25)
        }

        // Blue bar
        doc.setFillColor(...COLORS.primary)
        doc.rect(20, 50, pageWidth - 40, 8, 'F')

        // Section title
        doc.setFontSize(11)
        doc.setTextColor(...COLORS.primary)
        doc.setFont('helvetica', 'bold')
        doc.text('3. Tableau de suivi du temps', 20, 68)
        doc.setFont('helvetica', 'normal')
      }

      // Footer for all pages
      const footerY = pageHeight - 10
      doc.setDrawColor(...COLORS.lightGray)
      doc.setLineWidth(0.3)
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)

      doc.setFontSize(7)
      doc.setTextColor(...COLORS.gray)
      const footerText = `Page ${pageNumber}/${pageCount} • Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      doc.text(footerText, pageWidth / 2, footerY, { align: 'center' })

      doc.setFontSize(8)
      doc.setTextColor(...COLORS.primary)
      doc.text('TimeScope', pageWidth - 20, footerY, { align: 'right' })
    }
  })

  // =====================================
  // PAGE FINALE - SYNTHÈSE ET VALIDATION
  // =====================================

  // Ajouter une nouvelle page pour la synthèse et validation
  doc.addPage()

  currentY = 20

  // Header logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 20, 15, 50, 18)
    } catch (e) {
      doc.setFontSize(18)
      doc.setTextColor(...COLORS.text)
      doc.text('TimeScope', 20, 25)
    }
  } else {
    doc.setFontSize(18)
    doc.setTextColor(...COLORS.text)
    doc.text('TimeScope', 20, 25)
  }

  currentY = 50

  // Blue bar
  doc.setFillColor(...COLORS.primary)
  doc.rect(20, currentY, pageWidth - 40, 8, 'F')
  currentY += 20

  // Section 4: Synthèse du temps
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('4. Synthèse du temps', 20, currentY)
  doc.setFont('helvetica', 'normal')
  currentY += 12

  // Stats box with rounded corners
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(25, currentY, pageWidth - 50, 35, 5, 5, 'F')

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.white)
  doc.text(`Total d'heures travaillées : ${totalHours.toFixed(1)}h`, 35, currentY + 12)
  doc.text(`Nombre de jours travaillés : ${workingDaysCount}`, 35, currentY + 21)
  doc.text(`Nombre d'entrées : ${entries.length}`, 35, currentY + 30)
  currentY += 43

  // Répartition par projet
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text('Répartition par projet :', 25, currentY)
  currentY += 6

  const projectEntries = Object.entries(projectStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  for (const [projectName, hours] of projectEntries) {
    const percentage = ((hours / totalHours) * 100).toFixed(1)
    doc.setFontSize(9)
    doc.text(`• ${projectName} : ${hours.toFixed(1)}h (${percentage}%)`, 30, currentY)
    currentY += 5
  }

  currentY += 8

  // Heures supplémentaires / congés
  doc.setFontSize(9)
  doc.text('Heures supplémentaires : ______________', 25, currentY)
  currentY += 6
  doc.text('Heures d\'absence / congés : ______________', 25, currentY)
  currentY += 18

  // Section 5: Validation
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('5. Validation', 20, currentY)
  doc.setFont('helvetica', 'normal')
  currentY += 10

  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)

  // Deux colonnes pour les signatures
  const col1X = 25
  const col2X = pageWidth / 2 + 10

  doc.text('Signature de l\'employé :', col1X, currentY)
  doc.text('Signature du supérieur :', col2X, currentY)
  currentY += 3

  // Cadres pour signatures
  doc.setDrawColor(...COLORS.gray)
  doc.setLineWidth(0.5)
  doc.rect(col1X, currentY, 75, 22)
  doc.rect(col2X, currentY, 75, 22)
  currentY += 25

  doc.text('Date : ________________', col1X, currentY)
  doc.text('Date : ________________', col2X, currentY)

  // Footer pour la dernière page
  const lastPageNumber = doc.getNumberOfPages()
  const footerY = pageHeight - 10
  doc.setDrawColor(...COLORS.lightGray)
  doc.setLineWidth(0.3)
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)

  doc.setFontSize(7)
  doc.setTextColor(...COLORS.gray)
  const lastFooterText = `Page ${lastPageNumber}/${lastPageNumber} • Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  doc.text(lastFooterText, pageWidth / 2, footerY, { align: 'center' })

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.primary)
  doc.text('TimeScope', pageWidth - 20, footerY, { align: 'right' })

  // After table generation we can draw an accurate footer on the intro page (page 1)
  const finalPageCount = doc.getNumberOfPages()
  try {
    doc.setPage(1)
    const footerY = pageHeight - 10
    doc.setDrawColor(...COLORS.lightGray)
    doc.setLineWidth(0.3)
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)

    doc.setFontSize(7)
    doc.setTextColor(...COLORS.gray)
    const footerText1 = `Page 1/${finalPageCount} • Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    doc.text(footerText1, pageWidth / 2, footerY, { align: 'center' })

    doc.setFontSize(8)
    doc.setTextColor(...COLORS.primary)
    doc.text('TimeScope', pageWidth - 20, footerY, { align: 'right' })
  } catch (e) {
    // ignore footer errors
  }

  // Nom du fichier
  const groupName = groupId === 'all' ? 'tous' : groups.find(g => g.id === groupId)?.name || 'export'
  const fileName = `TimeScope_${monthName}_${year}_${groupName}.pdf`

  // Télécharger
  doc.save(fileName)
}
