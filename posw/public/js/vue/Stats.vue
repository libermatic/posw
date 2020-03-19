<template>
  <div>
    <h1>Storage</h1>
    <dl>
      <dt>Usage</dt>
      <dd>{{ usage }} / {{ quota }}</dd>
    </dl>
  </div>
</template>

<script>
const factor = 1024 * 1024;
function convert(value) {
  const converted = value / factor;
  return `${converted.toFixed(2)} MB`;
}

export default {
  data: function() {
    return { usage: '0', quota: '0' };
  },
  mounted: function() {
    navigator.storage.estimate().then(({ usage, quota }) => {
      this.usage = convert(usage);
      this.quota = convert(quota);
    });
  },
};
</script>

<style lang="scss" scoped></style>
