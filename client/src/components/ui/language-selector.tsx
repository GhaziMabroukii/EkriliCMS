import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  variant?: "default" | "compact";
}

export function LanguageSelector({ 
  currentLanguage = "fr", 
  onLanguageChange,
  variant = "default" 
}: LanguageSelectorProps) {
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={variant === "compact" ? "sm" : "default"}
          className="gap-2 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
        >
          {variant === "default" && <Globe className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {currentLang.flag} {variant === "default" ? currentLang.label : currentLang.code.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.label}</span>
            {currentLanguage === language.code && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
