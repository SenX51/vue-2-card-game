<template>
  <div class="player center-horizontal center-vertical noselect">
    <img src="../../assets/player/Player.png" />
    <HealthbarComponent 
      :currentHealth="player.health"
      :maxHealth="player.maxHealth" 
      :shield="player.shield"
    />
  </div>
</template>

<script>
import HealthbarComponent from '../common/HealthbarComponent.vue';

export default {
  components: {
    HealthbarComponent,
  },
  props: {
    player: Object,
  },
};
</script>

<style scoped lang="less">
.player {
  height: 100%;

  img {
    height: 80%;
  }
}
</style>
