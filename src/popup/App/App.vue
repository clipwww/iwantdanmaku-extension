<template>
  <div class="main_app">
    <div class="danmaku__input">
      <input :key="timestamp" type="file" accept=".json" @change="onFileUpload" />
    </div>
    <div class="danmaku__buttons">
      <button :disabled="!danmakuList.length" @click="load">載入彈幕</button>
      <button @click="clear">清除</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";

import { readAsText } from '@/utilities'

export default defineComponent({
  name: "app",
  setup() {
    const state = reactive({
      danmakuList: [],
      timestamp: +new Date()
    });

    async function onFileUpload(e: InputEvent) {
      const target = e.target as HTMLInputElement;
      const files = target.files as FileList;
      const result = await readAsText(files[0]);
      state.danmakuList = JSON.parse(result);
    }

    function load () {
      if (!state.danmakuList.length) {
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0].id) {
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: "load",
          danmakuList: state.danmakuList,
        }, (response) => {
          console.log('response', response)
        });
      });
    }

    function clear() {
      state.timestamp = +new Date();
      state.danmakuList = [];
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0].id) {
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: "clear",
        });
      });
    }

    return {
      ...toRefs(state),

      onFileUpload,
      load,
      clear,
    };
  },
});
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.danmaku {
  &__control {
    position: fixed;
    top: 100px;
    right: -230px;
    z-index: 999;
    width: 230px;
    background-color: #fff;
    border-radius: 3px 0 0 3px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    padding: 30px;
    transition: all 0.3s;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
    &.is-active {
      right: 0;
    }
  }

  &__input {
    padding: 5px;
    border: 1px solid #ddd;
    overflow: hidden;
  }

  &__buttons {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
