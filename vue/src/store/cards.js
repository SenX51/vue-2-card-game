import cardEffect from "@/components/common/cardEffect";

export default {
  namespaced: true,
  state: {
    cards: [
      {
        title: "Attack",
        image: require("@/assets/cards/Archer_Charged_Shot.png"),
        cost: 1,
        rarity: 1,
        targeted: true,
        effects: [
          {
            type: cardEffect.ATTACK,
            values: [6],
          },
        ],
      },
      {
        title: "Defend",
        image: require("@/assets/cards/Mage_Explode.png"),
        cost: 1,
        rarity: 1,
        targeted: false,
        effects: [
          {
            type: cardEffect.DEFEND,
            values: [6],
          },
        ],
      },
      {
        title: "Riposte",
        image: require("@/assets/cards/Archer_Back_Up.png"),
        cost: 2,
        rarity: 1,
        targeted: true,
        effects: [
          {
            type: cardEffect.ATTACK,
            values: [6],
          },
          {
            type: cardEffect.DEFEND,
            values: [4],
          },
        ],
      },
      {
        title: "Fury Swipes",
        image: require("@/assets/cards/Archer_Rapid_Fire.png"),
        cost: 1,
        rarity: 1,
        targeted: true,
        effects: [
          {
            type: cardEffect.ATTACK,
            values: [1, 5],
          },
        ],
      },
      {
        title: "Combat Roll",
        image: require("@/assets/cards/Archer_Explosive_Arrow.png"),
        cost: 0,
        rarity: 1,
        targeted: false,
        effects: [
          {
            type: cardEffect.DISCARDRANDOM,
            values: [1],
          },
          {
            type: cardEffect.DRAW,
            values: [2],
          },
        ],
      },
      {
        title: "",
        image: "",
        cost: 0,
        rarity: 0,
        targeted: true,
        effects: [
          {
            type: cardEffect.ATTACK,
            values: [0],
          },
        ],
      },
    ],
  },
  getters: {
    getCards: (state) => state.cards,
    getCardById: (state) => (id) => state.cards.find((card) => card.id == id),
  },
};
