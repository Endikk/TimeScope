# TimeScope

A smart time-tracking software that calculates employees' working hours based on the tasks they complete. It helps monitor productivity, optimize workload distribution, and generate accurate time reports automatically.

## Tech Stack

This is a modern web application built with:

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript (strict mode enabled)
- **[TailwindCSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, customizable UI components
- **[React 19](https://react.dev/)** - Latest React with server components

## Project Structure

```
TimeScope/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with navbar
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles with theme variables
├── components/            # React components
│   ├── navbar.tsx        # Navigation component
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/                  # Utility functions
│   └── utils.ts         # cn() helper for className merging
└── public/              # Static assets
```

## Features

✅ **Modern Next.js Setup** - App Router with server components  
✅ **TypeScript Strict Mode** - Full type safety  
✅ **TailwindCSS v4** - Latest styling framework  
✅ **shadcn/ui Components** - Pre-built, customizable UI components  
✅ **Responsive Design** - Mobile-friendly layout  
✅ **Dark Mode Ready** - Theme variables configured  
✅ **Clean Architecture** - Well-organized folder structure  

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Endikk/TimeScope.git
cd TimeScope
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Adding More Components

To add more shadcn/ui components, you can manually create them in `components/ui/` following the same pattern as the existing components. All components use the `cn()` utility for className merging and follow shadcn/ui conventions.

## Customization

### Theme Colors

Edit `app/globals.css` to customize the color scheme. The theme uses CSS variables for easy customization:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... more variables */
}
```

### TailwindCSS Configuration

Modify `tailwind.config.ts` to extend the theme with custom colors, fonts, or other utilities.

## Production Build

Build the application for production:

```bash
npm run build
npm run start
```

The application will be optimized and ready for deployment.

## Deployment

This application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting platform

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
