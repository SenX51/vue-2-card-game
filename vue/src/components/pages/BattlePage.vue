<template>
  <div class="battle-screen" @contextmenu="(event) => onPageRightClick(event)">
    <img class="background" src="../../assets/common/background.jpg">
    <div class="header">
      <div class="deck__button" @click="() => showPile(getDeck)">
        <img src="../../assets/common/deck.png">
      </div>
    </div>

    <div class="middle center-vertical">
      <div class="player-area">
        <PlayerComponent :player="player"/>
      </div>
      <div class="enemy-area center-vertical center-horizontal"
        @click.self="() => tryPlayCard('player')"
      >
        <EnemyComponent
          v-for="(enemy) in enemies"
          :key="enemy.id"
          :enemy="enemy"
          @onEnemyClick="() => handleEnemyClick(enemy)"
        />
      </div>
    </div>

    <div class="footer">
      <div class="pile__button" @click="() => showDrawPile()">
        <img src="../../assets/common/draw.png">
        <p class="center-vertical center-horizontal">{{ getDrawPile.length }}</p>
      </div>
      <div class="mana">
        <img src="../../assets/common/mana.png">
        <p class="center-vertical center-horizontal">
          {{ getMana.current }}/{{ getMana.max}}
        </p>
      </div>
      <DeckComponent />
      <div class="end-turn__button center-vertical center-horizontal"
        @click="() => endTurn()"
      >
        <p class="center-vertical center-horizontal">End Turn</p>
      </div>
      <div class="pile__button" @click="() => showPile(getDiscardPile)">
        <img src="../../assets/common/discard.png">
        <p class="center-vertical center-horizontal">{{ getDiscardPile.length }}</p>
      </div>
    </div>
    <CardPile/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import cardEffect from "../common/cardEffect";
import { shuffleArray } from "../common/helpers";
import CardPile from '../card/CardPile.vue';
import DeckComponent from '../deck/DeckComponent.vue';
import EnemyComponent from "../enemy/EnemyComponent.vue";
import PlayerComponent from "../player/PlayerComponent.vue";
import enemyAction from "../common/enemyAction";

export default {
  components: {
    DeckComponent,
    CardPile,
    PlayerComponent,
    EnemyComponent,
  },
  data() {
    return {
      selectedCard: null,
      selectedCardIndex: null,
    }
  },
  computed: {
    ...mapGetters("deck", [
      "getDeck",
      "getDeckIds",
      "getHand",
      "getDrawPile",
      "getDiscardPile",
      "drawAmount",
    ]),
    ...mapGetters("battle", [
      "getPlayer",
      "getEnemies",
      "getMana",
    ]),

    player() {
      return this.getPlayer;
    },

    enemies() {
      return this.getEnemies;
    },

    loose() {
      return this.player.health <= 0
    }
  },
  watch: {
    enemies: function (newVal) {
      if (newVal.length == 0) {
        this.$root.$emit("victory");
        this.startEncounter();
      }
    },
    loose: function () {
      this.$root.$emit("playerDied")
    }
  },
  mounted() {
    this.$root.$on('selectCard', (card, index) => {
      this.selectedCard = card,
      this.selectedCardIndex = index;
    });

    this.startEncounter();
  },
  methods: {
    ...mapActions("battle", [
      "clearEnemies",
      "addEnemyById",
      "applyDamage",
      "applyShield",
      "setShield",
      "changeMaxMana",
      "changeCurrentMana",
      "setCurrentMana",
      "enemySetIntent",
      "enemyNextAction",
    ]),
    ...mapActions("deck", [
      "drawCards",
      "discardRandom",
      "setDrawPile",
      "clearPiles",
      "discardHand",
    ]),

    showDrawPile() {
      this.$root.$emit('setPile', shuffleArray(this.getDrawPile));
      this.$root.$emit('setPile', this.getDrawPile);
      this.$root.$emit('showPile');
    },

    showPile(pile) {
      this.$root.$emit('setPile', pile);
      this.$root.$emit('showPile');
    },
 

    handleEnemyClick(enemy) {
      this.tryPlayCard(enemy)
    },

    async tryPlayCard(target) {
      if (this.selectedCard == null) {
        return;
      }
      if (this.selectedCard.cost > this.getMana.current) {
        this.$root.$emit("selectCard", null, null);
        return;
      }
      if (this.selectedCard.targeted && target == "player") {
        return;
      }
      if (this.selectedCard.targeted && target.health <= 0) {
        return;
      }

      this.$root.$emit("playCard", {
        card: this.selectedCard,
        cardIndex: this.selectedCardIndex,
        target: target,
      })
      this.changeCurrentMana(-this.selectedCard.cost)

      for (const effect of this.selectedCard.effects) {
        await setTimeout(() => { this.resolveEffect(effect, target, "player")}, 350);
      }
      this.$root.$emit("selectCard", null, null)
    },

    async resolveEffect(effect, target, caster) {
      return new Promise((resolve) =>{
        let delays = 0;

        switch (effect.type) {
          case enemyAction.ATTACK_MULTIPLE:
          case enemyAction.ATTACK:
          case cardEffect.ATTACK: {
            for (let i = 0; i < (effect.values[1] || 1); i++) {
              setTimeout(() => {
                this.applyDamage({ amount: effect.values[0], target });
                if (i === (effect.values[1] || 1) - 1) resolve();
              }, i * 175);
              delays++;
            }
            if (delays === 0) resolve();
            break;
          }
          case enemyAction.DEFEND:
          case cardEffect.DEFEND: {
            this.applyShield({amount: effect.values[0], target: caster})
            resolve();
            break;
          }
          case cardEffect.DRAW: {
            this.drawCards(effect.values[0]);
            resolve()
            break;
          }
          case cardEffect.SHUFFLE: {
            break;
          }
          case cardEffect.DISCARDRANDOM: {
            this.discardRandom(effect.values[0]);
            //resolve();
            break;
          }
          case cardEffect.DISCARDHAND: {
            break;
          }
          case cardEffect.EXHAUSTSELF: {
            break;
          }
          case enemyAction.ATTACK_AND_DEFEND: {
            this.applyDamage({amount: effect.values[0], target: target});
            this.applyShield({amount: effect.values[1], target: caster});
            resolve();
            break;
          }
        }
      })
    },

    startEncounter() {
      this.addEnemyById(0);
      this.addEnemyById(0);

      this.enemies.forEach(enemy => {
        this.enemySetIntent(enemy);
      });

      this.clearPiles();
      this.setShield({amount: 0, target: "player"});
      let shuffle = structuredClone(this.getDeckIds);
      shuffle = shuffleArray(shuffle);
      this.setDrawPile(shuffleArray(shuffle));
      this.drawCards(this.drawAmount)
    },

    async endTurn() {
      this.enemies.forEach((enemy) => {
        this.setShield({ amount: 0, target: enemy });
      });
      for (const enemy of this.enemies) {
        await this.resolveEffect(enemy.intent, "player", enemy);
        this.enemyNextAction(enemy);
      }

      this.setShield({amount: 0, target: "player"});
      this.setCurrentMana(this.getMana.max);
      this.discardHand();
      this.drawCards(this.drawAmount);
    },

    onPageRightClick(event) {
      event.preventDefault();
      this.$root.$emit('selectCard', null, null);
    }
  }
}
</script>

<style scoped lang="less">
.battle-screen {
  position: absolute;
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;

  
  .background {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: -5;
    overflow: clip;

    filter: blur(3px);
  }

  .header {
    height: 60px;
    width: 100vw;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    overflow: hidden;
    z-index: 0;

    background: rgb(23, 1, 26);
    
    .deck__button {
      position: relative;
      left: 45%;
      height: 65px;
      width: 65px;

      img {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: -1;
      }
    }
  }

  .middle {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    height: 100px;
    width: 100vw;
    margin-top: 100px;

    .player-area {
      height: 300px;
      width: 300px;
      margin-left: 5%;
      margin-top: 5%;
    }

    .enemy-area {
      display: flex;
      flex-grow: 1;
      height: 100%;
      justify-items: center;
      margin-right: 2%;
      margin-left: 10%;
    }
  }

  .footer {
    height: fit-content;
    width: 100vw;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    overflow: hidden;

    .mana {
      position: relative;
      height: 100px;
      width: 100px;

      img {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: -1;
        filter:hue-rotate(190deg);
      }

      p {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 1;
        color: #000000;
        font-size: 20px;
        font-weight: bold;
        text-shadow: #03e6f7 0px 1px 1px;
      }
    }

    .pile__button {
      position: relative;
      height: 80px;
      width: 80px;

      img {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: -1;
      }
      
      p {
        position: absolute;
        height: 22px;
        width: 22px;
        bottom: 0px;
        z-index: 1;
        color: #000000;
        font-size: 18px;
        font-weight: bold;
        text-shadow: #03e6f7 0px 1px 1px;
        background: #ffffff91;
        border: 2px solid #000000;
        border-radius: 20px;
      }
    }

    .end-turn__button {
      position: relative;
      height: 45px;
      width: 120px;
      border: 5px solid;
      border-radius: 30px;
      cursor: pointer;
      filter: drop-shadow(0px 4px 1px #5f3131);
      background: #240333;
      
      p {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        z-index: 1;
        color: #eb9292d8;
        font-size: 20px;
        font-weight: bold;
        text-shadow: #330202 0px 1px 1px;
      }
    }
  }
}
</style>
