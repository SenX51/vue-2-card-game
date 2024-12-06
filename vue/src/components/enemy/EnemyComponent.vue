<template>
  <div class="enemy center-horizontal center-vertical noselect"
    @click="() => onEnemyClick()"
  >
    <div class="enemy__intent">
      <img class="enemy__sprite"
        :src="enemy.intent.type"
      />
      <p>{{ enemy.intent.values[0] }}</p>
      <p v-if="enemy.intent.type == actions.ATTACK_MULTIPLE">
        x{{ enemy.intent.values[1] }}
      </p>
      <p v-if="enemy.intent.type == actions.ATTACK_AND_DEFEND">
        /{{ enemy.intent.values[1] }}
      </p>
    </div>
    <div class="enemy__image">
      <img class="enemy_image" :src="enemy.base.image" draggable="false"/>
    </div>
    <HealthbarComponent :currentHealth="enemy.health" :maxHealth="enemy.base.maxHealth" :shield="enemy.shield"/>
  </div>
</template>

<script>
import HealthbarComponent from '../common/HealthbarComponent.vue';
import enemyAction from '../common/enemyAction';

export default {
  components: {
    HealthbarComponent
  },
  props: {
    enemy: Object,
  },
  computed: {
    actions() {
      return enemyAction;
    },
  },
  methods: {
    onEnemyClick() {
      this.$emit("onEnemyClick", this.enemy);
    }
  },
};
</script>

<style scoped lang="less">
.enemy {
  height: 400px;
  margin-left: 10px;

  &__intent {
    display: flex;
    height: 30px;
    width: fit-content;
    line-height: 30px;

    &__sprite {
      height: 100%;
    }

    p {
      height: 40px;
      font-size: 20px;
      font-weight: bold;
    }
  }

  &__image {
    height: 85%;
    width: fit-content;

    img {
      height: 100%;
    }
  }
}
</style>
