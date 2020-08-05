<template>
  <div id="content" style="width: 500px;height: 500px">
  </div>
</template>

<script>
  export default {
    name: "Cesium",
    data() {
      return {}
    },
    mounted() {
      this.$nextTick(()=>{
        this.init()
      })
    },
    methods: {
      init(){
        OvitCesium.initMap('content',res=>{
          const data = [
           /* {
              id: 1,
              height: 5 + 6.5,
              url: 'http://192.168.7.122:8080/3d/0630/business%20building/tileset.json'// 加载bim模型
            },
            {
              id: 2,
              height: 5 + 6.5,
              url: 'http://192.168.7.122:8080/3d/0630/Distilling%20Hall/tileset.json'// 加载bim模型
            },
            {
              id: 3,
              height: 22.5 + 6.5,
              url: 'http://192.168.7.122:8080/3d/0630/hotel%20building/tileset.json'// 加载bim模型
            },
            {
              id: 4,
              height: 10 + 6.5,
              url: 'http://192.168.7.122:8080/3d/0630/teaching%20building/tileset.json'// 加载bim模型
            },*/

            {
              id: 5,
              height: 4,
              url: 'http://192.168.7.22:9010/api/tile3dServer/hbasecV2/JSllte_5L35oU5D/tileset.json'// 加载京山倾斜摄影
            }
          ]
          setTimeout (()=>{
            data.forEach(res => {
              OvitCesium.addCesium3DTileset(res)
            })
          }, 3000)
        })
      }
    }
  }
</script>

<style scoped>

</style>