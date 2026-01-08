/**
 * i18n configuration for La Vistique
 *
 * Uses General Translation (gt-next) for translations.
 */

// Supported locales
export const locales = ["nl", "en", "de", "fr"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "nl";

// Locale names for display
export const localeNames: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

// Country to locale mapping
export const countryToLocale: Record<string, Locale> = {
  NL: "nl",
  BE: "nl", // Belgium - Dutch
  DE: "de",
  AT: "de", // Austria - German
  FR: "fr",
  LU: "fr", // Luxembourg - French
  GB: "en",
  IE: "en",
  US: "en",
};

// Get locale from country code
export function getLocaleFromCountry(countryCode: string): Locale {
  return countryToLocale[countryCode] ?? defaultLocale;
}

// Translations dictionary type
export interface Translations {
  // Common
  common: {
    add_to_cart: string;
    continue: string;
    back: string;
    loading: string;
    error: string;
    close: string;
    remove: string;
    checkout: string;
    view_cart: string;
    shop_now: string;
    learn_more: string;
  };
  // Product
  product: {
    select_size: string;
    select_frame: string;
    no_frame: string;
    upload_photo: string;
    review_order: string;
    starting_at: string;
    in_stock: string;
    out_of_stock: string;
  };
  // Cart
  cart: {
    your_cart: string;
    empty_cart: string;
    subtotal: string;
    shipping: string;
    free_shipping: string;
    total: string;
    proceed_checkout: string;
    continue_shopping: string;
  };
  // Support
  support: {
    chat_with_us: string;
    how_can_we_help: string;
    type_message: string;
    send: string;
    connecting: string;
  };
  // Promo
  promo: {
    applied: string;
    off: string;
    ends_in: string;
    hours: string;
    days: string;
  };
}

// Dutch translations
export const nl: Translations = {
  common: {
    add_to_cart: "In winkelwagen",
    continue: "Doorgaan",
    back: "Terug",
    loading: "Laden...",
    error: "Er is een fout opgetreden",
    close: "Sluiten",
    remove: "Verwijderen",
    checkout: "Afrekenen",
    view_cart: "Bekijk winkelwagen",
    shop_now: "Shop nu",
    learn_more: "Meer informatie",
  },
  product: {
    select_size: "Kies je maat",
    select_frame: "Kies je lijst",
    no_frame: "Geen lijst",
    upload_photo: "Upload je foto",
    review_order: "Bekijk bestelling",
    starting_at: "Vanaf",
    in_stock: "Op voorraad",
    out_of_stock: "Niet op voorraad",
  },
  cart: {
    your_cart: "Je winkelwagen",
    empty_cart: "Je winkelwagen is leeg",
    subtotal: "Subtotaal",
    shipping: "Verzending",
    free_shipping: "Gratis",
    total: "Totaal",
    proceed_checkout: "Naar afrekenen",
    continue_shopping: "Verder winkelen",
  },
  support: {
    chat_with_us: "Chat met ons",
    how_can_we_help: "Hoe kunnen we je helpen?",
    type_message: "Typ een bericht...",
    send: "Verstuur",
    connecting: "Verbinden...",
  },
  promo: {
    applied: "toegepast",
    off: "korting",
    ends_in: "Eindigt over",
    hours: "uur",
    days: "dagen",
  },
};

// English translations
export const en: Translations = {
  common: {
    add_to_cart: "Add to Cart",
    continue: "Continue",
    back: "Back",
    loading: "Loading...",
    error: "An error occurred",
    close: "Close",
    remove: "Remove",
    checkout: "Checkout",
    view_cart: "View Cart",
    shop_now: "Shop Now",
    learn_more: "Learn More",
  },
  product: {
    select_size: "Select Size",
    select_frame: "Select Frame",
    no_frame: "No Frame",
    upload_photo: "Upload Photo",
    review_order: "Review Order",
    starting_at: "Starting at",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
  },
  cart: {
    your_cart: "Your Cart",
    empty_cart: "Your cart is empty",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free_shipping: "Free",
    total: "Total",
    proceed_checkout: "Proceed to Checkout",
    continue_shopping: "Continue Shopping",
  },
  support: {
    chat_with_us: "Chat with us",
    how_can_we_help: "How can we help?",
    type_message: "Type a message...",
    send: "Send",
    connecting: "Connecting...",
  },
  promo: {
    applied: "applied",
    off: "off",
    ends_in: "Ends in",
    hours: "hours",
    days: "days",
  },
};

// German translations
export const de: Translations = {
  common: {
    add_to_cart: "In den Warenkorb",
    continue: "Weiter",
    back: "Zurück",
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten",
    close: "Schließen",
    remove: "Entfernen",
    checkout: "Zur Kasse",
    view_cart: "Warenkorb anzeigen",
    shop_now: "Jetzt einkaufen",
    learn_more: "Mehr erfahren",
  },
  product: {
    select_size: "Größe wählen",
    select_frame: "Rahmen wählen",
    no_frame: "Kein Rahmen",
    upload_photo: "Foto hochladen",
    review_order: "Bestellung überprüfen",
    starting_at: "Ab",
    in_stock: "Auf Lager",
    out_of_stock: "Nicht auf Lager",
  },
  cart: {
    your_cart: "Ihr Warenkorb",
    empty_cart: "Ihr Warenkorb ist leer",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    free_shipping: "Kostenlos",
    total: "Gesamt",
    proceed_checkout: "Zur Kasse gehen",
    continue_shopping: "Weiter einkaufen",
  },
  support: {
    chat_with_us: "Chat mit uns",
    how_can_we_help: "Wie können wir helfen?",
    type_message: "Nachricht eingeben...",
    send: "Senden",
    connecting: "Verbinden...",
  },
  promo: {
    applied: "angewendet",
    off: "Rabatt",
    ends_in: "Endet in",
    hours: "Stunden",
    days: "Tagen",
  },
};

// French translations
export const fr: Translations = {
  common: {
    add_to_cart: "Ajouter au panier",
    continue: "Continuer",
    back: "Retour",
    loading: "Chargement...",
    error: "Une erreur est survenue",
    close: "Fermer",
    remove: "Supprimer",
    checkout: "Paiement",
    view_cart: "Voir le panier",
    shop_now: "Acheter maintenant",
    learn_more: "En savoir plus",
  },
  product: {
    select_size: "Choisir la taille",
    select_frame: "Choisir le cadre",
    no_frame: "Sans cadre",
    upload_photo: "Télécharger la photo",
    review_order: "Vérifier la commande",
    starting_at: "À partir de",
    in_stock: "En stock",
    out_of_stock: "Rupture de stock",
  },
  cart: {
    your_cart: "Votre panier",
    empty_cart: "Votre panier est vide",
    subtotal: "Sous-total",
    shipping: "Livraison",
    free_shipping: "Gratuit",
    total: "Total",
    proceed_checkout: "Passer à la caisse",
    continue_shopping: "Continuer vos achats",
  },
  support: {
    chat_with_us: "Discutez avec nous",
    how_can_we_help: "Comment pouvons-nous vous aider?",
    type_message: "Tapez un message...",
    send: "Envoyer",
    connecting: "Connexion...",
  },
  promo: {
    applied: "appliqué",
    off: "de réduction",
    ends_in: "Se termine dans",
    hours: "heures",
    days: "jours",
  },
};

// All translations
export const translations: Record<Locale, Translations> = {
  nl,
  en,
  de,
  fr,
};

// Get translations for a locale
export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations[defaultLocale];
}

// Translation helper hook would be in React
// For now, this provides the base translation system
