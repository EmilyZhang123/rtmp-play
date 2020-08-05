<template>
  <div class="home">
    <video-player class="video-player vjs-custom-skin"
                  :playsinline = "true"
                  :options = "playerOptions" >
    </video-player>
  </div>
</template>

<script>
// @ is an alias to /src
import videojs from 'video.js'

import 'videojs-flash'
import { videoPlayer } from 'vue-video-player'
import SWF_URL from 'videojs-swf/dist/video-js.swf'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
videojs.options.flash.swf = SWF_URL
export default {
  name: 'Home',
  components: {
    videoPlayer
  },
  data(){
    return {
      videoSrc: '',
      playerOptions: {
        live: true,
        autoplay: true, // 如果true，浏览器准备好时开始播放
        muted: false, // 默认情况下将会消除任何音频
        loop: false, // 是否视频一结束就重新开始
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        controlBar: {
          timeDivider: false,
          durationDisplay: false,
          remainingTimeDisplay: false,
          currentTimeDisplay: false, // 当前时间
          volumeControl: false, // 声音控制键
          playToggle: false, // 暂停和播放键
          progressControl: false, // 进度条
          fullscreenToggle: true // 全屏按钮
        },
        techOrder: ['flash'], // 兼容顺序
        flash: {
          hls: {
            withCredentials: false
          },
          swf: SWF_URL
        },
        sources: [{
          type: 'rtmp/flv',
          src: 'rtmp://192.168.13.53:1935/live/detect' // 视频地址-改变它的值播放的视频会改变
          // src: 'rtmp://192.168.13.53:1935/live/122test' // 视频地址-改变它的值播放的视频会改变
          // src: 'rtmp://192.168.13.117:1935/live/1271262830061428737test' // 视频地址-改变它的值播放的视频会改变
        }],
        notSupportedMessage: '此视频暂无法播放，请稍后再试' // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
      }
    }
  }

}
</script>
<style scoped>
  .home {
    width: 100%;
    height: 100%;
  }
</style>
