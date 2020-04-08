<template>
  <div class="root">
    <section>
      <h2>Storage</h2>
      <div class="title">
        <dl>
          <dt>Usage</dt>
          <dd class="highlight">{{ usage }}</dd>
          <dd>{{ quota }}</dd>
        </dl>
      </div>
      <div class="content">
        <dl v-for="feature in features" :key="feature.value">
          <dt>{{ feature.label }}</dt>
          <dd>{{ feature.value }}</dd>
        </dl>
      </div>
    </section>
    <section>
      <h2>Datastore</h2>
      <div class="title">
        <dl>
          <dt>Last Updated</dt>
          <dd class="highlight">{{ lastUpdated.time }}</dd>
          <dd>{{ lastUpdated.date }}</dd>
        </dl>
      </div>
    </section>
  </div>
</template>

<script>
import { getSetting } from '../store';

const factor = 1024 * 1024;
function convert(value) {
  const converted = value / factor;
  return `${converted.toFixed(2)} MB`;
}

export default {
  data: function() {
    return {
      usage: '0',
      quota: '0',
      lastUpdated: { time: 'N/A', date: '' },
      features: [],
      unsynced: [],
    };
  },
  mounted: function() {
    navigator.storage.estimate().then(({ usage, quota, usageDetails = [] }) => {
      this.usage = convert(usage);
      this.quota = convert(quota);
      this.features = [
        ...Object.keys(usageDetails).map(k => ({
          label: k,
          value: convert(usageDetails[k]),
        })),
      ];
    });
    getSetting('lastUpdated').then(lastUpdated => {
      const date = new Date(lastUpdated);
      this.lastUpdated = {
        time: date.toLocaleTimeString(),
        date: date.toLocaleDateString(),
      };
    });
  },
};
</script>

<style lang="scss" scoped>
.root {
  section {
    display: flex;
    flex-flow: row wrap;
    h2 {
      font-size: 1.2em;
      width: 100%;
    }
    dl {
      margin: 0;
    }
    dt {
      font-weight: 300;
    }
    .title {
      min-width: 10em;
      text-align: center;
      dd.highlight {
        font-size: 1.8em;
        padding-bottom: 0.1em;
        border-bottom: 1px solid #d1d8dd;
        margin-bottom: 0.1em;
      }
    }
    .content {
      dl {
        display: flex;
        dd {
          order: -1;
          width: 5em;
          text-align: right;
          margin: 0 1em;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
