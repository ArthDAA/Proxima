import React, { useState, useEffect, useRef } from "react";
import { Conversation, Message } from "@/entities/all";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users, ArrowLeft, Lightbulb, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import MediationMessage from "../components/mediation/MediationMessage";
import MediationPhaseCard from "../components/mediation/MediationPhaseCard";

export default function MediationChatPage() {
  const navigate = useNavigate();
  const [mediation, setMediation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPhase, setCurrentPhase] = useState("private");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mediationId = params.get('id');
    if (mediationId) {
      loadMediation(mediationId);
    } else {
      navigate(createPageUrl("Mediations"));
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMediation = async (mediationId) => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const mediationData = await Conversation.get(mediationId);
      setMediation(mediationData);

      // Vérifier si l'utilisateur est autorisé
      if (!mediationData.participants || !mediationData.participants.includes(currentUser.email)) {
        navigate(createPageUrl("Mediations"));
        return;
      }

      // Déterminer la phase actuelle
      if (mediationData.status === "group_discussion") {
        setCurrentPhase("group");
      } else {
        setCurrentPhase("private");
      }

      // Charger les messages appropriés
      await loadMessages(mediationId, currentUser.email);
    } catch (error) {
      console.error("Erreur chargement médiation:", error);
      navigate(createPageUrl("Mediations"));
    }
  };

  const loadMessages = async (mediationId, userEmail) => {
    try {
      let msgs;
      if (currentPhase === "group") {
        // Messages de groupe visibles par tous
        msgs = await Message.filter({
          conversation_id: mediationId,
          is_confidential: false
        }, "-created_date");
      } else {
        // Messages privés de l'utilisateur + messages IA non confidentiels
        msgs = await Message.filter({
          conversation_id: mediationId
        }, "-created_date");
        
        msgs = msgs.filter(msg => 
          msg.sender === "ai" || 
          (msg.sender === "user" && msg.sender_email === userEmail)
        );
      }
      
      setMessages(msgs.reverse());
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !mediation) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      // Ajouter le message utilisateur
      const newUserMessage = await Message.create({
        conversation_id: mediation.id,
        sender: "user",
        content: userMessage,
        sender_email: user.email,
        is_confidential: currentPhase === "private"
      });

      setMessages(prev => [...prev, newUserMessage]);

      // Générer la réponse IA selon la phase
      let aiResponse;
      if (currentPhase === "private") {
        aiResponse = await generatePrivateResponse(userMessage);
      } else {
        aiResponse = await generateGroupResponse(userMessage);
      }

      // Ajouter la réponse IA
      const aiMessage = await Message.create({
        conversation_id: mediation.id,
        sender: "ai",
        content: aiResponse,
        is_confidential: false
      });

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }

    setIsLoading(false);
  };

  const generatePrivateResponse = async (userMessage) => {
    const recentMessages = messages.slice(-10);
    const context = recentMessages.map(msg => 
      `${msg.sender === "user" ? user.full_name || "Utilisateur" : "Médiateur"}: ${msg.content}`
    ).join("\n");

    return await InvokeLLM({
      prompt: `Tu es un médiateur professionnel bienveillant. Tu es actuellement dans une phase PRIVÉE avec ${user.full_name || "l'utilisateur"}.

Contexte de la médiation:
- Sujet: ${mediation.subject}
- Participants: ${mediation.participants?.length || 0} personnes
- Phase: Expression privée des points de vue

Historique récent:
${context}

Nouveau message: ${userMessage}

IMPORTANTES RÈGLES:
1. Cette conversation est PRIVÉE et CONFIDENTIELLE
2. Aide la personne à exprimer ses sentiments et sa version des faits
3. Pose des questions pour clarifier la situation
4. Identifie les besoins non exprimés et les émotions
5. Si la personne semble prête, suggère de passer à l'analyse de groupe
6. Reste neutre et bienveillant

Réponds de manière empathique et professionnelle.`
    });
  };

  const generateGroupResponse = async (userMessage) => {
    return await InvokeLLM({
      prompt: `Tu es un médiateur professionnel animant une discussion de groupe.

Contexte:
- Sujet: ${mediation.subject}
- Phase: Discussion de groupe
- Message de ${user.full_name || "Participant"}: ${userMessage}

RÈGLES DE MÉDIATION:
1. Maintiens le respect entre tous les participants
2. Recadre si quelqu'un devient agressif
3. Aide à formuler les besoins de chacun
4. Propose des solutions concrètes
5. Encourage l'écoute mutuelle

Réponds en tant que médiateur facilitateur.`
    });
  };

  const generateAnalysis = async () => {
    if (!mediation || isLoading) return;
    
    setIsLoading(true);

    try {
      // Récupérer tous les messages privés de tous les participants
      const allMessages = await Message.filter({
        conversation_id: mediation.id,
        is_confidential: true
      });

      const participantViews = {};
      allMessages.forEach(msg => {
        if (msg.sender === "user") {
          if (!participantViews[msg.sender_email]) {
            participantViews[msg.sender_email] = [];
          }
          participantViews[msg.sender_email].push(msg.content);
        }
      });

      const analysis = await InvokeLLM({
        prompt: `Tu es un médiateur professionnel. Analyse cette situation de conflit et propose une synthèse neutre et des solutions.

Sujet du conflit: ${mediation.subject}

Points de vue exprimés en privé:
${Object.entries(participantViews).map(([email, messages]) => 
  `Participant ${email}:\n${messages.join('\n')}`
).join('\n\n')}

ANALYSE DEMANDÉE:
1. Synthèse objective de la situation
2. Besoins identifiés de chaque partie
3. Points de convergence possibles
4. Solutions concrètes proposées
5. Plan d'action pour résoudre le conflit

Reste neutre et bienveillant. Propose des solutions gagnant-gagnant.`,
        response_json_schema: {
          type: "object",
          properties: {
            situation_summary: { type: "string" },
            identified_needs: { type: "array", items: { type: "string" } },
            convergence_points: { type: "array", items: { type: "string" } },
            proposed_solutions: { type: "array", items: { type: "string" } },
            action_plan: { type: "string" }
          }
        }
      });

      const analysisText = `## 📊 Analyse de la médiation

**Synthèse de la situation :**
${analysis.situation_summary}

**Besoins identifiés :**
${analysis.identified_needs.map(need => `• ${need}`).join('\n')}

**Points de convergence :**
${analysis.convergence_points.map(point => `• ${point}`).join('\n')}

**Solutions proposées :**
${analysis.proposed_solutions.map(solution => `• ${solution}`).join('\n')}

**Plan d'action :**
${analysis.action_plan}

---

**Je propose maintenant de passer à la discussion de groupe où tous les participants pourront réagir à cette analyse et construire ensemble une solution.**`;

      // Sauvegarder l'analyse
      await Conversation.update(mediation.id, {
        ai_analysis: analysisText,
        status: "group_discussion"
      });

      const analysisMessage = await Message.create({
        conversation_id: mediation.id,
        sender: "ai",
        content: analysisText,
        is_confidential: false
      });

      setMessages(prev => [...prev, analysisMessage]);
      setCurrentPhase("group");
      setMediation(prev => ({ ...prev, status: "group_discussion" }));
    } catch (error) {
      console.error("Erreur analyse:", error);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mediation) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Mediations"))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {mediation.title}
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {mediation.subject}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              className={currentPhase === "private" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-purple-100 text-purple-800"
              }
            >
              {currentPhase === "private" ? "Phase privée" : "Discussion groupe"}
            </Badge>
            <div className="flex items-center gap-1 text-sm" 
                 style={{ color: 'var(--muted-foreground)' }}>
              <Users className="w-4 h-4" />
              {mediation.participants?.length || 0}
            </div>
          </div>
        </div>
      </div>

      <MediationPhaseCard currentPhase={currentPhase} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MediationMessage 
            key={message.id} 
            message={message} 
            currentUser={user}
            currentPhase={currentPhase}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Actions & Input */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        {currentPhase === "private" && messages.length > 3 && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <Button
              onClick={generateAnalysis}
              disabled={isLoading}
              className="w-full"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Générer l'analyse et passer au groupe
            </Button>
          </div>
        )}

        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={currentPhase === "private" 
                ? "Exprimez votre point de vue..." 
                : "Participez à la discussion..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)'
              }}
            />
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}