import Danmaku from 'danmaku';

interface DanmakuVM {
  text: string
  msg: string
  time: number
  color?: string
  mode?: 'rtl' | 'ltr' | 'top' | 'bottom'
}

let danmakuInstance: Danmaku;
let danmakuList: DanmakuVM[];

function initDanmaku() {
  console.log('initDanmaku')
  if (danmakuInstance) {
    danmakuInstance.destroy();
  }

  let $video;
  let $container;
  const origin = window.location.origin;

  switch(true) {
    case origin.includes('agefans'):
      $video = document.querySelector('iframe')?.contentDocument?.querySelector('video') as HTMLVideoElement;
      $container = $video.parentElement as HTMLElement;
      $video.style.position = 'absolute';
      $video.style.top = '0';
      $video.style.left = '0';
      $container.style.position = 'relative'
      break;
    case origin.includes('youtube'):
      $video = document.querySelector('.html5-main-video') as HTMLVideoElement;
      $container = document.querySelector('.html5-video-container') as HTMLElement;
      $container.style.height = `${$video.clientHeight}px`;
      break;
  }

  if (!$video || !$container) {
    return;
  }
 

  let fontSize = $video.clientHeight / 23;
  fontSize = fontSize < 16 ? 16 : fontSize;

  danmakuInstance = new Danmaku({
    // engine: 'canvas',
    // engine: 'dom',
    engine: 'dom',
    container: $container,
    media: $video,
    comments: danmakuList.map((item, i) => {
      return {
        text: item.msg || item.text,
        time: item.time,
        mode: item.mode || 'rtl',
        style: {
          fontSize: `${Math.round(fontSize)}px`,
          fontWeight: 'bold',
          color: item.color || '#ffffff',
          textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000',
        } as CSSStyleDeclaration
      }
    })
  });
}

window.addEventListener('resize', () => {
  if (danmakuInstance) {
    initDanmaku();
  }
})

chrome.runtime.onMessage.addListener(
  function ({ type, danmakuList: arr }, sender, sendResponse) {
    switch (type) {
      case "load":
        danmakuList = arr;
        initDanmaku();
        break;
      case "clear":
        if (danmakuInstance) danmakuInstance.destroy();
        break;
    }
  }
);


