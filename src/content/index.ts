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
let danmakuOption: { engine: 'dom' | 'canvas', delay: 0 } = {
  engine: 'dom',
  delay: 0,
}

function initDanmaku() {
  console.log('initDanmaku')
  if (danmakuInstance) {
    danmakuInstance.destroy();
  }

  let $video;
  let $container;
  const origin = window.location.origin;

  switch (true) {
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
    case origin.includes('ani.gamer.com.tw'):
      $video = document.querySelector('video') as HTMLVideoElement;
      $container = document.querySelector('.video') as HTMLElement;
      break;
    case origin.includes('bilibili'):
      $video = document.querySelector('video') as HTMLVideoElement;
      $container = $video.parentElement as HTMLElement;
      $video.style.position = 'absolute';
      $container.style.position = 'relative'
      break;
    default:
      $video = document.querySelector('video') as HTMLVideoElement;
      $container = $video.parentElement as HTMLElement;
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
    engine: danmakuOption.engine,
    container: $container,
    media: $video,
    comments: danmakuList.map((item, i) => {
      const shadowColor = lightOrDark(item.color || '#ffffff') === 'dark' ? '#fff' : '#000';
      return {
        text: item.msg || item.text,
        time: item.time + danmakuOption.delay,
        mode: item.mode || 'rtl',
        style: danmakuOption.engine === 'dom' ? {
          fontSize: `${Math.round(fontSize)}px`,
          fontWeight: 'bold',
          color: item.color || '#ffffff',
          textShadow: `-1px -1px ${shadowColor}, -1px 1px ${shadowColor}, 1px -1px ${shadowColor}, 1px 1px ${shadowColor}`,
        } as CSSStyleDeclaration : {
          font: `600 ${fontSize}px sans-serif`,
          textAlign: 'start',
          textBaseline: 'bottom',
          direction: 'inherit',
          fillStyle: item.color || '#ffffff',
          strokeStyle: shadowColor,
          lineWidth: 1.0,
          shadowColor,
          shadowBlur: 1,
        } as CanvasRenderingContext2D,
      }
    })
  });
}

function lightOrDark(color: string) {
  if (color === 'white') return 'light';
  if (color === 'black') return 'dark';

  // Variables for red, green, blue values
  let r: number;
  let g: number;
  let b: number;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    const colorArr = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/) ?? [];
    r = +colorArr[1];
    g = +colorArr[2];
    b = +colorArr[3];
  }
  else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    const colorNum = +("0x" + color.slice(1).replace(color.length < 5 ? /./g : '', '$&$&'));
    r = colorNum >> 16;
    g = colorNum >> 8 & 255;
    b = colorNum & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5 ? 'light' : 'dark';
}

window.addEventListener('resize', () => {
  if (danmakuInstance) {
    danmakuInstance.resize();
    initDanmaku();
  }
})

chrome.runtime.onMessage.addListener(
  function ({ type, danmakuList: arr, delay, engine }, sender, sendResponse) {
    switch (type) {
      case "load":
        danmakuList = arr;
        danmakuOption.engine = engine;
        danmakuOption.delay = delay;
        initDanmaku();
        break;
      case "clear":
        if (danmakuInstance) danmakuInstance.destroy();
        danmakuList = [];
        break;
      case 'hide':
        danmakuInstance.hide();
        break;
      case 'show':
        danmakuInstance.show();
        break;
    }
  }
);


