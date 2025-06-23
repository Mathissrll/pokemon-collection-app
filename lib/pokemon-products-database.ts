export interface PokemonProduct {
  id: string
  name: string
  series: string
  type:
    | "etb"
    | "booster-box"
    | "booster-pack"
    | "tin"
    | "collection-box"
    | "premium-collection"
    | "coffret"
    | "display"
    | "deck-preconstruit"
    | "battle-deck"
    | "theme-deck"
    | "starter-deck"
    | "single-card"
    | "promo-card"
    | "accessoire"
    | "sleeves"
    | "playmat"
    | "deckbox"
    | "binder"
    | "toploader"
    | "autre"
  releaseYear: number
  language: "francais"
  searchTerms: string[]
  estimatedPrice?: number
  cardMarketId?: string
}

export class PokemonProductsDatabase {
  private static readonly PRODUCTS: PokemonProduct[] = [
    // === ÉCARLATE ET VIOLET (2022-2024) ===
    {
      id: "sv-base-etb-fr",
      name: "Coffret Dresseur d'Élite Écarlate et Violet",
      series: "Écarlate et Violet",
      type: "etb",
      releaseYear: 2023,
      language: "francais",
      searchTerms: [
        "etb sv",
        "elite trainer box sv",
        "coffret sv",
        "ecarlate violet etb",
        "sv etb",
        "scarlet violet etb",
      ],
      estimatedPrice: 42.5,
      cardMarketId: "sv01-etb-fr",
    },
    {
      id: "sv-base-bb-fr",
      name: "Booster Box Écarlate et Violet",
      series: "Écarlate et Violet",
      type: "booster-box",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["bb sv", "booster box sv", "display sv", "ecarlate violet bb", "sv bb"],
      estimatedPrice: 95.0,
      cardMarketId: "sv01-bb-fr",
    },
    {
      id: "sv-base-booster-fr",
      name: "Booster Écarlate et Violet",
      series: "Écarlate et Violet",
      type: "booster-pack",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["booster sv", "pack sv", "ecarlate violet booster", "sv booster"],
      estimatedPrice: 4.2,
      cardMarketId: "sv01-booster-fr",
    },

    // === PARADOXE TEMPOREL ===
    {
      id: "paf-etb-fr",
      name: "Coffret Dresseur d'Élite Paradoxe Temporel",
      series: "Paradoxe Temporel",
      type: "etb",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["etb paradoxe", "etb temporal", "etb paf", "paradoxe temporel etb", "temporal forces etb"],
      estimatedPrice: 45.5,
      cardMarketId: "sv05-etb-fr",
    },
    {
      id: "paf-bb-fr",
      name: "Booster Box Paradoxe Temporel",
      series: "Paradoxe Temporel",
      type: "booster-box",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["bb paradoxe", "bb temporal", "bb paf", "paradoxe temporel bb"],
      estimatedPrice: 98.0,
      cardMarketId: "sv05-bb-fr",
    },

    // === DESTINÉES PALDÉENNES ===
    {
      id: "pal-etb-fr",
      name: "Coffret Dresseur d'Élite Destinées Paldéennes",
      series: "Destinées Paldéennes",
      type: "etb",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["etb destinees", "etb paldean", "etb pal", "destinees paldeennes etb"],
      estimatedPrice: 48.5,
      cardMarketId: "sv04.5-etb-fr",
    },
    {
      id: "pal-bb-fr",
      name: "Booster Box Destinées Paldéennes",
      series: "Destinées Paldéennes",
      type: "booster-box",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["bb destinees", "bb paldean", "bb pal", "destinees paldeennes bb"],
      estimatedPrice: 102.0,
      cardMarketId: "sv04.5-bb-fr",
    },

    // === ÉVOLUTIONS PRISMATIQUES ===
    {
      id: "mew-etb-fr",
      name: "Coffret Dresseur d'Élite Évolutions Prismatiques",
      series: "Évolutions Prismatiques",
      type: "etb",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["etb evolutions", "etb prismatic", "etb mew", "evolutions prismatiques etb"],
      estimatedPrice: 51.0,
      cardMarketId: "sv07-etb-fr",
    },
    {
      id: "mew-bb-fr",
      name: "Booster Box Évolutions Prismatiques",
      series: "Évolutions Prismatiques",
      type: "booster-box",
      releaseYear: 2024,
      language: "francais",
      searchTerms: ["bb evolutions", "bb prismatic", "bb mew", "evolutions prismatiques bb"],
      estimatedPrice: 105.0,
      cardMarketId: "sv07-bb-fr",
    },

    // === ÉPÉE ET BOUCLIER (2020-2022) ===
    {
      id: "swsh-base-etb-fr",
      name: "Coffret Dresseur d'Élite Épée et Bouclier",
      series: "Épée et Bouclier",
      type: "etb",
      releaseYear: 2020,
      language: "francais",
      searchTerms: ["etb epee bouclier", "etb swsh", "etb sword shield", "epee bouclier etb"],
      estimatedPrice: 62.0,
      cardMarketId: "swsh01-etb-fr",
    },
    {
      id: "swsh-base-bb-fr",
      name: "Booster Box Épée et Bouclier",
      series: "Épée et Bouclier",
      type: "booster-box",
      releaseYear: 2020,
      language: "francais",
      searchTerms: ["bb epee bouclier", "bb swsh", "bb sword shield", "epee bouclier bb"],
      estimatedPrice: 125.0,
      cardMarketId: "swsh01-bb-fr",
    },

    // === TÉNÈBRES EMBRASÉES ===
    {
      id: "dar-etb-fr",
      name: "Coffret Dresseur d'Élite Ténèbres Embrasées",
      series: "Ténèbres Embrasées",
      type: "etb",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["etb tenebres", "etb darkness", "etb dar", "tenebres embrasees etb"],
      estimatedPrice: 75.0,
      cardMarketId: "swsh03-etb-fr",
    },
    {
      id: "dar-bb-fr",
      name: "Booster Box Ténèbres Embrasées",
      series: "Ténèbres Embrasées",
      type: "booster-box",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["bb tenebres", "bb darkness", "bb dar", "tenebres embrasees bb"],
      estimatedPrice: 180.0,
      cardMarketId: "swsh03-bb-fr",
    },

    // === VOLTAGE ÉCLATANT ===
    {
      id: "viv-etb-fr",
      name: "Coffret Dresseur d'Élite Voltage Éclatant",
      series: "Voltage Éclatant",
      type: "etb",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["etb voltage", "etb vivid", "etb viv", "voltage eclatant etb"],
      estimatedPrice: 85.0,
      cardMarketId: "swsh04-etb-fr",
    },
    {
      id: "viv-bb-fr",
      name: "Booster Box Voltage Éclatant",
      series: "Voltage Éclatant",
      type: "booster-box",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["bb voltage", "bb vivid", "bb viv", "voltage eclatant bb"],
      estimatedPrice: 200.0,
      cardMarketId: "swsh04-bb-fr",
    },

    // === CÉLÉBRATIONS ===
    {
      id: "cel-etb-fr",
      name: "Coffret Dresseur d'Élite Célébrations",
      series: "Célébrations",
      type: "etb",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["etb celebrations", "etb cel", "etb 25", "celebrations etb", "25eme anniversaire"],
      estimatedPrice: 120.0,
      cardMarketId: "cel-etb-fr",
    },
    {
      id: "cel-bb-fr",
      name: "Booster Box Célébrations",
      series: "Célébrations",
      type: "booster-box",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["bb celebrations", "bb cel", "bb 25", "celebrations bb"],
      estimatedPrice: 220.0,
      cardMarketId: "cel-bb-fr",
    },

    // === LÉGENDES BRILLANTES ===
    {
      id: "brs-etb-fr",
      name: "Coffret Dresseur d'Élite Légendes Brillantes",
      series: "Légendes Brillantes",
      type: "etb",
      releaseYear: 2022,
      language: "francais",
      searchTerms: ["etb legendes", "etb brilliant", "etb brs", "legendes brillantes etb"],
      estimatedPrice: 65.0,
      cardMarketId: "swsh09-etb-fr",
    },
    {
      id: "brs-bb-fr",
      name: "Booster Box Légendes Brillantes",
      series: "Légendes Brillantes",
      type: "booster-box",
      releaseYear: 2022,
      language: "francais",
      searchTerms: ["bb legendes", "bb brilliant", "bb brs", "legendes brillantes bb"],
      estimatedPrice: 145.0,
      cardMarketId: "swsh09-bb-fr",
    },

    // === POKÉMON GO ===
    {
      id: "pokemon-go-etb-fr",
      name: "Coffret Dresseur d'Élite Pokémon GO",
      series: "Pokémon GO",
      type: "etb",
      releaseYear: 2022,
      language: "francais",
      searchTerms: ["etb pokemon go", "pokemon go etb", "coffret pokemon go"],
      estimatedPrice: 75.0,
      cardMarketId: "pgo-etb-fr",
    },
    {
      id: "pokemon-go-bb-fr",
      name: "Booster Box Pokémon GO",
      series: "Pokémon GO",
      type: "booster-box",
      releaseYear: 2022,
      language: "francais",
      searchTerms: ["bb pokemon go", "pokemon go bb", "booster box pokemon go"],
      estimatedPrice: 165.0,
      cardMarketId: "pgo-bb-fr",
    },

    // === SOLEIL ET LUNE (2017-2019) ===
    {
      id: "sm-base-etb-fr",
      name: "Coffret Dresseur d'Élite Soleil et Lune",
      series: "Soleil et Lune",
      type: "etb",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["etb soleil lune", "etb sm", "etb sun moon", "soleil lune etb"],
      estimatedPrice: 150.0,
      cardMarketId: "sm01-etb-fr",
    },
    {
      id: "sm-base-bb-fr",
      name: "Booster Box Soleil et Lune",
      series: "Soleil et Lune",
      type: "booster-box",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["bb soleil lune", "bb sm", "bb sun moon", "soleil lune bb"],
      estimatedPrice: 300.0,
      cardMarketId: "sm01-bb-fr",
    },
    {
      id: "sm-gardiens-etb-fr",
      name: "Coffret Dresseur d'Élite Gardiens Ascendants",
      series: "Gardiens Ascendants",
      type: "etb",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["etb gardiens", "etb guardians", "gardiens ascendants etb"],
      estimatedPrice: 180.0,
      cardMarketId: "sm02-etb-fr",
    },
    {
      id: "sm-gardiens-bb-fr",
      name: "Booster Box Gardiens Ascendants",
      series: "Gardiens Ascendants",
      type: "booster-box",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["bb gardiens", "bb guardians", "gardiens ascendants bb"],
      estimatedPrice: 350.0,
      cardMarketId: "sm02-bb-fr",
    },
    {
      id: "sm-ombres-etb-fr",
      name: "Coffret Dresseur d'Élite Ombres Ardentes",
      series: "Ombres Ardentes",
      type: "etb",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["etb ombres", "etb burning", "ombres ardentes etb"],
      estimatedPrice: 190.0,
      cardMarketId: "sm03-etb-fr",
    },
    {
      id: "sm-ombres-bb-fr",
      name: "Booster Box Ombres Ardentes",
      series: "Ombres Ardentes",
      type: "booster-box",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["bb ombres", "bb burning", "ombres ardentes bb"],
      estimatedPrice: 380.0,
      cardMarketId: "sm03-bb-fr",
    },
    {
      id: "sm-invasion-etb-fr",
      name: "Coffret Dresseur d'Élite Invasion Carmin",
      series: "Invasion Carmin",
      type: "etb",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["etb invasion", "etb carmin", "invasion carmin etb"],
      estimatedPrice: 200.0,
      cardMarketId: "sm04-etb-fr",
    },
    {
      id: "sm-invasion-bb-fr",
      name: "Booster Box Invasion Carmin",
      series: "Invasion Carmin",
      type: "booster-box",
      releaseYear: 2017,
      language: "francais",
      searchTerms: ["bb invasion", "bb carmin", "invasion carmin bb"],
      estimatedPrice: 400.0,
      cardMarketId: "sm04-bb-fr",
    },
    {
      id: "sm-ultra-prisme-etb-fr",
      name: "Coffret Dresseur d'Élite Ultra-Prisme",
      series: "Ultra-Prisme",
      type: "etb",
      releaseYear: 2018,
      language: "francais",
      searchTerms: ["etb ultra prisme", "etb ultra", "ultra prisme etb"],
      estimatedPrice: 220.0,
      cardMarketId: "sm05-etb-fr",
    },
    {
      id: "sm-ultra-prisme-bb-fr",
      name: "Booster Box Ultra-Prisme",
      series: "Ultra-Prisme",
      type: "booster-box",
      releaseYear: 2018,
      language: "francais",
      searchTerms: ["bb ultra prisme", "bb ultra", "ultra prisme bb"],
      estimatedPrice: 450.0,
      cardMarketId: "sm05-bb-fr",
    },

    // === XY (2014-2016) ===
    {
      id: "xy-base-bb-fr",
      name: "Booster Box XY",
      series: "XY",
      type: "booster-box",
      releaseYear: 2014,
      language: "francais",
      searchTerms: ["bb xy", "booster box xy", "xy bb", "xy base"],
      estimatedPrice: 800.0,
      cardMarketId: "xy01-bb-fr",
    },
    {
      id: "xy-base-etb-fr",
      name: "Coffret Dresseur d'Élite XY",
      series: "XY",
      type: "etb",
      releaseYear: 2014,
      language: "francais",
      searchTerms: ["etb xy", "xy etb", "coffret xy"],
      estimatedPrice: 450.0,
      cardMarketId: "xy01-etb-fr",
    },
    {
      id: "xy-flashfire-bb-fr",
      name: "Booster Box XY Étincelles",
      series: "XY Étincelles",
      type: "booster-box",
      releaseYear: 2014,
      language: "francais",
      searchTerms: ["bb xy etincelles", "bb flashfire", "xy etincelles bb"],
      estimatedPrice: 850.0,
      cardMarketId: "xy02-bb-fr",
    },
    {
      id: "xy-furious-fists-bb-fr",
      name: "Booster Box XY Poings Furieux",
      series: "XY Poings Furieux",
      type: "booster-box",
      releaseYear: 2014,
      language: "francais",
      searchTerms: ["bb xy poings", "bb furious fists", "xy poings furieux bb"],
      estimatedPrice: 750.0,
      cardMarketId: "xy03-bb-fr",
    },
    {
      id: "xy-phantom-forces-bb-fr",
      name: "Booster Box XY Vigueur Spectrale",
      series: "XY Vigueur Spectrale",
      type: "booster-box",
      releaseYear: 2014,
      language: "francais",
      searchTerms: ["bb xy vigueur", "bb phantom forces", "xy vigueur spectrale bb"],
      estimatedPrice: 900.0,
      cardMarketId: "xy04-bb-fr",
    },
    {
      id: "xy-primal-clash-bb-fr",
      name: "Booster Box XY Primo-Choc",
      series: "XY Primo-Choc",
      type: "booster-box",
      releaseYear: 2015,
      language: "francais",
      searchTerms: ["bb xy primo", "bb primal clash", "xy primo choc bb"],
      estimatedPrice: 700.0,
      cardMarketId: "xy05-bb-fr",
    },
    {
      id: "xy-roaring-skies-bb-fr",
      name: "Booster Box XY Ciel Rugissant",
      series: "XY Ciel Rugissant",
      type: "booster-box",
      releaseYear: 2015,
      language: "francais",
      searchTerms: ["bb xy ciel", "bb roaring skies", "xy ciel rugissant bb"],
      estimatedPrice: 1200.0,
      cardMarketId: "xy06-bb-fr",
    },
    {
      id: "xy-ancient-origins-bb-fr",
      name: "Booster Box XY Origines Antiques",
      series: "XY Origines Antiques",
      type: "booster-box",
      releaseYear: 2015,
      language: "francais",
      searchTerms: ["bb xy origines", "bb ancient origins", "xy origines antiques bb"],
      estimatedPrice: 650.0,
      cardMarketId: "xy07-bb-fr",
    },
    {
      id: "xy-breakthrough-bb-fr",
      name: "Booster Box XY Percée",
      series: "XY Percée",
      type: "booster-box",
      releaseYear: 2015,
      language: "francais",
      searchTerms: ["bb xy percee", "bb breakthrough", "xy percee bb"],
      estimatedPrice: 600.0,
      cardMarketId: "xy08-bb-fr",
    },
    {
      id: "xy-breakpoint-bb-fr",
      name: "Booster Box XY Point de Rupture",
      series: "XY Point de Rupture",
      type: "booster-box",
      releaseYear: 2016,
      language: "francais",
      searchTerms: ["bb xy point", "bb breakpoint", "xy point rupture bb"],
      estimatedPrice: 550.0,
      cardMarketId: "xy09-bb-fr",
    },
    {
      id: "xy-generations-bb-fr",
      name: "Booster Box XY Générations",
      series: "XY Générations",
      type: "booster-box",
      releaseYear: 2016,
      language: "francais",
      searchTerms: ["bb xy generations", "bb generations", "xy generations bb"],
      estimatedPrice: 1500.0,
      cardMarketId: "xy10-bb-fr",
    },
    {
      id: "xy-fates-collide-bb-fr",
      name: "Booster Box XY Destins Croisés",
      series: "XY Destins Croisés",
      type: "booster-box",
      releaseYear: 2016,
      language: "francais",
      searchTerms: ["bb xy destins", "bb fates collide", "xy destins croises bb"],
      estimatedPrice: 500.0,
      cardMarketId: "xy10-bb-fr",
    },
    {
      id: "xy-steam-siege-bb-fr",
      name: "Booster Box XY Offensive Vapeur",
      series: "XY Offensive Vapeur",
      type: "booster-box",
      releaseYear: 2016,
      language: "francais",
      searchTerms: ["bb xy offensive", "bb steam siege", "xy offensive vapeur bb"],
      estimatedPrice: 480.0,
      cardMarketId: "xy11-bb-fr",
    },
    {
      id: "xy-evolutions-bb-fr",
      name: "Booster Box XY Évolutions",
      series: "XY Évolutions",
      type: "booster-box",
      releaseYear: 2016,
      language: "francais",
      searchTerms: ["bb xy evolutions", "bb evolutions", "xy evolutions bb"],
      estimatedPrice: 650.0,
      cardMarketId: "xy12-bb-fr",
    },

    // === NOIR ET BLANC (2011-2013) ===
    {
      id: "bw-base-bb-fr",
      name: "Booster Box Noir et Blanc",
      series: "Noir et Blanc",
      type: "booster-box",
      releaseYear: 2011,
      language: "francais",
      searchTerms: ["bb noir blanc", "bb bw", "noir blanc bb", "black white bb"],
      estimatedPrice: 1200.0,
      cardMarketId: "bw01-bb-fr",
    },
    {
      id: "bw-emerging-powers-bb-fr",
      name: "Booster Box Noir et Blanc Pouvoirs Émergents",
      series: "Pouvoirs Émergents",
      type: "booster-box",
      releaseYear: 2011,
      language: "francais",
      searchTerms: ["bb pouvoirs emergents", "bb emerging powers", "pouvoirs emergents bb"],
      estimatedPrice: 1000.0,
      cardMarketId: "bw02-bb-fr",
    },
    {
      id: "bw-noble-victories-bb-fr",
      name: "Booster Box Noir et Blanc Nobles Victoires",
      series: "Nobles Victoires",
      type: "booster-box",
      releaseYear: 2011,
      language: "francais",
      searchTerms: ["bb nobles victoires", "bb noble victories", "nobles victoires bb"],
      estimatedPrice: 1100.0,
      cardMarketId: "bw03-bb-fr",
    },
    {
      id: "bw-next-destinies-bb-fr",
      name: "Booster Box Noir et Blanc Destinées Futures",
      series: "Destinées Futures",
      type: "booster-box",
      releaseYear: 2012,
      language: "francais",
      searchTerms: ["bb destinees futures", "bb next destinies", "destinees futures bb"],
      estimatedPrice: 950.0,
      cardMarketId: "bw04-bb-fr",
    },
    {
      id: "bw-dark-explorers-bb-fr",
      name: "Booster Box Noir et Blanc Explorateurs Obscurs",
      series: "Explorateurs Obscurs",
      type: "booster-box",
      releaseYear: 2012,
      language: "francais",
      searchTerms: ["bb explorateurs obscurs", "bb dark explorers", "explorateurs obscurs bb"],
      estimatedPrice: 1300.0,
      cardMarketId: "bw05-bb-fr",
    },
    {
      id: "bw-dragons-exalted-bb-fr",
      name: "Booster Box Noir et Blanc Dragons Exaltés",
      series: "Dragons Exaltés",
      type: "booster-box",
      releaseYear: 2012,
      language: "francais",
      searchTerms: ["bb dragons exaltes", "bb dragons exalted", "dragons exaltes bb"],
      estimatedPrice: 800.0,
      cardMarketId: "bw06-bb-fr",
    },
    {
      id: "bw-boundaries-crossed-bb-fr",
      name: "Booster Box Noir et Blanc Frontières Franchies",
      series: "Frontières Franchies",
      type: "booster-box",
      releaseYear: 2012,
      language: "francais",
      searchTerms: ["bb frontieres franchies", "bb boundaries crossed", "frontieres franchies bb"],
      estimatedPrice: 750.0,
      cardMarketId: "bw07-bb-fr",
    },
    {
      id: "bw-plasma-storm-bb-fr",
      name: "Booster Box Noir et Blanc Tempête Plasma",
      series: "Tempête Plasma",
      type: "booster-box",
      releaseYear: 2013,
      language: "francais",
      searchTerms: ["bb tempete plasma", "bb plasma storm", "tempete plasma bb"],
      estimatedPrice: 900.0,
      cardMarketId: "bw08-bb-fr",
    },
    {
      id: "bw-plasma-freeze-bb-fr",
      name: "Booster Box Noir et Blanc Glaciation Plasma",
      series: "Glaciation Plasma",
      type: "booster-box",
      releaseYear: 2013,
      language: "francais",
      searchTerms: ["bb glaciation plasma", "bb plasma freeze", "glaciation plasma bb"],
      estimatedPrice: 850.0,
      cardMarketId: "bw09-bb-fr",
    },
    {
      id: "bw-plasma-blast-bb-fr",
      name: "Booster Box Noir et Blanc Explosion Plasma",
      series: "Explosion Plasma",
      type: "booster-box",
      releaseYear: 2013,
      language: "francais",
      searchTerms: ["bb explosion plasma", "bb plasma blast", "explosion plasma bb"],
      estimatedPrice: 700.0,
      cardMarketId: "bw10-bb-fr",
    },
    {
      id: "bw-legendary-treasures-bb-fr",
      name: "Booster Box Noir et Blanc Trésors Légendaires",
      series: "Trésors Légendaires",
      type: "booster-box",
      releaseYear: 2013,
      language: "francais",
      searchTerms: ["bb tresors legendaires", "bb legendary treasures", "tresors legendaires bb"],
      estimatedPrice: 1400.0,
      cardMarketId: "bw11-bb-fr",
    },

    // === TINS POPULAIRES ===
    {
      id: "tin-charizard-gx",
      name: "Tin Charizard GX",
      series: "Tins",
      type: "tin",
      releaseYear: 2019,
      language: "francais",
      searchTerms: ["tin charizard", "boite charizard", "charizard tin", "tin dracaufeu"],
      estimatedPrice: 35.0,
      cardMarketId: "tin-charizard-gx-fr",
    },
    {
      id: "tin-pikachu-vmax",
      name: "Tin Pikachu VMAX",
      series: "Tins",
      type: "tin",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["tin pikachu", "boite pikachu", "pikachu tin", "pikachu vmax tin"],
      estimatedPrice: 28.0,
      cardMarketId: "tin-pikachu-vmax-fr",
    },
    {
      id: "tin-koraidon-ex",
      name: "Tin Koraidon ex",
      series: "Tins",
      type: "tin",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["tin koraidon", "boite koraidon", "koraidon tin"],
      estimatedPrice: 21.5,
      cardMarketId: "tin-koraidon-ex-fr",
    },
    {
      id: "tin-miraidon-ex",
      name: "Tin Miraidon ex",
      series: "Tins",
      type: "tin",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["tin miraidon", "boite miraidon", "miraidon tin"],
      estimatedPrice: 21.5,
      cardMarketId: "tin-miraidon-ex-fr",
    },

    // === COLLECTIONS PREMIUM ===
    {
      id: "premium-charizard-upc",
      name: "Collection Premium Charizard UPC",
      series: "Collections Premium",
      type: "premium-collection",
      releaseYear: 2022,
      language: "francais",
      searchTerms: ["premium charizard", "upc charizard", "collection charizard", "charizard upc"],
      estimatedPrice: 450.0,
      cardMarketId: "upc-charizard-fr",
    },
    {
      id: "premium-pikachu-vmax",
      name: "Collection Premium Pikachu VMAX",
      series: "Collections Premium",
      type: "premium-collection",
      releaseYear: 2021,
      language: "francais",
      searchTerms: ["premium pikachu", "collection pikachu", "pikachu premium"],
      estimatedPrice: 85.0,
      cardMarketId: "premium-pikachu-vmax-fr",
    },

    // === DECKS PRÉCONSTRUITS ===
    {
      id: "deck-koraidon-battle",
      name: "Deck de Combat Koraidon ex",
      series: "Decks de Combat",
      type: "battle-deck",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["deck koraidon", "battle deck koraidon", "deck combat koraidon"],
      estimatedPrice: 27.5,
      cardMarketId: "battle-deck-koraidon-fr",
    },
    {
      id: "deck-miraidon-battle",
      name: "Deck de Combat Miraidon ex",
      series: "Decks de Combat",
      type: "battle-deck",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["deck miraidon", "battle deck miraidon", "deck combat miraidon"],
      estimatedPrice: 27.5,
      cardMarketId: "battle-deck-miraidon-fr",
    },

    // === ACCESSOIRES ===
    {
      id: "sleeves-pikachu-fr",
      name: "Protège-Cartes Pikachu",
      series: "Accessoires",
      type: "sleeves",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["sleeves pikachu", "protege cartes pikachu", "pochettes pikachu"],
      estimatedPrice: 11.5,
      cardMarketId: "sleeves-pikachu-fr",
    },
    {
      id: "sleeves-charizard-fr",
      name: "Protège-Cartes Charizard",
      series: "Accessoires",
      type: "sleeves",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["sleeves charizard", "protege cartes charizard", "pochettes charizard"],
      estimatedPrice: 12.5,
      cardMarketId: "sleeves-charizard-fr",
    },
    {
      id: "playmat-pokemon-fr",
      name: "Tapis de Jeu Pokémon",
      series: "Accessoires",
      type: "playmat",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["tapis jeu", "playmat", "tapis pokemon", "tapis de jeu"],
      estimatedPrice: 19.5,
      cardMarketId: "playmat-pokemon-fr",
    },
    {
      id: "deckbox-pokemon-fr",
      name: "Deck Box Pokémon",
      series: "Accessoires",
      type: "deckbox",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["deck box", "boite deck", "deckbox pokemon"],
      estimatedPrice: 15.5,
      cardMarketId: "deckbox-pokemon-fr",
    },
    {
      id: "binder-pokemon-fr",
      name: "Classeur Pokémon",
      series: "Accessoires",
      type: "binder",
      releaseYear: 2023,
      language: "francais",
      searchTerms: ["classeur", "binder", "classeur pokemon", "album cartes"],
      estimatedPrice: 22.5,
      cardMarketId: "binder-pokemon-fr",
    },
  ]

  // Rechercher des produits avec recherche très flexible
  static searchProducts(query: string): PokemonProduct[] {
    if (!query || query.length < 1) return []

    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    const queryWords = normalizedQuery.split(" ").filter((word) => word.length > 0)
    const results: Array<{ product: PokemonProduct; score: number }> = []

    for (const product of this.PRODUCTS) {
      let maxScore = 0

      // Tester contre le nom du produit
      const normalizedName = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      // Score exact match
      if (normalizedName.includes(normalizedQuery)) {
        maxScore = Math.max(maxScore, 0.95)
      }

      // Score par mots
      let wordMatches = 0
      for (const word of queryWords) {
        if (normalizedName.includes(word)) {
          wordMatches++
        }
      }
      if (queryWords.length > 0) {
        maxScore = Math.max(maxScore, (wordMatches / queryWords.length) * 0.8)
      }

      // Tester contre les termes de recherche
      for (const searchTerm of product.searchTerms) {
        const normalizedTerm = searchTerm.toLowerCase()
        if (normalizedTerm.includes(normalizedQuery) || normalizedQuery.includes(normalizedTerm)) {
          maxScore = Math.max(maxScore, 0.85)
        }

        // Score par mots dans les termes de recherche
        let termWordMatches = 0
        for (const word of queryWords) {
          if (normalizedTerm.includes(word)) {
            termWordMatches++
          }
        }
        if (queryWords.length > 0) {
          maxScore = Math.max(maxScore, (termWordMatches / queryWords.length) * 0.75)
        }
      }

      // Tester contre la série
      const normalizedSeries = product.series
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      if (normalizedSeries.includes(normalizedQuery)) {
        maxScore = Math.max(maxScore, 0.7)
      }

      // Score minimum très bas pour inclure plus de résultats
      if (maxScore > 0.15) {
        results.push({ product, score: maxScore })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .map((r) => r.product)
  }

  // Obtenir un produit par ID
  static getProductById(id: string): PokemonProduct | null {
    return this.PRODUCTS.find((p) => p.id === id) || null
  }

  // Obtenir des suggestions très flexibles
  static getSuggestions(query: string): string[] {
    if (!query || query.length < 1) return []

    const normalizedQuery = query.toLowerCase()
    const suggestions = new Set<string>()

    for (const product of this.PRODUCTS) {
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(product.name)
      }

      for (const term of product.searchTerms) {
        if (term.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(product.name)
        }
      }

      if (product.series.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(product.name)
      }
    }

    return Array.from(suggestions).slice(0, 12)
  }

  // Obtenir des produits populaires
  static getPopularProducts(): PokemonProduct[] {
    return this.PRODUCTS.filter((p) => p.estimatedPrice && p.estimatedPrice > 20)
      .sort((a, b) => (b.estimatedPrice || 0) - (a.estimatedPrice || 0))
      .slice(0, 15)
  }

  // Obtenir le nombre total de produits
  static getTotalProductsCount(): number {
    return this.PRODUCTS.length
  }

  // Obtenir des statistiques
  static getStats(): {
    total: number
    byType: Record<string, number>
    bySeries: Record<string, number>
  } {
    const stats = {
      total: this.PRODUCTS.length,
      byType: {} as Record<string, number>,
      bySeries: {} as Record<string, number>,
    }

    for (const product of this.PRODUCTS) {
      stats.byType[product.type] = (stats.byType[product.type] || 0) + 1
      stats.bySeries[product.series] = (stats.bySeries[product.series] || 0) + 1
    }

    return stats
  }
}
