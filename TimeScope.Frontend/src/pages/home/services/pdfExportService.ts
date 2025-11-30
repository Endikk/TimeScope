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

// Nouvelle palette de couleurs plus moderne (Slate / Blue)
const COLORS = {
  primary: [15, 23, 42] as [number, number, number],       // Slate 900 (Header bg)
  accent: [59, 130, 246] as [number, number, number],      // Blue 500 (Highlights)
  secondary: [100, 116, 139] as [number, number, number],  // Slate 500 (Subtitles)
  text: [51, 65, 85] as [number, number, number],          // Slate 700 (Body text)
  lightBg: [248, 250, 252] as [number, number, number],    // Slate 50 (Alternating rows)
  border: [226, 232, 240] as [number, number, number],     // Slate 200 (Borders)
  white: [255, 255, 255] as [number, number, number],
  success: [16, 185, 129] as [number, number, number]      // Emerald 500
}

interface LogoInfo {
  dataUrl: string
  width: number
  height: number
  aspectRatio: number
}

export async function exportToPDF(options: ExportPDFOptions): Promise<void> {
  const { entries, groups, monthName, year, groupId } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Helper: fetch an SVG from public path and rasterize to PNG dataURL
  // Also returns dimensions to help with aspect ratio
  async function svgUrlToPngDataUrl(svgUrl: string): Promise<LogoInfo> {
    try {
      const response = await fetch(svgUrl)
      if (!response.ok) throw new Error('SVG fetch failed')
      const svgText = await response.text()

      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      return await new Promise<LogoInfo>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
            // We use a high resolution canvas for good quality
            const scale = 4 // Higher scale for better quality
            const width = img.width * scale
            const height = img.height * scale

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, width, height)

            URL.revokeObjectURL(url)
            resolve({
              dataUrl: canvas.toDataURL('image/png'),
              width: img.width,
              height: img.height,
              aspectRatio: img.width / img.height
            })
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
      throw err
    }
  }

  let logoInfo: LogoInfo | null = null
  try {
    logoInfo = await svgUrlToPngDataUrl('/assets/images/1.svg')
  } catch (err) {
    logoInfo = null
  }

  // Grouper par Thème
  const entriesByTheme = entries.reduce((acc, entry) => {
    const themeName = entry.themeName || 'Sans Thème'
    if (!acc[themeName]) {
      acc[themeName] = []
    }
    acc[themeName].push(entry)
    return acc
  }, {} as Record<string, LocalTimeEntry[]>)

  // Calculer les statistiques globales
  const totalHours = entries.reduce((sum, entry) => sum + entry.heures, 0)
  const uniqueDates = new Set(entries.map(e => e.date))
  const workingDaysCount = uniqueDates.size

  // Calculer la répartition par projet
  const projectStats = entries.reduce((acc, entry) => {
    const projectName = entry.projetName
    if (!acc[projectName]) {
      acc[projectName] = 0
    }
    acc[projectName] += entry.heures
    return acc
  }, {} as Record<string, number>)

  const dates = entries.map(e => e.date).sort()
  const firstDate = dates.length > 0 ? new Date(dates[0]) : new Date()
  const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date()

  // =====================================
  // HEADER HELPER
  // =====================================
  const drawHeader = () => {
    // Draw top colored header
    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, pageWidth, 30, 'F') // Reduced height slightly

    // Logo
    if (logoInfo) {
      const logoH = 15
      const logoW = logoH * logoInfo.aspectRatio
      doc.addImage(logoInfo.dataUrl, 'PNG', 15, 7.5, logoW, logoH)
    } else {
      doc.setFontSize(18)
      doc.setTextColor(...COLORS.white)
      doc.setFont('helvetica', 'bold')
      doc.text('TimeScope', 20, 20)
    }

    // Document Title in Header
    doc.setFontSize(16)
    doc.setTextColor(...COLORS.white)
    doc.setFont('helvetica', 'bold')
    const title = "COMPTE RENDU D'ACTIVITÉ"
    doc.text(title, pageWidth - 20, 15, { align: 'right' })

    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')
    doc.text(`${monthName} ${year}`, pageWidth - 20, 22, { align: 'right' })
  }

  const drawFooter = (pageNumber: number) => {
    const footerY = pageHeight - 10
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.secondary)
    const footerText = `Généré par TimeScope le ${new Date().toLocaleDateString('fr-FR')}`
    doc.text(footerText, 20, footerY)
    doc.text(`Page ${pageNumber}`, pageWidth - 20, footerY, { align: 'right' })
  }

  // =====================================
  // PAGE 1: GLOBAL SUMMARY
  // =====================================

  drawHeader()

  let currentY = 50

  // SECTION 1: INFORMATIONS
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMATIONS GÉNÉRALES', 20, currentY)

  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(1)
  doc.line(20, currentY + 2, 95, currentY + 2)

  currentY += 15

  // Info Grid
  const infoStartX = 20
  const labelWidth = 50
  const valueStartX = infoStartX + labelWidth
  const rowHeight = 10

  doc.setFontSize(10)

  // Row 1: Employé
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('Employé :', infoStartX, currentY)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.text('___________________________________', valueStartX, currentY)

  // Row 2: Période
  currentY += rowHeight
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('Période :', infoStartX, currentY)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.text(`Du ${firstDate.toLocaleDateString('fr-FR')} au ${lastDate.toLocaleDateString('fr-FR')}`, valueStartX, currentY)

  // Row 3: Groupe
  currentY += rowHeight
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('Groupe / Société :', infoStartX, currentY)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  const groupNameText = groupId !== 'all' ? (groups.find(g => g.id === groupId)?.name || 'N/A') : 'Tous les groupes'
  doc.text(groupNameText, valueStartX, currentY)

  // Row 4: Date d'émission
  currentY += rowHeight
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('Date d\'émission :', infoStartX, currentY)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('fr-FR'), valueStartX, currentY)

  // SECTION 2: SYNTHÈSE (Visual Cards)
  currentY += 25
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('SYNTHÈSE DU MOIS', 20, currentY)
  doc.setDrawColor(...COLORS.accent)
  doc.line(20, currentY + 2, 75, currentY + 2)

  currentY += 15

  // Draw 3 cards
  const cardWidth = (pageWidth - 40 - 10) / 3
  const cardHeight = 25
  let cardX = 20

  // Card 1: Total Heures
  doc.setFillColor(...COLORS.lightBg)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.1)
  doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 3, 3, 'FD')

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.text('TOTAL HEURES', cardX + 5, currentY + 8)

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.accent)
  doc.setFont('helvetica', 'bold')
  doc.text(`${totalHours.toFixed(1)}h`, cardX + 5, currentY + 18)

  // Card 2: Jours Travaillés
  cardX += cardWidth + 5
  doc.setFillColor(...COLORS.lightBg)
  doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 3, 3, 'FD')

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('JOURS TRAVAILLÉS', cardX + 5, currentY + 8)

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.text(`${workingDaysCount}`, cardX + 5, currentY + 18)

  // Card 3: Total Entrées
  cardX += cardWidth + 5
  doc.setFillColor(...COLORS.lightBg)
  doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 3, 3, 'FD')

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL ENTRÉES', cardX + 5, currentY + 8)

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.text(`${entries.length}`, cardX + 5, currentY + 18)

  currentY += cardHeight + 15

  // SECTION 3: RÉPARTITION (Bar Chart)
  const projectEntries = Object.entries(projectStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Top 10 projects

  if (projectEntries.length > 0) {
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.secondary)
    doc.text('Répartition par projet', 20, currentY)
    currentY += 8

    const maxHours = projectEntries[0][1]

    projectEntries.forEach(([name, hours]) => {
      // Check for page overflow
      if (currentY > pageHeight - 30) {
        drawFooter(doc.getCurrentPageInfo().pageNumber)
        doc.addPage()
        drawHeader()
        currentY = 50
      }

      // Label
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.text)
      doc.setFont('helvetica', 'normal')
      const displayName = name.length > 25 ? name.substring(0, 23) + '...' : name
      doc.text(displayName, 20, currentY + 4)

      // Bar
      const barX = 80
      const barMaxW = pageWidth - 100
      const barW = (hours / maxHours) * barMaxW

      doc.setFillColor(...COLORS.accent)
      doc.roundedRect(barX, currentY, barW, 5, 1, 1, 'F')

      // Value
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.secondary)
      doc.text(`${hours.toFixed(1)}h`, barX + barW + 2, currentY + 4)

      currentY += 8
    })
  }

  drawFooter(doc.getCurrentPageInfo().pageNumber)

  // =====================================
  // PAGES 2+: THEMES
  // =====================================

  const themes = Object.keys(entriesByTheme).sort()

  for (const theme of themes) {
    doc.addPage()
    // We want the header to be drawn on every page, including those added by autoTable.
    // So we'll use didDrawPage for that.
    // But for the FIRST page of the theme, we need to set the startY correctly.

    // Let's manually draw the header for this first page of the theme
    drawHeader()

    currentY = 50

    // Theme Title
    doc.setFontSize(16)
    doc.setTextColor(...COLORS.primary)
    doc.setFont('helvetica', 'bold')
    doc.text(`Thème : ${theme}`, 20, currentY)

    // Theme Stats
    const themeEntries = entriesByTheme[theme]
    const themeHours = themeEntries.reduce((sum, e) => sum + e.heures, 0)

    doc.setFontSize(10)
    doc.setTextColor(...COLORS.secondary)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total : ${themeHours.toFixed(1)} heures`, 20, currentY + 7)

    currentY += 15

    // Prepare table data for this theme
    // Sort by date
    const sortedEntries = themeEntries.sort((a, b) => a.date.localeCompare(b.date))

    const tableData = sortedEntries.map(entry => [
      new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      entry.projetName,
      entry.taskName,
      `${entry.heures.toFixed(1)}h`,
      entry.description || ''
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Projet', 'Tâche', 'Durée', 'Description']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: COLORS.text,
        lineColor: COLORS.border,
        lineWidth: 0,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: COLORS.lightBg,
        textColor: COLORS.primary,
        fontStyle: 'bold',
        lineWidth: 0,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', textColor: COLORS.primary },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20, fontStyle: 'bold', textColor: COLORS.accent, halign: 'right' },
        4: { cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: COLORS.white
      },
      didDrawCell: function (data) {
        if (data.section === 'body') {
          doc.setDrawColor(...COLORS.border)
          doc.setLineWidth(0.1)
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
        }
      },
      didDrawPage: function (data) {
        // Draw footer on every page
        drawFooter(doc.getCurrentPageInfo().pageNumber)

        // If this is a new page created by autoTable (not the one we added manually), draw header
        if (data.pageNumber > 1 && data.cursor && data.cursor.y === data.settings.startY) {
          drawHeader()
        }
      },
      // Ensure enough margin for header
      margin: { top: 40, bottom: 20 }
    })
  }

  // =====================================
  // SIGNATURE PAGE
  // =====================================

  doc.addPage()
  drawHeader()

  currentY = 50

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('VALIDATION ET SIGNATURES', 20, currentY)
  doc.setDrawColor(...COLORS.accent)
  doc.line(20, currentY + 2, 85, currentY + 2)

  currentY += 20

  const boxWidth = (pageWidth - 60) / 2
  const boxHeight = 50

  // Box 1: Employé
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.5)
  doc.rect(20, currentY, boxWidth, boxHeight)

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.secondary)
  doc.text('Signature de l\'employé', 25, currentY + 10)
  doc.text('Date :', 25, currentY + boxHeight - 8)

  // Box 2: Manager
  doc.rect(20 + boxWidth + 20, currentY, boxWidth, boxHeight)

  doc.text('Signature du responsable', 25 + boxWidth + 20, currentY + 10)
  doc.text('Date :', 25 + boxWidth + 20, currentY + boxHeight - 8)

  drawFooter(doc.getCurrentPageInfo().pageNumber)

  // Save
  const groupName = groupId === 'all' ? 'tous' : groups.find(g => g.id === groupId)?.name || 'export'
  const fileName = `TimeScope_${monthName}_${year}_${groupName}.pdf`
  doc.save(fileName)
}
