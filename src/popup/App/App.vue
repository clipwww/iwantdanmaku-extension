<template>
  <div class="danmaku-wrapper p-4 bg-gray-700 text-white">
    <div class="loader loader-curtain" :class="{ 'is-active': isLoading }"></div>

    <ul class="flex mb-3">
      <li class="flex-1 cursor-pointer" @click="activeTab = 'upload'">
        <span
          class="text-center block border rounded-l py-1 px-2 text-sm"
          :class="activeTab === 'upload' ? 'border-blue-500 bg-blue-500' : 'bg-gray-200 text-blue-500'"
        >上傳.json</span>
      </li>
      <li class="flex-1 cursor-pointer" @click="activeTab = 'fetch'">
        <span
          class="text-center block border rounded-r py-1 px-2 text-sm"
          :class="activeTab === 'fetch' ? 'border-blue-500 bg-blue-500' : 'bg-gray-200 text-blue-500'"
        >輸入來源網址</span>
      </li>
    </ul>

    <div v-show="activeTab === 'upload'" class="border-solid border border-gray-300 p-1 rounded">
      <input class="py-1 w-full" :key="timestamp" type="file" accept=".json" @change="onFileUpload" />
    </div>

    <div v-show="activeTab === 'fetch'" class="w-full flex items-center">
      <input
        class="w-3/4 p-2 text-black outline-none focus:shadow-outline w-full rounded-l"
        type="text"
        v-model="danmakuUrl"
        placeholder="請輸入彈幕來源連結"
      />
      <button
        class="w-1/4 bg-green-500 p-2 whitespace-no-wrap rounded-r"
        :class="!danmakuUrl ? 'opacity-75 cursor-not-allowed' : ''"
        :disabled="!danmakuUrl"
        @click="fetchDanmaku"
      >載入</button>
    </div>

    <div class="w-full inline-flex items-center mt-2">
      <div class="bg-gray-500 p-2 rounded-l whitespace-no-wrap">延遲</div>
      <div class="bg-gray-900 px-3 cursor-pointer text-2xl" @click="delay--">-</div>
      <input
        class="p-2 text-black outline-none text-center focus:shadow-outline w-full"
        type="number"
        v-model="delay"
      />
      <div class="bg-gray-900 px-3 cursor-pointer text-2xl" @click="delay++">+</div>
      <div class="bg-gray-500 p-2 rounded-r whitespace-no-wrap">秒</div>
    </div>

    <div class="my-2 flex items-center">
      <label class="inline-flex items-center mr-3">
        <input type="radio" v-model="engine" value="dom" />
        <span class="ml-1">Dom</span>
      </label>
      <label class="inline-flex items-center">
        <input type="radio" v-model="engine" value="canvas" />
        <span class="ml-1">Canvas</span>
      </label>
    </div>

    <div class="flex items-center justify-between mt-4">
      <button
        class="bg-blue-500 py-2 px-5 rounded text-white"
        @click="load"
      >載入彈幕</button>
      <div>
        <button class="bg-red-300 py-2 px-5 rounded text-white" @click="sendMessage('hide')">隱藏</button>
        <button class="bg-red-500 py-2 px-5 ml-2 rounded text-white" @click="sendMessage('clear')">清除</button>
        <button class="bg-gray-500 py-2 px-5 ml-2 rounded text-white" @click="sendMessage('show')">顯示</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from "vue";
// @ts-ignore
import fetch from "node-fetch";

import { readAsText } from "@/utilities";

export default defineComponent({
  name: "app",
  setup() {
    const state = reactive({
      danmakuList: [],
      danmakuUrl: "",
      activeTab: "upload",
      engine: "dom",
      delay: 0,
      timestamp: +new Date(),
      isLoading: false,
    });

    chrome.storage.sync.get(["activeTab"], ({ activeTab }) => {
      state.activeTab = activeTab || "upload";
    });

    watch(
      () => state.activeTab,
      (val) => {
        chrome.storage.sync.set({ activeTab: val }, () => {
          console.log("storage success");
        });
      }
    );

    async function onFileUpload(e: Event) {
      try {
        state.isLoading = true;
        const target = e.target as HTMLInputElement;
        const files = target.files as FileList;
        const result = await readAsText(files[0]);
        state.danmakuList = JSON.parse(result);
      } catch (err) {
        console.log(err);
      } finally {
        state.isLoading = false;
      }
    }

    async function fetchDanmaku() {
      try {
        const baseUrl = "https://mechakucha-api.fly.dev";
        let url = state.danmakuUrl;

        const matchNico = url.match(
          /(http|https):\/\/(?:www.)?(nicovideo.jp)\/(watch)\/(.*)+$/i
        );
        const matchHimawari = url.match(
          /(http|https):\/\/(?:www.)?(himado.in)\/(.*)+$/i
        );
        const matchBahamut = url.match(
          /ani.gamer.com.tw\/animeVideo.php\?sn=(.*)+$/i
        );
        // const matchBilibili = url.match()

        switch (true) {
          case !!matchNico: {
            const id = matchNico?.[4];
            url = id ? `${baseUrl}/niconico/${id}/danmaku` : "";
            break;
          }
          case !!matchHimawari: {
            let id = matchHimawari?.[3] ?? "";
            url = "";
            if (id.includes("group_id")) {
              id = id.match(/group_id=(.*)/i)?.[1] ?? "";
              url = id ? `${baseUrl}/himawari/${id}/danmaku?group=1` : "";
            } else {
              url = id ? `${baseUrl}/himawari/${id}/danmaku` : "";
            }
            break;
          }
          case !!matchBahamut: {
            let id = matchBahamut?.[1] ?? "";
            url = id ? `${baseUrl}/bahamut/${id}/danmaku` : "";
          }
          case !isNaN(+url):
            url = `${baseUrl}/bilibili/${url}/danmaku`;
          default:
            break;
        }

        if (!url) {
          return;
        }

        state.isLoading = true;
        state.danmakuList = [];
        const response = await fetch(url);
        const ret = await response.json();

        if (!ret.success) {
          return;
        }

        state.danmakuList = ret.items;
      } catch (err) {
        alert(err);
      } finally {
        state.isLoading = false;
      }
    }

    function load() {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0].id) {
          return;
        }
        state.isLoading = true;
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "load",
            danmakuList: state.danmakuList,
            engine: state.engine,
            delay: state.delay,
          },
          (response) => {
            state.isLoading = false;
            console.log("response", response);
          }
        );
      });
    }

    function sendMessage(type: string) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0].id) {
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, {
          type,
        });
      });
    }

    return {
      ...toRefs(state),

      onFileUpload,
      fetchDanmaku,
      load,
      sendMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/css/tailwind.css";
@import "../../assets/css/loader.css";

.danmaku-wrapper {
  width: 350px;
}
</style>
