"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

// Define the legal term type
export interface LegalTerm {
  id: string
  term: string
  shortDefinition: string
  detailedDefinition?: string
  category: string
  difficultyLevel: "basic" | "intermediate" | "advanced"
  relatedTerms?: string[]
}

// Create a database of legal terms
const legalTermsDatabase: Record<string, LegalTerm[]> = {
  en: [
    {
      id: "mise-en-demeure",
      term: "mise en demeure",
      shortDefinition: "A formal notice demanding fulfillment of an obligation",
      detailedDefinition: "A formal notice sent to a debtor demanding the fulfillment of an obligation. It serves as an official warning before legal action is taken.",
      category: "contracts",
      difficultyLevel: "intermediate"
    },
    {
      id: "force-majeure",
      term: "force majeure",
      shortDefinition: "Unforeseeable circumstances preventing contract fulfillment",
      detailedDefinition: "An event or effect that cannot be reasonably anticipated or controlled, freeing parties from contract obligations when completion becomes impossible.",
      category: "contracts",
      difficultyLevel: "intermediate"
    },
    {
      id: "jurisprudence",
      term: "jurisprudence",
      shortDefinition: "The theory and philosophy of law",
      detailedDefinition: "The theory and philosophy of law, or the collection of court decisions interpreting statutes, regulations, and constitutional provisions.",
      category: "legal-system",
      difficultyLevel: "basic"
    },
    {
      id: "plaintiff",
      term: "plaintiff",
      shortDefinition: "Person who initiates a lawsuit",
      detailedDefinition: "The party who initiates a lawsuit by filing a complaint with the court against the defendant(s) demanding damages or other remedies.",
      category: "litigation",
      difficultyLevel: "basic"
    },
    {
      id: "defendant",
      term: "defendant",
      shortDefinition: "Person against whom a lawsuit is filed",
      detailedDefinition: "The party against whom a lawsuit is filed and who must respond to the plaintiff's complaint and defend against the lawsuit.",
      category: "litigation",
      difficultyLevel: "basic"
    },
    {
      id: "tort",
      term: "tort",
      shortDefinition: "Civil wrong causing harm or loss",
      detailedDefinition: "A civil wrong that causes someone to suffer loss or harm, resulting in legal liability for the person who commits the act.",
      category: "civil-law",
      difficultyLevel: "intermediate"
    },
    {
      id: "habeas-corpus",
      term: "habeas corpus",
      shortDefinition: "Legal action to review lawfulness of detention",
      detailedDefinition: "A legal action through which a person can seek relief from unlawful detention by requesting judicial review of their case.",
      category: "criminal-law",
      difficultyLevel: "advanced"
    },
    {
      id: "statute-of-limitations",
      term: "statute of limitations",
      shortDefinition: "Time limit for legal proceedings",
      detailedDefinition: "A law that sets the maximum time after an event within which legal proceedings may be initiated.",
      category: "legal-system",
      difficultyLevel: "intermediate"
    },
    {
      id: "precedent",
      term: "precedent",
      shortDefinition: "Previous court decision used as example",
      detailedDefinition: "A previous legal case that establishes a principle or rule that a court may follow when deciding subsequent cases with similar issues or facts.",
      category: "legal-system",
      difficultyLevel: "basic"
    },
    {
      id: "affidavit",
      term: "affidavit",
      shortDefinition: "Written statement confirmed by oath",
      detailedDefinition: "A written statement confirmed by oath or affirmation for use as evidence in court or before administrative agencies.",
      category: "litigation",
      difficultyLevel: "intermediate"
    }
  ],
  fr: [
    {
      id: "mise-en-demeure",
      term: "mise en demeure",
      shortDefinition: "Un avis formel exigeant l'exécution d'une obligation",
      detailedDefinition: "Un avis formel envoyé à un débiteur exigeant l'exécution d'une obligation. Il sert d'avertissement officiel avant qu'une action en justice ne soit engagée.",
      category: "contrats",
      difficultyLevel: "intermediate"
    },
    {
      id: "force-majeure",
      term: "force majeure",
      shortDefinition: "Circonstances imprévisibles empêchant l'exécution du contrat",
      detailedDefinition: "Un événement ou un effet qui ne peut être raisonnablement anticipé ou contrôlé, libérant les parties des obligations contractuelles lorsque l'achèvement devient impossible.",
      category: "contrats",
      difficultyLevel: "intermediate"
    },
    {
      id: "jurisprudence",
      term: "jurisprudence",
      shortDefinition: "La théorie et la philosophie du droit",
      detailedDefinition: "La théorie et la philosophie du droit, ou l'ensemble des décisions judiciaires interprétant les lois, les règlements et les dispositions constitutionnelles.",
      category: "système-juridique",
      difficultyLevel: "basic"
    },
    {
      id: "demandeur",
      term: "demandeur",
      shortDefinition: "Personne qui intente un procès",
      detailedDefinition: "La partie qui intente un procès en déposant une plainte auprès du tribunal contre le(s) défendeur(s) exigeant des dommages-intérêts ou d'autres recours.",
      category: "contentieux",
      difficultyLevel: "basic"
    },
    {
      id: "défendeur",
      term: "défendeur",
      shortDefinition: "Personne contre laquelle un procès est intenté",
      detailedDefinition: "La partie contre laquelle un procès est intenté et qui doit répondre à la plainte du demandeur et se défendre contre le procès.",
      category: "contentieux",
      difficultyLevel: "basic"
    },
    {
      id: "délit-civil",
      term: "délit civil",
      shortDefinition: "Faute civile causant un préjudice ou une perte",
      detailedDefinition: "Une faute civile qui cause à quelqu'un de subir une perte ou un préjudice, entraînant la responsabilité juridique de la personne qui commet l'acte.",
      category: "droit-civil",
      difficultyLevel: "intermediate"
    },
    {
      id: "habeas-corpus",
      term: "habeas corpus",
      shortDefinition: "Action en justice pour examiner la légalité de la détention",
      detailedDefinition: "Une action en justice par laquelle une personne peut demander réparation d'une détention illégale en demandant un examen judiciaire de son cas.",
      category: "droit-pénal",
      difficultyLevel: "advanced"
    },
    {
      id: "prescription",
      term: "prescription",
      shortDefinition: "Délai limite pour les procédures judiciaires",
      detailedDefinition: "Une loi qui fixe le délai maximum après un événement dans lequel une procédure judiciaire peut être engagée.",
      category: "système-juridique",
      difficultyLevel: "intermediate"
    },
    {
      id: "précédent",
      term: "précédent",
      shortDefinition: "Décision judiciaire antérieure utilisée comme exemple",
      detailedDefinition: "Une affaire juridique antérieure qui établit un principe ou une règle qu'un tribunal peut suivre lors de la décision d'affaires ultérieures présentant des problèmes ou des faits similaires.",
      category: "système-juridique",
      difficultyLevel: "basic"
    },
    {
      id: "déclaration-sous-serment",
      term: "déclaration sous serment",
      shortDefinition: "Déclaration écrite confirmée par serment",
      detailedDefinition: "Une déclaration écrite confirmée par serment ou affirmation pour être utilisée comme preuve devant un tribunal ou devant des organismes administratifs.",
      category: "contentieux",
      difficultyLevel: "intermediate"
    }
  ]
};

// Create a component to wrap legal terms with tooltips
export function LegalTermTooltip({ 
  children, 
  termId, 
  className = "" 
}: { 
  children: React.ReactNode, 
  termId: string, 
  className?: string 
}) {
  const { currentLanguage } = useLanguage();
  const language = currentLanguage || "en";
  const terms = legalTermsDatabase[language] || legalTermsDatabase.en;
  
  // Find the term in the database
  const term = terms.find(t => t.id === termId);
  
  if (!term) {
    return <>{children}</>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`border-dotted border-b border-muted-foreground/70 cursor-help inline-flex items-center gap-0.5 ${className}`}>
            {children}
            <InfoIcon className="h-3 w-3 text-muted-foreground/70" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{term.term}</p>
            <p className="text-sm">{term.shortDefinition}</p>
            {term.detailedDefinition && (
              <p className="text-xs text-muted-foreground">{term.detailedDefinition}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Create a hook to get legal terms
export function useLegalTerms() {
  const { currentLanguage } = useLanguage();
  const language = currentLanguage || "en";
  
  return {
    terms: legalTermsDatabase[language] || legalTermsDatabase.en,
    allTerms: legalTermsDatabase
  };
}

// Create a component to automatically detect and highlight legal terms in text
export function LegalTermsHighlighter({ 
  text, 
  className = "" 
}: { 
  text: string, 
  className?: string 
}) {
  const { terms } = useLegalTerms();
  const [processedText, setProcessedText] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    
    // Process the text to find and highlight legal terms
    let result: React.ReactNode[] = [text];
    
    sortedTerms.forEach(term => {
      const termRegex = new RegExp(`\\b${term.term}\\b`, 'gi');
      
      result = result.flatMap(item => {
        if (typeof item !== 'string') {
          return [item];
        }
        
        const parts = item.split(termRegex);
        if (parts.length === 1) {
          return [item];
        }
        
        const matches = item.match(termRegex) || [];
        return parts.flatMap((part, i) => {
          if (i === 0) return [part];
          
          const match = matches[i - 1];
          return [
            <LegalTermTooltip key={`${term.id}-${i}`} termId={term.id} className={className}>
              {match}
            </LegalTermTooltip>,
            part
          ];
        });
      });
    });
    
    setProcessedText(result);
  }, [text, terms, className]);
  
  return <>{processedText}</>;
}

// Create a dictionary component to display all legal terms
export function LegalDictionary() {
  const { terms } = useLegalTerms();
  const { t } = useLanguage();
  
  // Group terms by category
  const groupedTerms: Record<string, LegalTerm[]> = {};
  terms.forEach(term => {
    if (!groupedTerms[term.category]) {
      groupedTerms[term.category] = [];
    }
    groupedTerms[term.category].push(term);
  });
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t("Legal Dictionary")}</h2>
      
      {Object.entries(groupedTerms).map(([category, categoryTerms]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold capitalize">{category.replace('-', ' ')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTerms.map(term => (
              <div key={term.id} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">{term.term}</h4>
                <p className="text-sm">{term.shortDefinition}</p>
                {term.detailedDefinition && (
                  <p className="text-xs text-muted-foreground">{term.detailedDefinition}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    term.difficultyLevel === 'basic' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    term.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {term.difficultyLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
