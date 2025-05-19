"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Badge } from "@/components/ui/badge"

// Define the example interaction type
interface ExampleInteraction {
  question: string
  answer: string
  category: "definition" | "procedure" | "document"
}

export function ExampleAIInteractions() {
  const { t } = useLanguage()
  const [currentExample, setCurrentExample] = useState(0)
  
  // Example interactions in both English and French
  const exampleInteractions: Record<string, ExampleInteraction[]> = {
    en: [
      {
        question: "What are the requirements for registering a business in Cameroon?",
        answer: "To register a business in Cameroon, you need to complete the following steps:\n\n1. Prepare articles of incorporation\n2. Notarize the documents with a public notary\n3. Register with the tax authority (Direction Générale des Impôts)\n4. Obtain a business license from the Ministry of Commerce\n5. Register with the social security office (CNPS)\n\nThe process typically takes 10-15 business days and costs approximately 50,000-100,000 XAF depending on the type of business entity.",
        category: "procedure"
      },
      {
        question: "What is 'mise en demeure' in Cameroonian law?",
        answer: "'Mise en demeure' in Cameroonian law is a formal notice sent to a debtor demanding the fulfillment of an obligation. It serves as an official warning before legal action is taken.\n\nThis notice must:\n- Be in writing\n- Clearly state the obligation to be fulfilled\n- Set a reasonable deadline for compliance\n- Mention potential legal consequences\n\nAfter a mise en demeure is sent, the recipient has the specified time to comply before facing potential court proceedings.",
        category: "definition"
      },
      {
        question: "Can you analyze this rental agreement and tell me if there are any concerning clauses?",
        answer: "I can analyze rental agreements and identify potentially concerning clauses. When you upload a document, I'll check for issues such as:\n\n- Excessive security deposit requirements\n- Unreasonable termination clauses\n- Maintenance responsibilities that unfairly burden the tenant\n- Clauses that violate Cameroonian housing laws\n- Penalties or fees that may be unenforceable\n\nI'll provide a detailed analysis with references to relevant legal provisions in Cameroonian law.",
        category: "document"
      }
    ],
    fr: [
      {
        question: "Quelles sont les exigences pour enregistrer une entreprise au Cameroun?",
        answer: "Pour enregistrer une entreprise au Cameroun, vous devez suivre les étapes suivantes:\n\n1. Préparer les statuts de l'entreprise\n2. Faire notarier les documents par un notaire public\n3. S'enregistrer auprès de la Direction Générale des Impôts\n4. Obtenir une licence commerciale du Ministère du Commerce\n5. S'inscrire à la Caisse Nationale de Prévoyance Sociale (CNPS)\n\nLe processus prend généralement 10 à 15 jours ouvrables et coûte environ 50 000 à 100 000 XAF selon le type d'entité commerciale.",
        category: "procedure"
      },
      {
        question: "Qu'est-ce qu'une 'mise en demeure' dans le droit camerounais?",
        answer: "La 'mise en demeure' dans le droit camerounais est un avis formel envoyé à un débiteur exigeant l'exécution d'une obligation. Elle sert d'avertissement officiel avant qu'une action en justice ne soit engagée.\n\nCet avis doit:\n- Être écrit\n- Indiquer clairement l'obligation à remplir\n- Fixer un délai raisonnable pour s'y conformer\n- Mentionner les conséquences juridiques potentielles\n\nAprès l'envoi d'une mise en demeure, le destinataire dispose du temps spécifié pour s'y conformer avant de faire face à d'éventuelles poursuites judiciaires.",
        category: "definition"
      },
      {
        question: "Pouvez-vous analyser ce contrat de location et me dire s'il y a des clauses préoccupantes?",
        answer: "Je peux analyser les contrats de location et identifier les clauses potentiellement préoccupantes. Lorsque vous téléchargez un document, je vérifie les problèmes tels que:\n\n- Exigences excessives de caution\n- Clauses de résiliation déraisonnables\n- Responsabilités d'entretien qui pèsent injustement sur le locataire\n- Clauses qui violent les lois camerounaises sur le logement\n- Pénalités ou frais qui pourraient être inapplicables\n\nJe fournirai une analyse détaillée avec des références aux dispositions légales pertinentes du droit camerounais.",
        category: "document"
      }
    ]
  }

  // Get the current language
  const currentLanguage = useLanguage().currentLanguage || "en"
  
  // Get examples for the current language
  const examples = exampleInteractions[currentLanguage] || exampleInteractions.en

  // Handle navigation between examples
  const handlePrevious = () => {
    setCurrentExample((prev) => (prev === 0 ? examples.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentExample((prev) => (prev === examples.length - 1 ? 0 : prev + 1))
  }

  // Get category badge text
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "definition":
        return currentLanguage === "en" ? "Legal Definition" : "Définition Juridique"
      case "procedure":
        return currentLanguage === "en" ? "Legal Procedure" : "Procédure Juridique"
      case "document":
        return currentLanguage === "en" ? "Document Analysis" : "Analyse de Document"
      default:
        return category
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-primary">
            {currentLanguage === "en" ? "Try our AI Assistant" : "Essayez notre Assistant IA"}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {getCategoryBadge(examples[currentExample].category)}
          </Badge>
        </div>
        <CardDescription>
          {currentLanguage === "en" 
            ? "See how our AI can help with your legal questions" 
            : "Découvrez comment notre IA peut vous aider avec vos questions juridiques"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="mt-1 bg-background p-1.5 rounded-full">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {currentLanguage === "en" ? "You" : "Vous"}
              </p>
              <p className="text-sm mt-1">{examples[currentExample].question}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="mt-1 bg-primary p-1.5 rounded-full">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">PocketLawyer AI</p>
              <div className="text-sm mt-1 whitespace-pre-line">
                {examples[currentExample].answer}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentLanguage === "en" ? "Previous" : "Précédent"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            {currentLanguage === "en" ? "Next" : "Suivant"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <Button variant="default" size="sm">
          {currentLanguage === "en" ? "Try Your Own Question" : "Essayez Votre Propre Question"}
        </Button>
      </CardFooter>
    </Card>
  )
}
