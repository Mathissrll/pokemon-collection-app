export class TextUtils {
  // Normaliser le texte pour la recherche (insensible à la casse, accents, etc.)
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD") // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques
      .replace(/[^a-z0-9\s]/g, " ") // Remplacer les caractères spéciaux par des espaces
      .replace(/\s+/g, " ") // Normaliser les espaces multiples
      .trim()
  }

  // Calculer la similarité entre deux textes (algorithme de Levenshtein simplifié)
  static similarity(a: string, b: string): number {
    const normalizedA = this.normalize(a)
    const normalizedB = this.normalize(b)

    if (normalizedA === normalizedB) return 1.0

    // Vérifier si l'un contient l'autre
    if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
      return 0.8
    }

    // Vérifier les mots en commun
    const wordsA = normalizedA.split(" ")
    const wordsB = normalizedB.split(" ")
    const commonWords = wordsA.filter((word) => wordsB.includes(word))

    if (commonWords.length > 0) {
      return commonWords.length / Math.max(wordsA.length, wordsB.length)
    }

    return 0
  }

  // Générer des variantes de recherche
  static generateSearchVariants(text: string): string[] {
    const normalized = this.normalize(text)
    const variants = [normalized]

    // Ajouter des variantes communes
    const replacements = [
      ["dresseur d elite", "etb"],
      ["elite trainer box", "etb"],
      ["booster box", "bb"],
      ["booster pack", "booster"],
      ["ecarlate et violet", "sv"],
      ["scarlet violet", "sv"],
      ["paradoxe temporel", "paf"],
      ["temporal forces", "paf"],
      ["destinees paldeennes", "pal"],
      ["paldean fates", "pal"],
      ["evolutions prismatiques", "mew"],
      ["prismatic evolutions", "mew"],
      ["collection premium", "premium"],
      ["protege cartes", "sleeves"],
      ["deck de combat", "battle deck"],
    ]

    for (const [from, to] of replacements) {
      if (normalized.includes(from)) {
        variants.push(normalized.replace(from, to))
      }
      if (normalized.includes(to)) {
        variants.push(normalized.replace(to, from))
      }
    }

    return [...new Set(variants)]
  }
}
