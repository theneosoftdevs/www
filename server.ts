import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import fsSync from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoint to read dossier markdown files dynamically
app.get("/api/dossier", async (req, res) => {
  try {
    const list = [
      { id: "intro", title: "Introduction et Table des Matières", path: "PROJET_ELECTRIFICATION_IDJWI.md", titleLabel: "Introduction" },
      { id: "part1", title: "Chapitre I : Résumé Exécutif", path: "idjwi_dossier/PARTIE_1_RESUME_EXECUTIF.md", titleLabel: "Chapitre I" },
      { id: "part2", title: "Chapitre II : Présentation du Promoteur", path: "idjwi_dossier/PARTIE_2_PROMOTEUR.md", titleLabel: "Chapitre II" },
      { id: "part3", title: "Chapitre III : Situation de l'île d'Idjwi et besoins réels", path: "idjwi_dossier/PARTIE_3_DIAGNOSTIC.md", titleLabel: "Chapitre III" },
      { id: "part4", title: "Chapitre IV : Justification et Courbe de Charge", path: "idjwi_dossier/PARTIE_4_JUSTIFICATION_DEMANDE.md", titleLabel: "Chapitre IV" },
      { id: "part5", title: "Chapitre V : Spécifications et Ingénierie Solaire", path: "idjwi_dossier/PARTIE_5_TECHNIQUE.md", titleLabel: "Chapitre V" },
      { id: "part6", title: "Chapitre VI : Faisabilité Financière", path: "idjwi_dossier/PARTIE_6_FINANCE.md", titleLabel: "Chapitre VI" },
      { id: "part7", title: "Chapitre VII : Analyse ESG & Gouvernance", path: "idjwi_dossier/PARTIE_7_ESG.md", titleLabel: "Chapitre VII" },
      { id: "part8", title: "Chapitre VIII : Cadre Logique & Chronogramme", path: "idjwi_dossier/PARTIE_8_CADRE_LOGIQUE.md", titleLabel: "Chapitre VIII" },
      { id: "part9", title: "Chapitre IX : Références Bibliographiques", path: "idjwi_dossier/PARTIE_9_REFERENCES.md", titleLabel: "Chapitre IX" },
    ];

    const chapters = [];
    for (const item of list) {
      const fullPath = path.join(process.cwd(), item.path);
      if (fsSync.existsSync(fullPath)) {
        const content = await fs.readFile(fullPath, "utf-8");
        chapters.push({
          id: item.id,
          title: item.title,
          titleLabel: item.titleLabel,
          content: content
        });
      }
    }

    res.json({
      title: "PROJET D'ÉLECTRIFICATION DE L'ÎLE D'IDJWI PAR CENTRALE PHOTOVOLTAÏQUE HYBRIDE",
      subtitle: "Centrale Solaire Photovoltaïque d'Idjwi (1 000 kWc - 500 kWh)",
      chapters: chapters
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erreur de lecture du dossier d'électricité." });
  }
});

// Lazy-loaded Gemini client to prevent startup crashes
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_IF_UNDEFINED",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Custom system instruction for the Idjwi Hybrid Electrification Advisor
const SYSTEM_INSTRUCTION = `Vous êtes l'ingénieur conseil principal et chef de projet pour le "Projet d'Électrification de l'Île d'Idjwi par Système Énergétique Hybride" en République Démocratique du Congo (RDC).
Votre rôle est d'accompagner l'utilisateur dans l'exploration technique, sociale, financière et environnementale de ce projet crucial.

Détails clés du projet pour Idjwi :
- Contexte : Idjwi est une île géante de 340 km² située sur le lac Kivu (RDC), habitée par plus de 300 000 personnes, isolée du réseau national de la SNEL (taux d'accès actuel < 1%).
- Solution technique : Un réseau composé d'un champ d'énergie solaire photovoltaïque de 1 MWc avec stockage intelligent par batteries lithium (500 kWh de stockage par batteries) et armoires de couplage/dispatching de 150 kW CA. Ce dispositif de pointe permet de stabiliser entièrement la distribution réseau sur l'île sans délestages.
- Budget global estimé pour la phase pilote : 285 000 USD (inspiré de la rigueur du projet de gestion des déchets de Goma de 206 660 USD).
- Objectif de raccordement : 5 000 foyers, 15 centres de santé, 50 écoles et 20 coopératives agricoles.
- Impacts : Réduction de la déforestation (alternative aux braises/makala), réfrigération médicale (vaccins), forces motrices industrielles pour le café, commerce nocturne.

Soyez professionnel, précis, respectez les aspects d'ingénierie électro-énergétique et utilisez des termes techniques réalistes (kVA, kWh, kWc, onduleur de synchronisation de réseau, réseau triphasé de distribution, etc.). Répondez de manière structurée et polie, en français.`;

// API Endpoint for Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, mode, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Le message est obligatoire." });
    }

    const ai = getGenAI();
    let modelName = "gemini-3.5-flash";
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    // Apply specific modes as requested by guidelines/metadata
    if (mode === "thinking") {
      modelName = "gemini-3.1-pro-preview";
      config.thinkingConfig = {
        thinkingLevel: "HIGH" // Ensure maximum reasoning for complex planning
      };
      // Do NOT set maxOutputTokens for thinking mode as instructed!
    } else if (mode === "search") {
      modelName = "gemini-3.5-flash";
      config.tools = [{ googleSearch: {} }];
    }

    // Convert history format to system format if history exists
    // The history matches the schema: Array<{ role: "user" | "model", text: string }>
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      });
    }
    
    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    console.log(`Calling Gemini API [Model: ${modelName}, Mode: ${mode}]`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const replyText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
    
    // Check if there was web search grounding information to pass back
    let searchSources: any[] = [];
    try {
      const candidates = (response as any).candidates?.[0];
      const groundingMetadata = candidates?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        searchSources = groundingMetadata.groundingChunks.map((chunk: any) => ({
          title: chunk.web?.title || chunk.title || "Lien de recherche",
          url: chunk.web?.uri || chunk.uri || "#"
        })).filter((item: any) => item.title && item.url);
      }
    } catch (e) {
      console.warn("Failed to parse grounding metadata:", e);
    }

    return res.json({
      text: replyText,
      sources: searchSources,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // Return friendly error message with fallback suggestion
    return res.status(500).json({
      error: error.message || "Une erreur interne de communication avec l'IA est survenue.",
      details: "Assurez-vous que votre clé d'API Gemini est correctement configurée et dispose des crédits d'autorisation requis."
    });
  }
});

// Start express application with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

startServer();
