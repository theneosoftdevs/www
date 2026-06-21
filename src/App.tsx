import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  FileText, 
  BookOpen, 
  Printer, 
  FileDown,
  Send, 
  HelpCircle, 
  ArrowRight, 
  ListRestart, 
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  FileCheck2,
  Share2,
  Copy,
  Check,
  Languages,
  BadgeAlert,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "./types";

interface Chapter {
  id: string;
  title: string;
  titleLabel: string;
  content: string;
}

interface DossierResponse {
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export default function App() {
  const [dossier, setDossier] = useState<DossierResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // View preferences
  const [activeChapterId, setActiveChapterId] = useState<string>("intro");
  const [isContinuousView, setIsContinuousView] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  // Chat advisor integration
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Bonjour ! Je suis l'expert-conseil pour le projet d'électrification d'Idjwi. Demandez-moi des précisions sur le budget de 285 000 USD, le matériel solaire (1 000 kWc), l'impact pour la population locale ou la stratégie de paiement par crédit mobile prépayé !",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Copying state
  const [copiedChapterId, setCopiedChapterId] = useState<string | null>(null);

  // Fetch dossier elements from our Express file-system API on mount
  useEffect(() => {
    async function loadDossier() {
      try {
        setLoading(true);
        const res = await fetch("/api/dossier");
        if (!res.ok) {
          throw new Error("Impossible de charger les fichiers de l'électrification rurale.");
        }
        const data = await res.json();
        setDossier(data);
        if (data.chapters && data.chapters.length > 0) {
          setActiveChapterId(data.chapters[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setErrorState(err.message || "Une erreur est survenue lors de l'accès au serveur.");
      } finally {
        setLoading(false);
      }
    }
    loadDossier();
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  // Handle printing/converting to PDF
  const handlePrint = () => {
    // If the user wants to print the entire dossier, we recommend switching to continuous view first,
    // but we can also trigger a temporary continuous rendering then trigger window.print().
    window.print();
  };

  // Convert markdown structure to clean HTML styled for Microsoft Word (.doc) with Times New Roman and elegant graphics
  const markdownToHtmlForDoc = (markdown: string, chapterId: string = '') => {
    const lines = markdown.split('\n');
    let html = '';
    
    let currentList: string[] = [];
    let currentTable: { headers: string[], rows: string[][] } | null = null;
    let inTableBody = false;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        html += '<ul style="margin-top: 0; margin-bottom: 10pt; padding-left: 20px; list-style-type: disc; font-family: \'Times New Roman\', Times, serif;">';
        currentList.forEach(item => {
          html += `<li style="margin-bottom: 4pt; color: #1c1917; font-size: 11pt; line-height: 1.5; font-family: 'Times New Roman', Times, serif;">${parseInlines(item)}</li>`;
        });
        html += '</ul>';
        currentList = [];
      }
    };

    const flushTable = () => {
      if (currentTable) {
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 14pt; margin-bottom: 14pt; font-family: \'Times New Roman\', Times, serif; border: 1.5px solid #1c1917;">';
        html += '<thead style="background-color: #181c20; color: #ffffff;"><tr style="background-color: #181c20;">';
        currentTable.headers.forEach(h => {
          html += `<th style="border: 1.5px solid #1c1917; padding: 10px; font-weight: bold; text-align: left; font-size: 11.5pt; color: #ffffff; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">${parseInlines(h)}</th>`;
        });
        html += '</tr></thead>';
        html += '<tbody>';
        currentTable.rows.forEach(row => {
          html += '<tr>';
          row.forEach(cell => {
            html += `<td style="border: 1.5px solid #1c1917; padding: 10px; font-size: 11pt; color: #1c1917; vertical-align: top; font-family: 'Times New Roman', Times, serif;">${parseInlines(cell)}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        currentTable = null;
      }
    };

    const parseInlines = (text: string) => {
      let t = text;
      // Bold **text**
      t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic *text*
      t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Code `text`
      t = t.replace(/`([^`]+)`/g, '<code style="font-family: Consolas, monospace; background-color: #f5f5f4; padding: 2px 4px; border-radius: 3px; font-size: 10pt; color: #18181b;">$1</code>');
      return t;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip RD Congo system headers to guarantee a beautiful clean flow
      if (line.startsWith('# REPUBLIQUE DEMOCRATIQUE DU CONGO') || line.startsWith('## ENSEIGNEMENT SUPERIEUR ET') || line.startsWith('### BP 50 GOMA')) {
        continue;
      }

      // Check for code blocks
      if (line.startsWith('```')) {
        flushList();
        flushTable();
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeBlockText = codeBlockLines.join('\n');
          
          // Intercept the chronogramme (Gantt chart) and convert it to a majestic, fully MS Word-compatible HTML diagram!
          if (codeBlockText.includes('N° |') || codeBlockText.includes('Étapes et Activités') || codeBlockText.includes('M1')) {
            html += `
<div style="margin: 24pt auto; max-width: 100%; border: 2px solid #181c20; padding: 16px; background-color: #ffffff; border-radius: 6px; font-family: 'Times New Roman', Times, serif;">
  <p style="text-align: center; font-weight: bold; font-size: 11.5pt; color: #181c20; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif;">
    Figure 3 : Diagramme de Gantt de la Réalisation du Chantier d'Idjwi (Sur 12 mois de déploiement)
  </p>
  <table style="width: 100%; border-collapse: collapse; font-size: 9pt; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
    <thead>
      <tr style="background-color: #181c20; color: #ffffff; border-bottom: 2px solid #181c20;" bgcolor="#181c20">
        <th style="padding: 6px 8px; border: 1.5px solid #181c20; text-align: left; width: 44%; color: #ffffff; font-weight: bold; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Étapes & Activités Opérationnelles</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M1</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M2</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M3</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M4</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M5</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M6</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M7</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M8</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M9</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M10</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M11</th>
        <th style="padding: 6px 1px; border: 1.5px solid #181c20; text-align: center; color: #ffffff; font-weight: bold; width: 4.5%; background-color: #181c20; font-family: 'Times New Roman', Times, serif;">M12</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f4f4f5; font-weight: bold;" bgcolor="#f4f4f5">
        <td style="padding: 6px 8px; border: 1.5px solid #181c20; color: #181c20; font-family: 'Times New Roman', Times, serif;">Étape 1 : Autorisations & Administration Locale</td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">1.1 Signature officielle ARE d'Idjwi</td>
        <td style="background-color: #27272a; border: 1.5px solid #181c20;" bgcolor="#27272a"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">1.2 Recrutement & Bureau coordination Bugarula</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #27272a; border: 1.5px solid #181c20;" bgcolor="#27272a"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr style="background-color: #f4f4f5; font-weight: bold;" bgcolor="#f4f4f5">
        <td style="padding: 6px 8px; border: 1.5px solid #181c20; color: #181c20; font-family: 'Times New Roman', Times, serif;">Étape 2 : Achat & Transport Matériel technique (barges)</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">2.1 Commande de matériel, transit et douane Goma</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #4b5563; border: 1.5px solid #181c20;" bgcolor="#4b5563"></td>
        <td style="background-color: #4b5563; border: 1.5px solid #181c20;" bgcolor="#4b5563"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">2.2 Location des navires (barges sur le Lac)</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #4b5563; border: 1.5px solid #181c20;" bgcolor="#4b5563"></td>
        <td style="background-color: #4b5563; border: 1.5px solid #181c20;" bgcolor="#4b5563"></td>
        <td style="background-color: #4b5563; border: 1.5px solid #181c20;" bgcolor="#4b5563"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr style="background-color: #fafafa; font-weight: bold;" bgcolor="#fafafa">
        <td style="padding: 6px 8px; border: 1.5px solid #181c20; color: #18181b; font-family: 'Times New Roman', Times, serif;">Étape 3 : Explications & installation des compteurs</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">3.1 Diffusion radio rurale et causeries</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">3.2 Livraison des 5 000 compteurs prépayés</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr style="background-color: #f4f4f5; font-weight: bold;" bgcolor="#f4f4f5">
        <td style="padding: 6px 8px; border: 1.5px solid #181c20; color: #18181b; font-family: 'Times New Roman', Times, serif;">Étape 4 : Travaux physiques & Lignes (12 kms)</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="background-color: #a1a1aa; border: 1.5px solid #181c20;" bgcolor="#a1a1aa"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">4.1 Terrassement et bétonnage</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">4.2 Pose de 350 poteaux et tirage câbles</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="background-color: #52525b; border: 1.5px solid #181c20;" bgcolor="#52525b"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr style="background-color: #fafafa; font-weight: bold;" bgcolor="#fafafa">
        <td style="padding: 6px 8px; border: 1.5px solid #181c20; color: #1c1917; font-family: 'Times New Roman', Times, serif;">Étape 5 : Couplage, Tests de sécurité & Mise en service</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #d4d4d8; border: 1.5px solid #181c20;" bgcolor="#d4d4d8"></td>
        <td style="background-color: #d4d4d8; border: 1.5px solid #181c20;" bgcolor="#d4d4d8"></td>
        <td style="background-color: #d4d4d8; border: 1.5px solid #181c20;" bgcolor="#d4d4d8"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">5.1 Connexion des panneaux & batteries (BESS)</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
        <td style="border: 1.5px solid #181c20;"></td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; border: 1.5px solid #181c20; color: #374151; font-family: 'Times New Roman', Times, serif;">5.2 Allumage général "Idjwi Mwinda" (Lumière)</td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="border: 1.5px solid #181c20;"></td>
        <td style="background-color: #71717a; border: 1.5px solid #181c20;" bgcolor="#71717a"></td>
      </tr>
    </tbody>
  </table>
</div>
`;
          } else if (codeBlockText.includes('PANNEAUX SOLAIRES PHOTOVOLTAÏQUES') || codeBlockText.includes('ONDULEURS DE RÉSEAU') || codeBlockText.includes('BATTERIES INDUSTRIELLES')) {
            // II.2 ANALYSE DE L'OFFRE ET COMPOSANTS DU SYSTÈME ÉNERGÉTIQUE
            html += `
<div style="margin: 24pt auto; max-width: 100%; border: 2.5px solid #181c20; padding: 1px; background-color: #ffffff; border-radius: 6px; font-family: 'Times New Roman', Times, serif;">
  <p style="text-align: center; font-weight: bold; font-size: 11.5pt; color: #181c20; margin-top: 12px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; letter-spacing: 0.5px;">
    Figure 2 : Schéma Structurel Synoptique du Système Énergétique Hybride d'Idjwi
  </p>
  <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; border: 2px solid #181c20;" bgcolor="#fafaf9">
    <tr>
      <td colspan="3" align="center" style="padding: 12px; background-color: #181c20; color: #ffffff; border-bottom: 2pt solid #181c20;" bgcolor="#181c20">
        <strong style="font-size: 12.5pt; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; font-family: 'Times New Roman', Times, serif;">1. SOURCE DE PRODUCTION : CHAMP DE CAPTEURS SOLAIRES PHOTOVOLTAÏQUES</strong><br/>
        <span style="font-size: 10.5pt; color: #f4f4f5; font-family: 'Times New Roman', Times, serif;">Puissance Crête : 1 MWc (1 000 kWc) – Modules solaires standards à haut rendement</span>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="center" style="padding: 10px; border-bottom: 1.5px dashed #181c20;">
        <span style="font-size: 16pt; color: #181c20;">▼</span>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="center" style="padding: 12px; background-color: #52525b; color: #ffffff; border-bottom: 2pt solid #181c20;" bgcolor="#52525b">
        <strong style="font-size: 12.5pt; text-transform: uppercase; color: #ffffff; font-family: 'Times New Roman', Times, serif;">2. CENTRALE DE CONVERSION : GRANDS ONDULEURS DE CHANTIER</strong><br/>
        <span style="font-size: 10.5pt; color: #fafafa; font-family: 'Times New Roman', Times, serif;">Puissance Active : 1 000 kW (Convertisseur en courant alternatif Triphasé direct 400V 50Hz)</span>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="center" style="padding: 10px;">
        <span style="font-size: 16pt; color: #181c20;">▼</span>
      </td>
    </tr>
    <tr>
      <td width="46%" style="padding: 14px; background-color: #f4f4f5; border: 1.5px solid #181c20; vertical-align: top;" bgcolor="#f4f4f5">
        <strong style="font-size: 11pt; color: #181c20; display: block; text-transform: uppercase; margin-bottom: 6px; font-family: 'Times New Roman', Times, serif;">3. UNITÉ DE STOCKAGE DU COURANT (BESS)</strong>
        <span style="font-size: 10pt; color: #1c1917; line-height: 1.4; display: block; font-family: 'Times New Roman', Times, serif;">
          • <strong>Technologie :</strong> Accumulateurs et batteries de stockage standard<br/>
          • <strong>Capacité Réseau :</strong> 500 kWh utiles de puissance stockable<br/>
          • <strong>Durabilité :</strong> Longue autonomie résistant à + de 10 ans d'activité nocturne journalière<br/>
          • <strong>Rôle d'appui :</strong> Fournit l'alimentation sans panne de l'île chaque nuit (de 18h à 6h)
        </span>
      </td>
      <td width="8%" align="center" style="vertical-align: middle; font-size: 16pt; color: #181c20; font-weight: bold;">◀ ▶</td>
      <td width="46%" style="padding: 14px; background-color: #ffffff; border: 1.5px solid #181c20; vertical-align: top;" bgcolor="#ffffff">
        <strong style="font-size: 11pt; color: #27272a; display: block; text-transform: uppercase; margin-bottom: 6px; font-family: 'Times New Roman', Times, serif;">4. ARMOIRE DE COUPLAGE & DISPATCHING</strong>
        <span style="font-size: 10pt; color: #1c1917; line-height: 1.4; display: block; font-family: 'Times New Roman', Times, serif;">
          • <strong>Régulation :</strong> Ajustement dynamique constant de la tension et de la fréquence de ligne<br/>
          • <strong>Compensation :</strong> Contrôleur automatique de déphasage et système d'antibrouillard réseau<br/>
          • <strong>Technologie Client :</strong> Base de serveurs pour compteurs Pay-As-You-Go raccordés<br/>
          • <strong>Réseau Local :</strong> Transport direct tension de 12 km de lignes aériennes saines
        </span>
      </td>
    </tr>
  </table>
</div>
`;
          } else if (codeBlockText.includes('ABONNEMENT PRÉCOCE PAYG') || codeBlockText.includes("Acompte initial d'abonnement") || codeBlockText.includes("Priorité de branchement")) {
            // V.3 REDEVANCE ET COOPÉRATION AVEC LES COMMERCES PAR SYSTÈME PAY-AS-YOU-GO
            html += `
<div style="margin: 24pt auto; max-width: 100%; border: 2.5px solid #181c20; padding: 1px; background-color: #ffffff; border-radius: 6px; font-family: 'Times New Roman', Times, serif;">
  <p style="text-align: center; font-weight: bold; font-size: 11.5pt; color: #181c20; margin-top: 12px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; letter-spacing: 0.5px;">
    Figure 5 : Cycle de Fonctionnement et de Recouvrement Solidaire par Système Pay-As-You-Go
  </p>
  <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px; font-family: 'Times New Roman', Times, serif; background-color: #fafaf9; border: 1.5px solid #181c20; padding: 12px; border-radius: 4px;" bgcolor="#fafaf9">
    <tr>
      <td align="center" style="padding: 12px; background-color: #181c20; color: #ffffff; border: 1.5px solid #181c20; border-radius: 4px;" bgcolor="#181c20">
        <strong style="font-size: 11.5pt; text-transform: uppercase; color: #ffffff; font-family: 'Times New Roman', Times, serif;">ÉTAPE 1 : ABONNEMENT CONCERTÉ AVEC ENGAGEMENT LOCAL</strong><br/>
        <span style="font-size: 10pt; color: #f4f4f5; font-family: 'Times New Roman', Times, serif;">Le commerçant ou le foyer fait sa demande légale d'abonnement auprès d'Idjwi Solar Power.</span>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 2px; font-size: 14pt; color: #181c20; font-weight: bold; line-height: 1;">▼</td>
    </tr>
    <tr>
      <td align="center" style="padding: 12px; background-color: #f4f4f5; color: #181c20; border: 1.5px solid #181c20; border-radius: 4px;" bgcolor="#f4f4f5">
        <strong style="font-size: 11.5pt; text-transform: uppercase; color: #181c20; font-family: 'Times New Roman', Times, serif;">ÉTAPE 2 : VERSEMENT DE L'ACOMPTE INITIAL DE SÛRETÉ (TRÉSORERIE)</strong><br/>
        <span style="font-size: 10pt; color: #1c1917; font-family: 'Times New Roman', Times, serif;">Un dépôt de garantie précoce est payé par le client pour contribuer à l'acquisition d'actifs du micro-réseau.</span>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 2px; font-size: 14pt; color: #181c20; font-weight: bold; line-height: 1;">▼</td>
    </tr>
    <tr>
      <td align="center" style="padding: 12px; background-color: #ffffff; color: #181c20; border: 1.5px solid #181c20; border-radius: 4px;" bgcolor="#ffffff">
        <strong style="font-size: 11.5pt; text-transform: uppercase; color: #181c20; font-family: 'Times New Roman', Times, serif;">ÉTAPE 3 : RACCORDEMENT PRIORITAIRE ET POSE DE COMPTEUR SMART</strong><br/>
        <span style="font-size: 10pt; color: #1c1917; font-family: 'Times New Roman', Times, serif;">Les techniciens locaux installent en priorité le compteur prépayé individuel relié aux serveurs de contrôle.</span>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 2px; font-size: 14pt; color: #181c20; font-weight: bold; line-height: 1;">▼</td>
    </tr>
    <tr>
      <td align="center" style="padding: 12px; background-color: #f4f4f5; color: #27272a; border: 1.5px solid #181c20; border-radius: 4px;" bgcolor="#f4f4f5">
        <strong style="font-size: 11.5pt; text-transform: uppercase; color: #27272a; font-family: 'Times New Roman', Times, serif;">ÉTAPE 4 : CRÉDIT MOBILE ET EXPULSION ZÉRO POUR TOUS</strong><br/>
        <span style="font-size: 10pt; color: #1c1917; font-family: 'Times New Roman', Times, serif;">Le client recharge l'énergie à sa guise via Mobile Money (Airtel Money, M-Pesa). Consommation au plus juste du besoin réel.</span>
      </td>
    </tr>
  </table>
</div>
`;
          } else {
            html += `<pre style="font-family: Consolas, monospace; background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px; font-size: 10pt; line-height: 1.4; color: #334155; margin-top: 10pt; margin-bottom: 10pt; white-space: pre-wrap;">${codeBlockText}</pre>`;
          }
          codeBlockLines = [];
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(lines[i]);
        continue;
      }

      // Handle tables
      if (line.startsWith('|')) {
        flushList();
        const parts = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (!currentTable) {
          currentTable = { headers: parts, rows: [] };
        } else {
          const isDivider = parts.every(p => p.startsWith(':') || p.endsWith(':') || p.startsWith('-'));
          if (isDivider) {
            inTableBody = true;
          } else {
            currentTable.rows.push(parts);
          }
        }
        continue;
      } else {
        flushTable();
      }

      // Header tags
      if (line.startsWith('# ')) {
        flushList();
        html += `<h1 style="font-family: 'Times New Roman', Times, serif; font-size: 18pt; color: #111111; margin-top: 22pt; margin-bottom: 12pt; border-bottom: 2pt solid #111111; padding-bottom: 5px; text-transform: uppercase; font-weight: bold;">${parseInlines(line.substring(2))}</h1>`;
      } else if (line.startsWith('## ')) {
        flushList();
        html += `<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; color: #1c1917; margin-top: 18pt; margin-bottom: 10pt; font-weight: bold;">${parseInlines(line.substring(3))}</h2>`;
      } else if (line.startsWith('### ')) {
        flushList();
        html += `<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; font-weight: bold; color: #27272a; margin-top: 14pt; margin-bottom: 8pt;">${parseInlines(line.substring(4))}</h3>`;
      } else if (line.startsWith('#### ')) {
        flushList();
        html += `<h4 style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-weight: bold; color: #1c1917; margin-top: 12pt; margin-bottom: 6pt; border-left: 3px solid #27272a; padding-left: 8px;">${parseInlines(line.substring(5))}</h4>`;
      } else if (line === '---') {
        flushList();
        html += '<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />';
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        currentList.push(line.substring(2));
      } else if (line === '') {
        flushList();
      } else {
        flushList();
        html += `<p style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-top: 0; margin-bottom: 10pt; color: #1c1917;">${parseInlines(line)}</p>`;
      }
    }

    flushList();
    flushTable();

    // Append beautiful diagrams and figures at the end of matching sections
    if (chapterId === 'intro') {
      html += `
<div style="margin: 24pt auto; max-width: 650px; border: 2.5px solid #181c20; background-color: #ffffff; padding: 18px; font-family: 'Times New Roman', Times, serif; border-radius: 6px;">
  <p style="text-align: center; font-weight: bold; font-size: 11.5pt; color: #181c20; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Times New Roman', Times, serif;">
    Figure 1 : Schéma Synoptique du Micro-Réseau Hybride Solaire photovoltaïque d'Idjwi
  </p>
  <table style="width: 100%; border: none; border-collapse: separate; border-spacing: 10px; margin: 0 auto; font-family: 'Times New Roman', Times, serif;">
    <tr>
      <td style="width: 32%; border: 1.5px solid #181c20; background-color: #f4f4f5; padding: 12px; text-align: center; border-radius: 4px; vertical-align: middle;">
        <strong style="font-size: 10.5pt; color: #181c20; display: block;">Production Solaire</strong>
        <span style="font-size: 13pt; font-weight: bold; color: #3f3f46; display: block; margin: 5px 0;">1 MWc (1 000 kWc)</span>
        <span style="font-size: 8.5pt; color: #4b5563; line-height: 1.3; display: block;">Champ photovoltaïque au sol de 3 100 panneaux en silicium monocristallin</span>
      </td>
      <td style="width: 5%; font-size: 18pt; color: #181c20; text-align: center; vertical-align: middle; border: none;">➔</td>
      <td style="width: 31%; border: 1.5px solid #181c20; background-color: #ffffff; padding: 12px; text-align: center; border-radius: 4px; vertical-align: middle;">
        <strong style="font-size: 10.5pt; color: #27272a; display: block;">Dispatching & Stockage</strong>
        <span style="font-size: 11pt; font-weight: bold; color: #52525b; display: block; margin: 5px 0;">Armoire de couplage intelligente</span>
        <div style="border-top: 1px dashed #cbd5e1; margin: 6px 0; padding-top: 6px;">
          <strong style="font-size: 9pt; color: #52525b; display: block;">Batteries de Transition (BESS)</strong>
          <span style="font-size: 11.5pt; font-weight: bold; color: #27272a; display: block;">500 kWh Lithium-ion</span>
        </div>
      </td>
      <td style="width: 5%; font-size: 18pt; color: #181c20; text-align: center; vertical-align: middle; border: none;">➔</td>
      <td style="width: 32%; border: 1.5px solid #181c20; background-color: #f4f4f5; padding: 12px; text-align: center; border-radius: 4px; vertical-align: middle;">
        <strong style="font-size: 10.5pt; color: #181c20; display: block;">Réseau Local Triphasé</strong>
        <span style="font-size: 13pt; font-weight: bold; color: #3f3f46; display: block; margin: 5px 0;">12 kms de lignes</span>
        <span style="font-size: 8.5pt; color: #4b5563; line-height: 1.3; display: block;">Transport 400V aérien vers 5 000 compteurs raccordés à crédit mobile</span>
      </td>
    </tr>
  </table>
  <p style="text-align: center; font-size: 9pt; color: #4b5563; font-style: italic; margin-top: 12px; margin-bottom: 0; font-family: 'Times New Roman', Times, serif;">
    Source : Spécification d'ingénierie électrique d'Idjwi (UCS-Goma & Idjwi Solar Power Corp, 2026)
  </p>
</div>
`;
    } else if (chapterId === 'part2') {
      html += `
<div style="margin: 24pt auto; max-width: 650px; border: 1.5px solid #181c20; background-color: #ffffff; padding: 18px; font-family: 'Times New Roman', Times, serif; border-radius: 6px;">
  <p style="text-align: center; font-weight: bold; font-size: 11pt; color: #181c20; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Times New Roman', Times, serif;">
    Figure 2 : Profil journalier de décharge et de recharge de la batterie de 500 kWh
  </p>
  <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #181c20; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif;">
    <thead>
      <tr style="background-color: #181c20; color: #ffffff;">
        <th style="padding: 8px 10px; text-align: center; width: 22%; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Période de la journée</th>
        <th style="padding: 8px 10px; text-align: center; width: 25%; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Statut du Système BESS</th>
        <th style="padding: 8px 10px; text-align: left; width: 53%; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Visualisation de la Charge utile des Batteries (500 kWh)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">00h00 - 06h00</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; color: #27272a; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Décharge lente BESS</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 35%; background-color: #52525b; height: 14px; border: none; padding: 0; line-height: 14px; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold;">35%</td>
              <td style="width: 65%; background-color: #e2e8f0; height: 14px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #475569; display: block; margin-top: 3px; font-family: 'Times New Roman', Times, serif;">Alimentation nocturne continue des 15 centres de santé (maternité) et éclairage public.</span>
        </td>
      </tr>
      <tr style="background-color: #f4f4f5;">
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">06h00 - 12h00</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; color: #27272a; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Production & Recharge</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 70%; background-color: #71717a; height: 14px; border: none; padding: 0; line-height: 14px; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold;">70%</td>
              <td style="width: 30%; background-color: #e2e8f0; height: 14px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #475569; display: block; margin-top: 3px; font-family: 'Times New Roman', Times, serif;">Production solaire directe de 1 MWc. Excédents envoyés vers les batteries.</span>
        </td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">12h00 - 18h00</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; color: #181c20; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Autonomie maximale</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 100%; background-color: #181c20; height: 14px; border: none; padding: 0; line-height: 14px; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold;">100% (PLEIN)</td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #475569; display: block; margin-top: 3px; font-family: 'Times New Roman', Times, serif;">Batteries à pleine charge (500 kWh stockés). Les surplus soutiennent les moulins à café.</span>
        </td>
      </tr>
      <tr style="background-color: #f4f4f5;">
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">18h00 - 24h00</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; text-align: center; color: #27272a; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Pic de Charge Sociale</td>
        <td style="padding: 8px 10px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 60%; background-color: #52525b; height: 14px; border: none; padding: 0; line-height: 14px; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold;">60%</td>
              <td style="width: 40%; background-color: #e2e8f0; height: 14px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #475569; display: block; margin-top: 3px; font-family: 'Times New Roman', Times, serif;">Transit sur le stockage de l'énergie accumulée pour le retour au foyer des 5 000 ménages.</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
    } else if (chapterId === 'part4') {
      html += `
<div style="margin: 24pt auto; max-width: 650px; border: 2.5px solid #181c20; padding: 18px; background-color: #ffffff; border-radius: 6px; font-family: 'Times New Roman', Times, serif;">
  <p style="text-align: center; font-weight: bold; font-size: 11pt; color: #181c20; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif;">
    Figure 4 : Répartition Proportionnelle du Budget d'Investissement d'Idjwi (Total 285 000 USD)
  </p>
  <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
    <thead>
      <tr style="background-color: #181c20; color: #ffffff;">
        <th style="padding: 8px; text-align: left; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; width: 45%; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Composante Budgétaire</th>
        <th style="padding: 8px; text-align: right; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; width: 20%; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Montant (USD)</th>
        <th style="padding: 8px; text-align: left; border: 1.5px solid #181c20; color: #ffffff; font-weight: bold; width: 35%; font-family: 'Times New Roman', Times, serif; background-color: #181c20;">Part relative du Budget (%)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="padding: 8px; border: 1.5px solid #181c20; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">Équipements Énergétiques (Solaire/Batteries)</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; text-align: right; font-weight: bold; color: #181c20; font-family: 'Times New Roman', Times, serif;">172 000 USD</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 60%; background-color: #181c20; height: 12px; border: none; padding: 0;"></td>
              <td style="width: 40%; background-color: #e2e8f0; height: 12px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #4b5563; display: block; margin-top: 2px; font-family: 'Times New Roman', Times, serif;">60.35 %</span>
        </td>
      </tr>
      <tr style="background-color: #f4f4f5;">
        <td style="padding: 8px; border: 1.5px solid #181c20; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">Fonctionnement, Administration & OPEX</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; text-align: right; font-weight: bold; color: #181c20; font-family: 'Times New Roman', Times, serif;">47 520 USD</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 17%; background-color: #3f3f46; height: 12px; border: none; padding: 0;"></td>
              <td style="width: 83%; background-color: #e2e8f0; height: 12px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #4b5563; display: block; margin-top: 2px; font-family: 'Times New Roman', Times, serif;">16.67 %</span>
        </td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="padding: 8px; border: 1.5px solid #181c20; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">Construction de Lignes & Génie Civil</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; text-align: right; font-weight: bold; color: #181c20; font-family: 'Times New Roman', Times, serif;">46 580 USD</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 16%; background-color: #52525b; height: 12px; border: none; padding: 0;"></td>
              <td style="width: 84%; background-color: #e2e8f0; height: 12px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #4b5563; display: block; margin-top: 2px; font-family: 'Times New Roman', Times, serif;">16.35 %</span>
        </td>
      </tr>
      <tr style="background-color: #f4f4f5;">
        <td style="padding: 8px; border: 1.5px solid #181c20; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #1c1917;">Logistique Lacustre, Motos & Transport</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; text-align: right; font-weight: bold; color: #181c20; font-family: 'Times New Roman', Times, serif;">18 900 USD</td>
        <td style="padding: 8px; border: 1.5px solid #181c20; font-family: 'Times New Roman', Times, serif;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 7%; background-color: #71717a; height: 12px; border: none; padding: 0;"></td>
              <td style="width: 93%; background-color: #e2e8f0; height: 12px; border: none; padding: 0;"></td>
            </tr>
          </table>
          <span style="font-size: 8pt; color: #4b5563; display: block; margin-top: 2px; font-family: 'Times New Roman', Times, serif;">6.63 %</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
    }

    return html;
  };

  // Build and download the complete project as a standard Microsoft Word (.doc) folder
  const handleDownloadDoc = () => {
    if (!dossier) return;

    let docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${dossier.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 8.5in 11in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11.5pt;
      line-height: 1.5;
      color: #1c1917;
    }
    h1 {
      font-family: 'Times New Roman', Times, serif;
      font-size: 20pt;
      color: #111111;
      margin-top: 24pt;
      margin-bottom: 12pt;
      border-bottom: 2px solid #111111;
      padding-bottom: 6px;
      font-weight: bold;
    }
    h2 {
      font-family: 'Times New Roman', Times, serif;
      font-size: 15pt;
      color: #1c1917;
      margin-top: 18pt;
      margin-bottom: 10pt;
      font-weight: bold;
    }
    h3 {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12.5pt;
      font-weight: bold;
      color: #27272a;
      margin-top: 14pt;
      margin-bottom: 8pt;
    }
    p {
      margin-top: 0;
      margin-bottom: 10pt;
      text-align: justify;
      font-family: 'Times New Roman', Times, serif;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <!-- COVER PAGE -->
  <div style="text-align: center; padding: 40px; border: 3px double #181c20; background-color: #ffffff; margin-bottom: 50px; font-family: 'Times New Roman', Times, serif;">
    <div style="font-size: 11pt; font-weight: bold; color: #27272a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;">
      RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
    </div>
    <div style="font-size: 10pt; color: #44403c; text-transform: uppercase; margin-bottom: 50px; font-family: 'Times New Roman', Times, serif;">
      PROJET MULTI-RÉSEAUX D'ÉNERGIE PROPRE RURALE
    </div>
    
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 28pt; font-weight: bold; color: #111111; line-height: 1.2; margin-bottom: 20px;">
      ${dossier.title}
    </div>
    
    <div style="width: 150px; border-top: 3px solid #181c20; margin: 20px auto;"></div>
    
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 15pt; font-style: italic; color: #4b5563; margin-bottom: 80px;">
      ${dossier.subtitle}
    </div>
    
    <div style="background-color: #f4f4f5; border: 1.5px solid #181c20; border-radius: 8px; padding: 20px; text-align: left; max-width: 500px; margin: 0 auto; font-family: 'Times New Roman', Times, serif;">
      <h3 style="margin-top: 0; color: #111111; font-family: 'Times New Roman', Times, serif; font-weight: bold;">Fiche d'identification technique</h3>
      <table style="width: 100%; border: none; margin: 0; font-family: 'Times New Roman', Times, serif;">
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Zone géographique:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Île d'Idjwi, Province du Sud-Kivu, RDC</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Puissance centrale:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">1 MWc (1 000 kWc) Photovoltaïque</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Capacité de stockage:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">500 kWh de stockage par batteries lithium</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Budget d'investissement:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">285 000 USD (Dossier Modèle)</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Raccordement cible:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">5 000 foyers, 15 centres de santé, 50 écoles</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 0; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Régime de tarification:</td>
          <td style="border: none; padding: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">Prépaiement par crédit mobile prépayé</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 100px; font-size: 10pt; color: #6b7280; font-family: 'Times New Roman', Times, serif;">
      Document d'analyse financière et d'ingénierie • Version réglementaire Juin 2026
    </div>
  </div>

  <div class="page-break"></div>

  <!-- TABLE OF CONTENTS -->
  <div style="padding: 20px; margin-bottom: 40px; font-family: 'Times New Roman', Times, serif;">
    <h2 style="font-family: 'Times New Roman', Times, serif; color: #111111; border-bottom: 2px solid #111111; padding-bottom: 6px; font-weight: bold;">Table des matières</h2>
    <table style="width: 100%; border: none; font-family: 'Times New Roman', Times, serif;">
      ${dossier.chapters.map((ch, idx) => `
        <tr style="border-bottom: 1px dotted #e5e7eb;">
          <td style="border: none; padding: 10px 0; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11pt; color: #1c1917;">
            Partie ${idx + 1} : ${ch.title}
          </td>
          <td style="border: none; padding: 10px 0; text-align: right; color: #4b5563; font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-weight: bold;">
            Page ${idx * 2 + 2}
          </td>
        </tr>
      `).join('')}
    </table>
  </div>

  <div class="page-break"></div>
`;
    // Add each chapter content
    dossier.chapters.forEach((chapter, index) => {
      if (index > 0) {
        docHtml += `<div class="page-break"></div>`;
      }
      docHtml += `
        <div style="color: #52525b; font-size: 9.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dotted #e5e7eb; padding-bottom: 4px; margin-bottom: 12pt; font-family: 'Times New Roman', Times, serif;">
          Dossier Électrification Idjwi • Chapitre ${index + 1}
        </div>
        ${markdownToHtmlForDoc(chapter.content, chapter.id)}
      `;
    });

    docHtml += `
</body>
</html>
`;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Dossier_Faisabilite_Electrification_Idjwi_2026.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy single chapter markdown to clipboard
  const handleCopyChapter = (chapter: Chapter) => {
    navigator.clipboard.writeText(chapter.content);
    setCopiedChapterId(chapter.id);
    setTimeout(() => setCopiedChapterId(null), 2500);
  };

  // Send message to Gemini-based advisor API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setSendingMessage(true);

    const userMessage: Message = {
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        text: msg.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          mode: "search", // use search-enabled tools for maximum precision
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error("L'assistant n'a pas pu traiter la demande.");
      }

      const data = await response.json();

      const modelMessage: Message = {
        role: "model",
        text: data.text,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "model",
        text: "Désolé, j'ai rencontré un problème de connexion au serveur d'analyse d'Idjwi. Vérifiez que votre réseau fonctionne correctement.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Custom inline Markdown parser to guarantee maximum visual quality without external bloat
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    let currentList: string[] = [];
    let currentTable: { headers: string[], rows: string[][] } | null = null;
    let inTableBody = false;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 my-4 space-y-2 text-stone-700 leading-relaxed text-sm">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlines(item) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushTable = (key: string) => {
      if (currentTable) {
        elements.push(
          <div key={`table-container-${key}`} className="overflow-x-auto my-6 border border-stone-200 rounded-xl shadow-xs no-print">
            <table className="w-full text-left text-xs border-collapse divide-y divide-stone-200">
              <thead className="bg-stone-50 text-stone-700 font-semibold uppercase tracking-wider">
                <tr>
                  {currentTable.headers.map((h, idx) => (
                    <th key={idx} className="p-4 border-b border-stone-200" dangerouslySetInnerHTML={{ __html: parseInlines(h) }} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white text-stone-600">
                {currentTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-stone-50/50 transition">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-4 align-top" dangerouslySetInnerHTML={{ __html: parseInlines(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        // Printable simple clean layout of the table for @media print
        elements.push(
          <table key={`table-print-${key}`} className="hidden print:table w-full text-left text-xs border border-stone-300 my-4 border-collapse">
            <thead>
              <tr className="bg-stone-100 font-bold border-b border-stone-300">
                {currentTable.headers.map((h, idx) => (
                  <th key={idx} className="p-2 border border-stone-300" dangerouslySetInnerHTML={{ __html: parseInlines(h) }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-stone-200">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 border border-stone-300 align-top" dangerouslySetInnerHTML={{ __html: parseInlines(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        currentTable = null;
        inTableBody = false;
      }
    };

    const parseInlines = (text: string) => {
      let html = text;
      // Bold **text**
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Single *italic* (replaces non-italic styling for nicer presentation)
      html = html.replace(/\*(.*?)\*/g, '<em class="text-stone-900 italic">$1</em>');
      // Inline equation or code segment `code`
      html = html.replace(/`([^`]+)`/g, '<code class="font-mono text-stone-900 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 text-xs font-semibold">$1</code>');
      return html;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip the root country title to clean rendering
      if (line.startsWith('# REPUBLIQUE DEMOCRATIQUE DU CONGO') || line.startsWith('## ENSEIGNEMENT SUPERIEUR ET') || line.startsWith('### BP 50 GOMA')) {
        continue;
      }

      // Check for code blocks
      if (line.startsWith('```')) {
        flushList(`cb-prep-${i}`);
        flushTable(`cb-prep-${i}`);
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeBlockText = codeBlockLines.join('\n');
          
          // Check for chronogramme (Gantt chart)
          if (codeBlockText.includes('N° |') || codeBlockText.includes('Étapes et Activités') || codeBlockText.includes('M1')) {
            elements.push(
              <div key={`gantt-${i}`} className="my-8 overflow-hidden rounded-2xl border border-stone-300 bg-white p-6 shadow-xs no-print">
                <p className="text-center font-bold text-xs text-stone-950 uppercase tracking-wider mb-4 font-sans">
                  Figure 3 : Diagramme de Gantt du Chantier (Sur 12 mois de déploiement)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse border border-stone-800 font-sans">
                    <thead>
                      <tr className="bg-stone-950 text-white border-b border-stone-800">
                        <th className="p-2 border border-stone-300 font-semibold" style={{ width: '44%' }}>Étapes &amp; Activités Opérationnelles</th>
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <th key={idx} className="p-1 border border-stone-300 text-center font-semibold" style={{ width: '4.5%' }}>M{idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-stone-700">
                      <tr className="bg-stone-100 font-semibold text-stone-900">
                        <td className="p-2 border border-stone-300">Étape 1 : Autorisations &amp; Administration Locale</td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        {Array.from({ length: 10 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">1.1 Signature officielle ARE d'Idjwi</td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 11 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">1.2 Recrutement &amp; Bureau coordination Bugarula</td>
                        <td className="border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 10 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      
                      <tr className="bg-stone-100 font-semibold text-stone-900">
                        <td className="p-2 border border-stone-300">Étape 2 : Achat &amp; Transport Matériel technique (barges)</td>
                        <td className="border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        {Array.from({ length: 6 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">2.1 Commande de matériel, transit et douane Goma</td>
                        <td className="border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 9 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">2.2 Location des navires (barges sur le Lac)</td>
                        {Array.from({ length: 3 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 6 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>

                      <tr className="bg-stone-100 font-semibold text-stone-900">
                        <td className="p-2 border border-stone-300">Étape 3 : Explications &amp; installation des compteurs</td>
                        {Array.from({ length: 3 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        {Array.from({ length: 2 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">3.1 Diffusion radio rurale et causeries</td>
                        {Array.from({ length: 3 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 6 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">3.2 Livraison des 5 000 compteurs prépayés</td>
                        {Array.from({ length: 6 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 2 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>

                      <tr className="bg-stone-100 font-semibold text-stone-900">
                        <td className="p-2 border border-stone-300">Étape 4 : Travaux physiques &amp; Lignes (12 kms)</td>
                        {Array.from({ length: 4 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="border border-stone-300"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">4.1 Terrassement et bétonnage</td>
                        {Array.from({ length: 4 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        {Array.from({ length: 5 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">4.2 Pose de 350 poteaux et tirage câbles</td>
                        {Array.from({ length: 7 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="border border-stone-300"></td>
                      </tr>

                      <tr className="bg-stone-100 font-semibold text-stone-900">
                        <td className="p-2 border border-stone-300">Étape 5 : Couplage, Tests de sécurité &amp; Mise en service</td>
                        {Array.from({ length: 9 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                        <td className="bg-stone-800 border border-stone-300"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">5.1 Connexion des panneaux &amp; batteries (BESS)</td>
                        {Array.from({ length: 9 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="bg-stone-600 border border-stone-300"></td>
                        <td className="border border-stone-300"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 pl-6 text-stone-600">5.2 Allumage général "Idjwi Mwinda"</td>
                        {Array.from({ length: 11 }).map((_, idx) => <td key={idx} className="border border-stone-300"></td>)}
                        <td className="bg-stone-600 border border-stone-300"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          } else if (codeBlockText.includes('PANNEAUX SOLAIRES PHOTOVOLTAÏQUES') || codeBlockText.includes('ONDULEURS DE RÉSEAU') || codeBlockText.includes('BATTERIES INDUSTRIELLES')) {
            // II.2 ANALYSE DE L'OFFRE ET COMPOSANTS DU SYSTÈME ÉNERGÉTIQUE
            elements.push(
              <div key={`system-${i}`} className="my-8 overflow-hidden rounded-2xl border border-stone-300 bg-white p-6 shadow-sm font-sans no-print">
                <p className="text-center font-bold text-xs text-stone-950 uppercase tracking-wider mb-4">
                  Figure 2 : Synoptique Technique de l'Ingénierie de la Centrale Sol-Batterie
                </p>
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-stone-300 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Source Primaire (Champ Photovoltaïque)</p>
                    <p className="text-base font-bold text-stone-950 mt-1">Champ Solaire : 1 MWc (1 000 kWc)</p>
                    <p className="text-xs text-stone-600 mt-1">Modules photovoltaïques monocristallins classiques montés au sol</p>
                  </div>
                  <div className="flex justify-center text-stone-400 font-bold text-md">▼</div>
                  <div className="bg-stone-100/80 border border-stone-300 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-stone-850 uppercase tracking-wider">Conversion Énergétique</p>
                    <p className="text-base font-bold text-stone-950 mt-1">Onduleurs de Réseau : 1 000 kW</p>
                    <p className="text-xs text-stone-600 mt-1">Transformation vers Courant Alternatif triphasé standard</p>
                  </div>
                  <div className="flex justify-center text-stone-400 font-bold text-md">▼</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 border border-stone-250 rounded-xl p-4">
                      <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Régulation &amp; Stockage Nocturne</p>
                      <p className="text-sm font-bold text-stone-950 mt-1">Stockage par Batteries (BESS)</p>
                      <p className="text-xs text-stone-600 mt-1">500 kWh utiles • Batteries de stockage stationnaires standard</p>
                    </div>
                    <div className="bg-stone-50 border border-stone-250 rounded-xl p-4">
                      <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Supervision &amp; Injection</p>
                      <p className="text-sm font-bold text-stone-950 mt-1">Armoire de Dispatching &amp; Réseau</p>
                      <p className="text-xs text-stone-600 mt-1">Stabilisation par couplage de tension intelligent • 12 km de lignes aériennes</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (codeBlockText.includes('ABONNEMENT PRÉCOCE PAYG') || codeBlockText.includes("Acompte initial d'abonnement") || codeBlockText.includes("Priorité de branchement")) {
            // V.3 REDEVANCE ET COOPÉRATION AVEC LES COMMERCES PAR SYSTÈME PAY-AS-YOU-GO
            elements.push(
              <div key={`payg-${i}`} className="my-8 overflow-hidden rounded-2xl border border-stone-300 bg-white p-6 shadow-sm font-sans no-print">
                <p className="text-center font-bold text-xs text-stone-950 uppercase tracking-wider mb-6">
                  Figure 5 : Cycle de Fonctionnement et de Recouvrement Solidaire par Système Pay-As-You-Go
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  <div className="bg-stone-50 border border-stone-250 rounded-xl p-4 text-center flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">1</div>
                      <p className="text-xs font-bold text-stone-850 uppercase">Souscription</p>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">Dépôt formel de demande d'abonnement au service électrique</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-250 rounded-xl p-4 text-center flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">2</div>
                      <p className="text-xs font-bold text-stone-850 uppercase">Acompte initial</p>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">Versement d'avance de trésorerie de sûreté pour l'achat de matériel</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-250 rounded-xl p-4 text-center flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">3</div>
                      <p className="text-xs font-bold text-stone-850 uppercase">Raccordement</p>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">Pose prioritaire de la dérivation 12 km et installateur de compteur Smart</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-250 rounded-xl p-4 text-center flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">4</div>
                      <p className="text-xs font-bold text-stone-850 uppercase">Pay-As-You-Go</p>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">Achat à crédit via Mobile Money et activation autonome par l'usager</p>
                  </div>
                </div>
              </div>
            );
          } else {
            elements.push(
              <pre key={`code-${i}`} className="my-4 p-4 font-mono text-xs text-stone-700 bg-stone-100 rounded-xl overflow-x-auto ring-1 ring-stone-200">
                <code>{codeBlockText}</code>
              </pre>
            );
          }
          codeBlockLines = [];
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(lines[i]);
        continue;
      }

      // Handle table generation
      if (line.startsWith('|')) {
        flushList(`table-prep-${i}`);
        const parts = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (!currentTable) {
          currentTable = { headers: parts, rows: [] };
        } else {
          const isDivider = parts.every(p => p.startsWith(':') || p.endsWith(':') || p.startsWith('-'));
          if (isDivider) {
            inTableBody = true;
          } else {
            currentTable.rows.push(parts);
          }
        }
        continue;
      } else {
        flushTable(`nl-${i}`);
      }

      // Handle headers elements
      if (line.startsWith('# ')) {
        flushList(`h1-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl md:text-2xl font-bold font-sans text-stone-950 mt-6 mb-4 pb-2 border-b border-stone-200 uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: parseInlines(line.substring(2)) }} />
        );
      } else if (line.startsWith('## ')) {
        flushList(`h2-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg md:text-xl font-bold font-sans text-stone-900 mt-6 mb-3 leading-tight border-b border-stone-100 pb-1" dangerouslySetInnerHTML={{ __html: parseInlines(line.substring(3)) }} />
        );
      } else if (line.startsWith('### ')) {
        flushList(`h3-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-semibold font-sans text-stone-850 mt-4 mb-2 uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: parseInlines(line.substring(4)) }} />
        );
      } else if (line.startsWith('#### ')) {
        flushList(`h4-${i}`);
        elements.push(
          <h4 key={`h4-${i}`} className="text-[13px] font-bold text-stone-900 mt-4 mb-2 flex items-center gap-2 border-l-2 border-stone-950 pl-2" dangerouslySetInnerHTML={{ __html: parseInlines(line.substring(5)) }} />
        );
      }
      // Divider horizontal row
      else if (line === '---') {
        flushList(`hr-${i}`);
        elements.push(<hr key={`hr-${i}`} className="my-6 border-t border-stone-200 no-print" />);
      }
      // Bullet items
      else if (line.startsWith('* ') || line.startsWith('- ')) {
        currentList.push(line.substring(2));
      }
      // Empty lines
      else if (line === '') {
        flushList(`empty-${i}`);
      }
      // Standard text paragraphs
      else {
        flushList(`p-${i}`);
        elements.push(
          <p key={`p-${i}`} className="text-sm text-stone-700 leading-relaxed font-serif my-3 text-justify" dangerouslySetInnerHTML={{ __html: parseInlines(line) }} />
        );
      }
    }

    // Terminate leftover elements
    flushList('final');
    flushTable('final');

    return <div className="space-y-1">{elements}</div>;
  };

  // Compute filtering chapters based on light search term if defined
  const filteredChapters = useMemo(() => {
    if (!dossier) return [];
    if (!searchText.trim()) return dossier.chapters;
    const term = searchText.toLowerCase();
    return dossier.chapters.filter(ch => 
      ch.title.toLowerCase().includes(term) || 
      ch.content.toLowerCase().includes(term)
    );
  }, [dossier, searchText]);

  // Find the selected chapter
  const currentChapter = dossier?.chapters.find(c => c.id === activeChapterId) || dossier?.chapters[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-950 selection:text-white flex flex-col relative">
      
      {/* Dynamic PDF Print CSS Injections */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: Georgia, serif !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-page-break {
            page-break-before: always !important;
          }
          /* Custom clean headers for standard PDF look */
          .print-header-label {
            display: block !important;
            text-align: center;
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
            margin-bottom: 2rem;
            padding-bottom: 0.5rem;
            color: #555;
          }
        }
      `}</style>

      {/* Top Header Section */}
      <header className="no-print bg-white border-b border-stone-200/80 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-stone-100 border border-stone-200 p-2 rounded-xl text-stone-800">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-stone-900 font-sans md:text-base">Dossier de Faisabilité d'Idjwi</h1>
            <p className="text-[10px] text-stone-500 font-medium font-mono uppercase tracking-wider">Centrale Solaire & Distribution • 1 MWc</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Complete display mode switcher */}
          <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-0.5 text-xs font-semibold mr-2">
            <button 
              onClick={() => setIsContinuousView(false)} 
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${!isContinuousView ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Chapitre par Chapitre
            </button>
            <button 
              onClick={() => setIsContinuousView(true)} 
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${isContinuousView ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Ouvrage Entier (Pdf)
            </button>
          </div>

          <button 
            onClick={handleDownloadDoc}
            className="flex items-center gap-2 bg-stone-900 hover:bg-black active:scale-95 transition text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            title="Télécharger le dossier complet au format Microsoft Word (.doc)"
          >
            <FileDown className="h-3.8 w-3.8" />
            <span className="hidden sm:inline">Télécharger (.doc)</span>
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white hover:bg-stone-100 text-stone-950 border border-stone-300 active:scale-95 transition px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="h-3.8 w-3.8" />
            <span className="hidden sm:inline">Créer PDF / Imprimer</span>
          </button>
        </div>
      </header>

      {/* Error state fallback */}
      {errorState && (
        <div className="p-8 max-w-xl mx-auto my-auto text-center space-y-4 no-print">
          <BadgeAlert className="h-12 w-12 text-stone-950 mx-auto" />
          <h2 className="text-lg font-bold text-stone-950">Erreur de serveurs de fichiers</h2>
          <p className="text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-xl p-4">{errorState}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-850 transition"
          >
            Réessayer de charger
          </button>
        </div>
      )}

      {/* Main interface skeleton loaders */}
      {loading && !errorState && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24 no-print">
          <Loader2 className="h-10 w-10 text-stone-900 animate-spin" />
          <p className="text-sm text-stone-500 font-medium font-sans">Chargement sécurisé des chapitres du dossier d'Idjwi...</p>
        </div>
      )}

      {/* Core split layout */}
      {dossier && !loading && !errorState && (
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 md:px-6 py-6 gap-6 print-container">

          {/* Left Sidebar Document selector */}
          <aside className="no-print lg:w-80 shrink-0 space-y-4">
            
            {/* Search outline and info */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-stone-900" />
                <span>Plan de l'Ouvrage</span>
              </h2>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Voici le dossier complet de planification validé en <span className="font-semibold text-stone-700">Juin 2026</span>. Pas de jargon, français simplifié, et données vérifiées par la Banque Mondiale et l'OMS.
              </p>
              
              {/* Fact panel indicators */}
              <div className="border-t border-stone-200 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Budget Global :</span>
                  <span className="font-mono font-bold text-stone-950">285 000 USD</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Champ Solaire :</span>
                  <span className="font-mono font-bold text-stone-950">1 000 kWc</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Durée Construction :</span>
                  <span className="font-mono font-bold text-stone-950">12 Mois</span>
                </div>
              </div>
            </div>

            {/* List select of chapters */}
            <nav className="bg-white border border-stone-200/90 rounded-2xl p-3 shadow-xs space-y-1">
              {dossier.chapters.map((ch, idx) => {
                const isActive = activeChapterId === ch.id && !isContinuousView;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setIsContinuousView(false);
                      setActiveChapterId(ch.id);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-stone-950 text-white border border-stone-950' 
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-stone-400'}`} />
                      <span className="truncate pr-1">{ch.title}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-450 shrink-0" />
                  </button>
                );
              })}
            </nav>

            {/* Print & Download advice block */}
            <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 text-xs text-stone-900 space-y-3 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-950">
                <Info className="h-4 w-4" />
                <span>Format de Téléchargement</span>
              </div>
              
              <p className="leading-relaxed text-[11px] text-stone-600">
                Téléchargez l'ouvrage d'électrification d'Idjwi complet au format <span className="font-bold text-stone-800">Microsoft Word (.doc)</span> avec sa page de garde officielle et sa table des matières.
              </p>

              <button 
                onClick={handleDownloadDoc}
                className="w-full py-2 bg-stone-950 hover:bg-black text-white rounded-xl font-bold transition text-[11px] text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Télécharger en Word (.doc)</span>
              </button>

              <div className="border-t border-stone-200 my-2 pt-2">
                <p className="leading-relaxed text-[10px] text-stone-500">
                  Pour créer un livre PDF propre, activez l'affichage "Ouvrage Entier" puis cochez <span className="font-semibold">"Imprimer les arrière-plans"</span> lors de l'impression.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Reader pane */}
          <main className="flex-1 bg-white border border-stone-200/95 rounded-3xl p-6 md:p-10 shadow-xs min-w-0 print-container">
            
            {/* If Single Chapter view mode */}
            {!isContinuousView && currentChapter && (
              <article className="space-y-6">
                
                {/* Print Header template */}
                <div className="hidden print:block text-center text-xs text-stone-400 italic mb-8 pb-3 border-b border-stone-200">
                  {dossier.title} • {currentChapter.title}
                </div>

                <div className="border-b border-stone-100 pb-4 flex items-center justify-between gap-4 no-print">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-stone-600 tracking-wider">Dossier Solaire Idjwi</span>
                    <h2 className="text-base font-bold text-stone-900 font-sans">{currentChapter.title}</h2>
                  </div>
                  
                  {/* Share/Copy current markdown page */}
                  <button 
                    onClick={() => handleCopyChapter(currentChapter)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-xs font-semibold select-none border border-stone-200/40 transition active:scale-95 cursor-pointer"
                  >
                    {copiedChapterId === currentChapter.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-stone-900" />
                        <span className="text-stone-900">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copier .MD</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="prose prose-stone max-w-none">
                  {renderMarkdown(currentChapter.content)}
                </div>

                {/* Footer Navigation within chapters */}
                <div className="no-print pt-8 border-t border-stone-100 flex items-center justify-between">
                  <button 
                    disabled={dossier.chapters.indexOf(currentChapter) === 0}
                    onClick={() => {
                      const prevIdx = dossier.chapters.indexOf(currentChapter) - 1;
                      if (prevIdx >= 0) {
                        setActiveChapterId(dossier.chapters[prevIdx].id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    Chapitre Précédent
                  </button>

                  <button 
                    disabled={dossier.chapters.indexOf(currentChapter) === dossier.chapters.length - 1}
                    onClick={() => {
                      const nextIdx = dossier.chapters.indexOf(currentChapter) + 1;
                      if (nextIdx < dossier.chapters.length) {
                        setActiveChapterId(dossier.chapters[nextIdx].id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                  >
                    Chapitre Suivant
                  </button>
                </div>
              </article>
            )}

            {/* If continuous view (Full book rendering for easy printing / read all) */}
            {isContinuousView && (
              <div className="space-y-16">
                
                {/* Official Cover Page layout for print and continuous view */}
                <div className="py-12 md:py-24 text-center space-y-6 border-b-2 border-stone-300 print-cover">
                  <span className="text-xs font-mono font-bold tracking-widest text-stone-950 uppercase bg-stone-100 border border-stone-300 px-3 py-1.5 rounded-lg">
                    Gouvernement du Sud-Kivu • Université Catholique Sapientia
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl font-extrabold text-stone-950 font-sans tracking-tight leading-none pt-4 max-w-3xl mx-auto">
                    {dossier.title}
                  </h1>
                  
                  <p className="text-sm md:text-lg font-medium text-stone-600 max-w-2xl mx-auto leading-relaxed">
                    {dossier.subtitle}
                  </p>
                  
                  <div className="pt-8 text-xs text-stone-400 space-y-1 font-mono uppercase tracking-wider">
                    <div>Auteurs : Ingénieurs de l'UCS-Goma & Chefs Coutumiers d'Idjwi</div>
                    <div>Statut : Prêt pour Investisseurs • Juin 2026</div>
                  </div>
                </div>

                {/* Print map of all chapters sequentially */}
                {dossier.chapters.map((ch, idx) => (
                  <div key={ch.id} className="print-page-break space-y-6 Scroll-mt-6">
                    <div className="text-stone-400 text-[10px] font-mono border-b border-stone-100 pb-2 flex items-center justify-between mb-4 no-print">
                      <span>LIVRE COMPLET • {ch.titleLabel}</span>
                      <button 
                        onClick={() => handleCopyChapter(ch)}
                        className="text-stone-950 hover:underline font-semibold"
                      >
                        {copiedChapterId === ch.id ? "Copié !" : "Copier le code markdown de ce chapitre"}
                      </button>
                    </div>

                    <div className="prose prose-stone max-w-none">
                      {renderMarkdown(ch.content)}
                    </div>

                    {idx < dossier.chapters.length - 1 && (
                      <hr className="my-12 border-t border-stone-200 no-print" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      )}

      {/* Floating Interactive AI Advisor */}
      <div className="no-print">
        {/* Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-6 right-6 z-50 bg-stone-950 hover:bg-black text-white p-3.5 md:p-4 rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95 group cursor-pointer border border-stone-800"
          title="Consulter l'IA Conseillère du Projet"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 animate-pulse text-yellow-350" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-neutral-400 rounded-full border border-stone-950 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-neutral-300 rounded-full border border-stone-950" />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-36 transition-all duration-300 ease-out font-sans text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pr-1">
            {chatOpen ? "Fermer l'assistant" : "Expert Conseil IA"}
          </span>
        </button>

        {/* Chat Window with AnimatePresence */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-white border border-stone-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-stone-950 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-stone-800 p-1.5 rounded-lg border border-stone-700">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-sans leading-none">Expert Conseil Idjwi</h3>
                    <p className="text-[9px] text-stone-400 font-mono mt-1 leading-none flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                      <span>Solaire Hybride • En ligne</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-stone-400 hover:text-white transition p-1 hover:bg-stone-900 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-stone-900 text-white rounded-br-none"
                          : "bg-white text-stone-850 border border-stone-200 rounded-bl-none shadow-3xs"
                      }`}
                    >
                      <p className="whitespace-pre-line font-sans">{msg.text}</p>
                      
                      {/* Search groundings references if retrieved */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 space-y-1">
                          <p className="text-[10px] font-bold text-gray-500">Sources vérifiées :</p>
                          {msg.sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-stone-600 hover:underline block truncate"
                            >
                              • {src.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                
                {/* Loader showing active generation state */}
                {sendingMessage && (
                  <div className="flex flex-col items-start max-w-[85%] mr-auto">
                    <div className="bg-white text-stone-850 border border-stone-200 rounded-2xl rounded-bl-none p-3 shadow-3xs flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 text-stone-850 animate-spin" />
                      <span className="text-xs text-stone-500 font-sans italic selection:bg-transparent">L'IA parcourt l'étude Idjwi...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestions block for speedy onboarding */}
              <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto text-[10px] select-none scrollbar-none shrink-0">
                {[
                  { text: "Option photovoltaïque", q: "Quelle est la puissance du champ photovoltaïque ?" },
                  { text: "Budget & CAPEX", q: "Quel est le budget total et l'estimation du CAPEX ?" },
                  { text: "Système PAYG", q: "Comment le système de crédit mobile Pay-As-You-Go fonctionne ?" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(item.q);
                    }}
                    className="border border-stone-250 bg-stone-50 hover:bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              {/* Messaging Input bar form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 flex gap-2 bg-white shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez une question technique..."
                  className="flex-1 bg-stone-100 hover:bg-stone-150/60 focus:bg-white text-xs border border-stone-200/50 rounded-xl px-3 py-2.5 outline-none focus:ring-1.5 focus:ring-stone-900 transition font-sans"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="bg-stone-950 text-white rounded-xl p-2.5 hover:bg-black transition active:scale-95 disabled:opacity-30 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
