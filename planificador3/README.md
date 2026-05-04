# FORMA — Planificador Semanal

App personal para planificación semanal de nutrición y entrenamiento.

## Setup local

1. Instala dependencias:
```
npm install
```

2. Crea un archivo `.env` con tu API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

3. Corre en local:
```
npm run dev
```

Abre http://localhost:5173

## Deploy en Vercel

1. Sube el repo a GitHub (privado)
2. Conecta en vercel.com → "Import Project"
3. En "Environment Variables" añade:
   - Key: `ANTHROPIC_API_KEY`
   - Value: tu API key de Anthropic
4. Deploy → listo

La app solo es accesible para quien tenga la URL.
Para más privacidad, en Vercel puedes activar "Password Protection" en los settings del proyecto (plan gratuito lo incluye).
