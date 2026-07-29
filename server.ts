import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint para gerador de Plano de Aula via Gemini API
  app.post('/api/generate-syllabus', async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Tema é obrigatório' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          syllabus: `📌 ROTEIRO E PLANO DE AULA T&D CALL CENTER
Tema: ${topic}
Duração Sugerida: 4 horas

MÓDULO 1: Conceito e Regras de Negócio (1h)
- Visão geral das atualizações
- Impacto na operação de atendimento e nos KPIs (TMA, CSAT, FCR)

MÓDULO 2: Navegação Prática em Homologação (2h)
- Treinamento guiado no sistema
- Simulação de casos de borda e exceções de clientes

MÓDULO 3: Fixação e Avaliação (1h)
- Roleplay em duplas e teste prático com nota mínima 85%`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é um especialista em Treinamento e Desenvolvimento (T&D) de Call Center.
Crie um roteiro/plano de aula detalhado, prático e objetivo para uma turma de operadores sobre o tema: "${topic}".
Inclua:
1. Módulos e Carga Horária sugerida
2. Objetivos pedagógicos
3. Atividades práticas de Roleplay / Simulação no sistema
4. Critérios de Avaliação e Indicadores de Sucesso (TMA, CSAT, FCR).`
      });

      res.json({ syllabus: response.text });
    } catch (err: any) {
      console.error('Erro na API do Gemini:', err);
      res.status(500).json({ error: err.message || 'Erro ao processar roteiro com IA' });
    }
  });

  // Vite middleware em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor T&D Call Center rodando na porta ${PORT}`);
  });
}

startServer();
