// document.write("<script src='https://unpkg.com/@turf/turf/turf.min.js'></script>")
let  OvitCesium = {
    viewer: null,
    camera: null,
    exection_fixedPointSurround: null, // 定点环绕
    exection_flyAroundThePoint: null, // 绕点飞行
    Intervisibility:null,//通视分析中的交互
    handler:null,
    tilesetCollect:[],
    tilesetData: {
        data2D: [],
        data3D: []
    },
    // handleClick: { // 点击bim模型弹出回调对象
    //     clickBim: null
    // },
    initMap(target, callback) {
        debugger
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTc0NWEyMy1iNDM0LTQxNjgtOWUyNC04OTNjZWVjZTYzMzgiLCJpZCI6MTQ2MDQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjU5MTgwOTJ9.1ZBLy20wxQtIWE634kI5UNMFFM6eHyUUWCJQIgL6r-I'
        this.viewer = new Cesium.Viewer(target, {
            shouldAnimate: true,
            requestRenderMode: true,
            clockViewModel: new Cesium.ClockViewModel(),
            //terrainProvider: Cesium.createWorldTerrain(), //地形
            animation: false, //是否显示动画控件
            homeButton: false, //是否显示home键
            geocoder: false, //是否显示地名查找控件        如果设置为true，则无法查询
            baseLayerPicker: false, //是否显示图层选择控件
            timeline: false, //是否显示时间线控件
            fullscreenButton: false, //是否全屏显示
            terrainShadows: Cesium.ShadowMode.ENABLED, //
            scene3DOnly:true,     //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
            //cesium状态下允许canvas转图片convertToImage
            contextOptions: {
                //cesium状态下允许canvas转图片convertToImage
                webgl: {
                    alpha: true,
                    depth: false,
                    stencil: true,
                    antialias: true,
                    premultipliedAlpha: true,
                    preserveDrawingBuffer: true,
                    failIfMajorPerformanceCaveat: true
                },
                allowTextureFilterAnisotropic: true
            },
            infoBox: false, //是否显示点击要素之后显示的信息
            sceneModePicker: false, //是否显示投影方式控件  三维/二维
            navigationInstructionsInitiallyVisible: false,
            navigationHelpButton: false, //是否显示帮助信息控件
            selectionIndicator: false, //是否显示指示器组件
            useDefaultRenderLoop: true,
            automaticallyTrackDataSourceClocks: true, //自动追踪最近添加的数据源的时钟设置,默认true
            targetFrameRate: 60,
            resolutionScale: 0.1, //获取或设置渲染分辨率的缩放因子。 值小于1.0时能够在不太强大的设备上提高性能；相反，值大于1.0时将会以更高分辨率渲染，然后按比例缩小，以此提高视觉保真度。
            //加载谷歌卫星影像
           /* imageryProvider: new Cesium.UrlTemplateImageryProvider({
              url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
              tilingScheme: new Cesium.WebMercatorTilingScheme()
            })*/
        })
        this.viewer.scene.globe.depthTestAgainstTerrain = true
        this.viewer._cesiumWidget._creditContainer.style.display = "none" //	去除版权信息
        OvitCesium.handler = new Cesium.ScreenSpaceEventHandler(OvitCesium.viewer.canvas);
        //加载右侧三维工具条
        if (Cesium.viewerCesiumNavigationMixin) {
            OvitCesium.viewer.extend(Cesium.viewerCesiumNavigationMixin, {
            })
        }
        callback(this.viewer)
    },
    // 加载三维模型
    addCesium3DTileset(TilesetData) {
        if(TilesetData.type&&TilesetData.type=='Tiltphotography'){
            //裁剪切割平面集合
            OvitCesium.ClippingPlaneCollection = new Cesium.ClippingPlaneCollection({
                planes: [],
                unionClippingRegions: false, //中间区域给裁剪掉取交集，否则取并集
                //edgeColor: Cesium.Color.WHITE, // 平面切割时模型的边缘颜色
                edgeWidth: 1 // 平面切割时模型的边缘宽度
            });
        }
        let tileset = new Cesium.Cesium3DTileset({
            //id:TilesetData.id,
            url: TilesetData.url,
            // clippingPlanes: OvitCesium.ClippingPlaneCollection,
            maximumScreenSpaceError: 16, //最大的屏幕空间误差 值越高，性能越好，但视觉质量越低
            preloadWhenHidden: false,
            preferLeaves: false,
            cullWithChildrenBounds: true, //优化选项。是否使用子项边界体积的并集来剔除图块。
            cullRequestsWhileMoving: true, //优化选项。请勿请求由于相机的移动而可能回来的未使用的图块。
            cullRequestsWhileMovingMultiplier: 60.0, //优化选项。移动时用于剔除请求的乘数。较大的代表更积极的淘汰，较小的则不那么积极的淘汰。
            dynamicScreenSpaceError: true, //优化选项。减少远离相机的瓷砖的屏幕空间误差。
            dynamicScreenSpaceErrorDensity: 0.00278,
            dynamicScreenSpaceErrorFactor: 4.0,
            dynamicScreenSpaceErrorHeightFalloff: 0.25,
            progressiveResolutionHeightFraction: 0.3,
            foveatedScreenSpaceError: true, //优化选项。通过临时提高屏幕边缘周围的图块的屏幕空间错误，可以优先在屏幕中央加载图块。
            foveatedConeSize: 0.1,
            foveatedMinimumScreenSpaceErrorRelaxation: 0.0,
            foveatedTimeDelay: 0.2,
            skipLevelOfDetail: true, //优化选项。确定在遍历期间是否应该应用详细级别跳过。
            baseScreenSpaceError: 1024,
            skipScreenSpaceErrorFactor: 16,
            skipLevels: 1,
            immediatelyLoadDesiredLevelOfDetail: true, //如果为true，则只会下载满足最大屏幕空间误差的切片。忽略跳过因子，只加载所需的切片。
            loadSiblings: false, //确定是否始终在遍历期间下载可见切片的兄弟节点。这对于确保在观看者向左/向右转动时已经可用的图块可能是有用的。
        })
        tileset.id = TilesetData.id;
        if(TilesetData.type){
            tileset.type = TilesetData.type;
        }
        this.viewer.scene.camera.constrainedAxis = undefined
        var tilesetData3D = this.viewer.scene.primitives.add(tileset)
        this.tilesetCollect.push(tileset)
        this.tilesetData.data3D.push(tilesetData3D)
        var initialPosition = {
            offset: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                range: Cesium.Math.toRadians(0)
            }
        }
        OvitCesium.viewer.flyTo(tileset, initialPosition)
        tileset.readyPromise.then(function(tileset) {
            OvitCesium.viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0))
            OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
            if(TilesetData.type&&TilesetData.type=='bim'){

            }else{
                changeHeight(TilesetData.height, tileset)
            }
        })
        function changeHeight(height, tileset) {
            height = Number(height)
            if (isNaN(height)) {
                return
            }
            let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center) // 弧度
            let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
            let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height)
            let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
        }
    },
    // 加载二维WMS
    add2DWMS (data) {
        var provider = new Cesium.WebMapServiceImageryProvider({
            url: data.url,
            layers: data.layers,
            version: data.version,
            parameters: {
                service: 'WMS',
                // tiled: true,
                format: data.format,
                transparent: true,
                // styles: data.styleRealSaveName,
                // srs: SYS_CONFIG.Map2D_EPSG,
                request: 'GetMap',
                // 'TILED': data.TILED,// 是否启用后台缓存
                // 'FILTER': data.filter ? data.filter : null,
            }
        });
        provider.guid = data.id; //标识
        var tilesetData2D = OvitCesium.viewer.imageryLayers.addImageryProvider(provider)
        this.tilesetData.data2D.push(tilesetData2D)
        // data.tileset3D.show = data.isShow3D;
        // this.getCurrentExtent();
    },
    // this.compass()
    mapLinkage () {
        if (this.tilesetData.data3D[0].show) {
            // debugger
            // var aa = OvitCesium.viewer
            for (let index = 0; index < this.tilesetData.data3D.length; index++) {
                const data3D = this.tilesetData.data3D[index]
                this.layerShow(this.tilesetData.data3D[index], false)
            }
            this.compass()
        } else if (!this.tilesetData.data3D[0].show) {
            for (let index = 0; index < this.tilesetData.data3D.length; index++) {
                const data3D = this.tilesetData.data3D[index]
                this.layerShow(this.tilesetData.data3D[index], true)
            }
        }
    },
    // 三维隐藏
    layerShow(tileset, LayerSwitch) {
        tileset.show = LayerSwitch;
        if (LayerSwitch) {
            OvitCesium.viewer.camera.zoomIn((1));
        } else {
            OvitCesium.viewer.camera.zoomOut((1));
        }
    },
    // 天际线分析
    skyLine () {
        // // 创建天际线分析对象
        // var skyline = new Cesium.Skyline(this.tilesetData.data3D[0]);
        // //设置颜色
        // skyline.color = Cesium.Color.CYAN;
        // // 设置天际线的显示模式,DisplayMode.LINE表示天际线的线模式，DisplayMode.FACE表示天际线的面模式
        // //默认为线模式
        // skyline.displayStyle = Cesium.Skyline.displayMode.LINE
        // // 获取场景的当前相机位置
        // var cartographic = scene.camera.positionCartographic;
        // var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        // var height = cartographic.height;
        // //天际线分析的视口位置设置成当前相机位置
        // skyline.viewPosition = [longitude, latitude, height];
        // // 设置俯仰，单位：度，取值范围为0-90
        // skyline.pitch = Cesium.Math.toDegrees(scene.camera.pitch);
        // // 获取或设置相机与正北方向的夹角。单位：度，取值范围0-360
        // skyline.direction = Cesium.Math.toDegrees(scene.camera.heading);
        // // 天际线分析半径设置为10000米，单位：米。默认值为-1.0，表示无穷远
        // skyline.radius = 10000;
        // // 执行天际线分析
        // skyline.build();

        var collection = this.viewer.scene.postProcessStages;

        var edgeDetection = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();

        var postProccessStage = new Cesium.PostProcessStage({
            name: 'czm_skylinetemp',
            fragmentShader: 'uniform sampler2D colorTexture;' +
                'uniform sampler2D depthTexture;' +

                'varying vec2 v_textureCoordinates;' +

                'void main(void)' +
                '{' +
                'float depth = czm_readDepth(depthTexture, v_textureCoordinates);' +
                'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
                'if(depth<1.0 - 0.000001){'+
                'gl_FragColor = color;' +
                '}'+
                'else{'+
                'gl_FragColor = vec4(1.0,0.0,0.0,1.0);'+
                '}'+
            '}'
        });

        var postProccessStage1 = new Cesium.PostProcessStage({
            name: 'czm_skylinetemp1',
            fragmentShader: 'uniform sampler2D colorTexture;' +
                'uniform sampler2D redTexture;' +
                'uniform sampler2D silhouetteTexture;' +

                'varying vec2 v_textureCoordinates;' +

                'void main(void)' +
                '{' +
                'vec4 redcolor=texture2D(redTexture, v_textureCoordinates);'+
                'vec4 silhouetteColor = texture2D(silhouetteTexture, v_textureCoordinates);' +
                'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
                'if(redcolor.r == 1.0){'+
                'gl_FragColor = mix(color, vec4(1.0,0.0,0.0,1.0), silhouetteColor.a);' +
                '}'+
                'else{'+
                'gl_FragColor = color;'+
                '}'+
            '}',
            uniforms: {
                redTexture: postProccessStage.name,
                silhouetteTexture: edgeDetection.name
            }
        });

        var postProccessStage = new Cesium.PostProcessStageComposite({
            name: 'czm_skyline',
            stages: [edgeDetection, postProccessStage, postProccessStage1],
            inputPreviousStageTexture: false,
            uniforms: edgeDetection.uniforms
        });

        collection.add(postProccessStage);

    },
    flyToSite(tileset) {
        var initialPosition = {
            offset: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                range: Cesium.Math.toRadians(0)
            }
        }
        OvitCesium.viewer.flyTo(tileset, initialPosition)
    },
    // 模型偏移
    update3dtilesMaxtrix(params, tileset) {
        /*  tx: 105.7392276,  //模型中心X轴坐标（经度，单位：十进制度）
            ty: 24.2875625,    //模型中心Y轴坐标（纬度，单位：十进制度）
            tz: 72,    //模型中心Z轴坐标（高程，单位：米）
            rx: 0,    //X轴（经度）方向旋转角度（单位：度）
            ry: 0,    //Y轴（纬度）方向旋转角度（单位：度）
            rz: 40      //Z轴（高程）方向旋转角度（单位：度） */
        //旋转
        OvitCesium.tilesetOld_transform = tileset._root.transform;
        let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
        let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
        let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
        let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
        let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
        let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
        //平移
        let position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        //旋转、平移矩阵相乘
        Cesium.Matrix4.multiply(m, rotationX, m);
        Cesium.Matrix4.multiply(m, rotationY, m);
        Cesium.Matrix4.multiply(m, rotationZ, m);
        //赋值给tileset
        let scale = Cesium.Matrix4.fromUniformScale(0.2)
        Cesium.Matrix4.multiply(m, scale, m)
        tileset._root.transform = m;
    },
    loadLeftClickInput(tileset,callback){
        //注册点击事件，点击bim时进行属性获取并高亮显示模块。
        this.handler.setInputAction(movement => {
            const pickedFeature = OvitCesium.viewer.scene.pick(movement.position);
            if (!Cesium.defined(pickedFeature)) {
                return
            };
            if(!pickedFeature.color)return//不存在说明不是Cesium3DTileFeature
            OvitCesium.tilesetCollect.forEach(res => {
                if (res.id == 6) {
                    tileset = res;
                }
            });
            const data = {};
            const allNames = pickedFeature.getPropertyNames();
            for (let i = 0; i < allNames.length; i++) {
                const element = allNames[i];
                data[element] = pickedFeature.getProperty(element);
            }
            let conditions = [
                ['${id} === ' + "'" + data.id + "'", 'rgba(0, 122, 204,1)'],
                ['true', 'rgba(255, 255, 255,1)']
            ];
            OvitCesium.changeTilesetColor(tileset, conditions);
            //console.log(data)
            callback(data)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    get3dtilesById(id, callback) {
        let tileset = null;
        this.tilesetCollect.forEach(res => {
            if (res.id&&res.id === id) {
                tileset = res
            }
        });
        callback(tileset)
    },
    removeCesium3DTileset(id){
        let tileset = null;
        this.tilesetCollect.forEach(res => {
            if (res.id&&res.id === id) {
                tileset = res
            }
        });
        this.viewer.scene.primitives.remove(tileset)
    },
    getInverseTransform(tileSet) {
        // 获取坐标转换矩阵
        let transform;
        transform = Cesium.Matrix4.fromArray(OvitCesium.tilesetOld_transform)
        return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())
    },
    changeTilesetColor(tileset, conditions) {
        tileset.style = new Cesium.Cesium3DTileStyle({
            'color': {
                'conditions': conditions
            }
        })
    },
    handleNodeClick(data) { // 点击关联定位,此处只获取bim
        let tileset;
        OvitCesium.get3dtilesById(6, res => {
            tileset = res;
        });
        if (!tileset) {
            return
        }
        const nodesphere = data.sphere;
        let center = new Cesium.Cartesian3(nodesphere[0], nodesphere[1], nodesphere[2]);
        OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        OvitCesium.inverseTransform = this.getInverseTransform(tileset);
        if (OvitCesium.inverseTransform && tileset._root.transform) {
            //multiply计算两个矩阵的乘积
            var mat = Cesium.Matrix4.multiply(tileset._root.transform, OvitCesium.inverseTransform, new Cesium.Matrix4());
            //矩阵和中心的乘积，返回笛卡尔3
            center = Cesium.Matrix4.multiplyByPoint(mat, center, new Cesium.Cartesian3());
        }
        const sphere = new Cesium.BoundingSphere(center, nodesphere[3] - 5);
        let conditions = [
            ['${id} === ' + "'" + data.id + "'", 'rgba(0, 122, 204,1)'], //0, 122, 204
            ['true', 'rgba(255, 255, 255,1)']
        ];
        OvitCesium.changeTilesetColor(tileset, conditions);
        OvitCesium.viewer.camera.flyToBoundingSphere(sphere, {
            duration: 1
        });
        setTimeout(()=>{
            OvitCesium.changeTilesetColor(tileset, [['true', 'rgba(255, 255, 255,1)']]);
        },3000)
    },
    updateSelectEntityColor(state, type, iaggrs) {
        // state:状态(true or false) boolean
        // type:字段名字 id or name  字符串
        // iaggrs:id 或者是 name的数组 对象
        let strJson = [];
        let tileset;
        if (state) {
            iaggrs.forEach(id => {
                let temp = [];
                temp.push("${" + type + "} === " + "'" + id + "'");
                temp.push('true');
                strJson.push(temp);
            });
            OvitCesium.get3dtilesById(6, res => {
                tileset = res;
            });
            if(strJson.length==0){
                tileset.style = new Cesium.Cesium3DTileStyle({
                    show: true
                })
            }else{
                tileset.style = new Cesium.Cesium3DTileStyle({
                    show: {
                        conditions: strJson
                    }
                })
            }
        }
    },

    // 绘制工具 drawingMode 绘制类型  inputAction 是否启用 LEFT_CLICK：单击 MOUSE_MOVE：移动 LEFT_DOUBLE_CLICK：双击结束
    drawingTools (drawingMode, inputAction, callback) {
        let activeShapePoints = [];
        let activeShape;
        let meatruePointArr = [];
        let floatingPoint;
        let tiediData = []
        OvitCesium.handler = new Cesium.ScreenSpaceEventHandler(OvitCesium.viewer.canvas);

        if(inputAction.LEFT_CLICK) {
            //左键点击获取坐标，且获取第一个坐标值
            OvitCesium.handler.setInputAction((event) => { // 鼠标左键单击事件
                let earthPosition = OvitCesium.viewer.scene.pickPosition(event.position);
                tiediData.push(earthPosition)
                if (Cesium.defined(earthPosition)) {
                    if (meatruePointArr.length === 0) {
                        floatingPoint = this.drawShape(earthPosition, 'point'); //悬浮点位
                        activeShapePoints.push(earthPosition);
                        let dynamicPositions = new Cesium.CallbackProperty(() => {
                            if (drawingMode === 'polygon') {
                                return new Cesium.PolygonHierarchy(activeShapePoints);
                            }
                            return activeShapePoints;
                        }, false);
                        activeShape = this.drawShape(dynamicPositions, drawingMode);
                    }
                    //活动点
                    activeShapePoints.push(earthPosition);
                    // this.drawShape(earthPosition, 'point');
                    var cartographic = Cesium.Cartographic.fromCartesian(earthPosition); //世界坐标转地理坐标（弧度）
                    var earthPosition_lonlat = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, cartographic.height]; //地理坐标（弧度）转经纬度坐标
                    //测量点
                    meatruePointArr.push(earthPosition_lonlat);
                }
                callback({type: 'LEFT_CLICK', parameter: {position: tiediData, activeShapePoints: activeShapePoints,
                meatruePointArr: meatruePointArr}})
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }

        if(inputAction.MOUSE_MOVE) {
            OvitCesium.handler.setInputAction((event) => { // 鼠标移动时实时获取坐标
                OvitCesium.viewer.camera.zoomIn(0.001); //重新渲染
                if (Cesium.defined(floatingPoint)) {
                    let newPosition = OvitCesium.viewer.scene.pickPosition(event.endPosition);
                    if (Cesium.defined(newPosition)) {
                        floatingPoint.position.setValue(newPosition);
                        activeShapePoints.pop();
                        activeShapePoints.push(newPosition);
                    }
                }
                callback({type: 'MOUSE_MOVE', parameter: event})
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }

        if(inputAction.LEFT_DOUBLE_CLICK) {
            OvitCesium.handler.setInputAction(() => { // 左键双击结束
                OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                OvitCesium.viewer.trackedEntity = undefined;
                OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
                callback({type: 'LEFT_DOUBLE_CLICK', parameter: {activeShapePoints: activeShapePoints,
                    meatruePointArr: meatruePointArr}})
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    },
    // 传入坐标开始绘制 positionData: 点位 drawingMode: 绘制类型 Color：绘制颜色 text：文本
    drawShape (positionData, drawingMode, Color, text) {
        if (drawingMode == 'line') {
            var intervisibilityshape = {
                // type: ,
                polyline: {
                    positions: positionData,
                    width: 3,
                    material: Color ? Color : Cesium.Color.DARKORANGE,
                    clampToGround: true,
                }
            }
            OvitCesium.intervisibilityshape = OvitCesium.viewer.entities.add(intervisibilityshape);
        } else if (drawingMode === 'point') {
            var intervisibilityshape = {
                position: positionData,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Color ? Color : Cesium.Color.WHITE,
                    outlineWidth: 2,
                }
            }
            if (text) {
                intervisibilityshape.label = {
                    text: text,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20)
                }
            }
            OvitCesium.intervisibilityshape = OvitCesium.viewer.entities.add(intervisibilityshape);
        } else if (drawingMode === 'polygon') {
            OvitCesium.intervisibilityshape = OvitCesium.viewer.entities.add({
                polygon: {
                    hierarchy: positionData,
                    material: new Cesium.ColorMaterialProperty(Cesium.Color.DARKORANGE.withAlpha(0.5))
                }
            });
        } else if (drawingMode === 'triangle') {
            OvitCesium.intervisibilityshape = OvitCesium.viewer.entities.add({
                polyline: {
                    positions: positionData,
                    width: 3,
                    material: Color ? Color : Cesium.Color.DARKORANGE,
                    clampToGround: false,
                }
            });
        }
        return OvitCesium.intervisibilityshape;
    },
    //清除各功能增加的实体（包括测量，通视分析等）
    clear_ () {
        if (OvitCesium.viewer.entities) {
            OvitCesium.viewer.entities.removeAll();
        }
        if(OvitCesium.handler){
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        }
        OvitCesium.viewer.camera.zoomIn(0.001);
    },

    //测量距离工具
    measureDistanceTool (drawingMode) {
        let textDisance = "";
        var inputAction = {
            LEFT_CLICK: true,
            MOUSE_MOVE: true,
            LEFT_DOUBLE_CLICK: true
        }
        this.drawingTools(drawingMode, inputAction, (event) => {
            switch (event.type) {
                case 'LEFT_CLICK': // 鼠标左键单击事件
                    this.drawShape(event.parameter.position[event.parameter.position.length - 1], 'point');
                    if (drawingMode === 'triangle') { // 三角测量 绘制一条直线
                        if (event.parameter.position.length === 2) {
                            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
                            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
                            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

                            let max,min,max_lonlat,min_lonlat,vertical
                            if(event.parameter.meatruePointArr[0][2] >= event.parameter.meatruePointArr[1][2]){
                                max_lonlat = event.parameter.meatruePointArr[0]
                                min_lonlat = event.parameter.meatruePointArr[1]
                            }else{
                                max_lonlat = event.parameter.meatruePointArr[1]
                                min_lonlat = event.parameter.meatruePointArr[0]
                            }
                            max=Cesium.Cartesian3.fromDegreesArrayHeights(max_lonlat)[0]
                            min=Cesium.Cartesian3.fromDegreesArrayHeights(min_lonlat)[0]
                            //垂直点
                            vertical=Cesium.Cartesian3.fromDegreesArrayHeights([min_lonlat[0],min_lonlat[1],max_lonlat[2]])[0]
                            //绘制线
                            this.drawShape([max,vertical], drawingMode)
                            this.drawShape([min,vertical], drawingMode)
                            //
                            let midHeight = Cesium.Cartesian3.fromDegreesArrayHeights([min_lonlat[0],min_lonlat[1],(max_lonlat[2]+min_lonlat[2])/2])[0]
                            let midPoint = Cesium.Cartesian3.fromDegreesArrayHeights([(max_lonlat[0]+min_lonlat[0])/2,(max_lonlat[1]+min_lonlat[1])/2,(max_lonlat[2]+min_lonlat[2])/2])[0]
                            let height = '高度:'+(max_lonlat[2]-min_lonlat[2]).toFixed(2) + 'm'
                            let distance = Cesium.Cartesian3.distance(max,min)
                            createDistanceLab(midHeight,height)
                            createDistanceLab(midPoint,'空间距离:'+distance.toFixed(2) + "m")
                            let geodesic = new Cesium.EllipsoidGeodesic();
                            geodesic.setEndPoints(Cesium.Cartographic.fromCartesian(max), Cesium.Cartographic.fromCartesian(min));
                            textDisance = '平面距离:'+geodesic.surfaceDistance.toFixed(2) + "m"
                            createDistanceLab(vertical,textDisance)
                        }
                    }
                    break;
                case 'MOUSE_MOVE': // 鼠标移动时实时获取坐标

                    break;
                case 'LEFT_DOUBLE_CLICK': // 左键双击结束
                    let line;
                    let length_s;
                    let polygon;
                    let area;
                    if (event.parameter.meatruePointArr.length > 2) {
                        event.parameter.meatruePointArr.pop()
                    }
                    if (drawingMode == 'line') {
                        //debugger
                        line = turf.lineString(event.parameter.meatruePointArr);
                        length_s = turf.length(line, {
                            units: 'kilometers'
                        });
                        if (parseInt(length_s) > 0) {
                            textDisance = length_s.toFixed(2) + "km";
                        } else {
                            textDisance = (length_s * 1000).toFixed(2) + "m";
                        }
                    } else if (drawingMode == 'polygon') {
                        event.parameter.meatruePointArr.unshift(event.parameter.meatruePointArr[event.parameter.meatruePointArr.length - 1])
                        polygon = turf.polygon([event.parameter.meatruePointArr]);
                        area = turf.area(polygon);
                        textDisance = area.toFixed(2) + "m²"
                    }
                    if(drawingMode != 'triangle'){
                        createDistanceLab(event.parameter.activeShapePoints[event.parameter.activeShapePoints.length - 1],textDisance)
                    }
                    break;
                default:
                    break;
            }
        })

        function createDistanceLab (Coordinatepoint, text) {
            OvitCesium.viewer.entities.add({
                name: '空间测量',
                // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
                position: Coordinatepoint,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: text,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        }
    },
    //绘制路线
    drawRoute (stepLength, callback){
        if(stepLength){
            // stepLength = 10
            stepLength = stepLength / 1000
        }
        let meatruePointArr = []
        let surplus = 0
        var inputAction = {
            LEFT_CLICK: true,
            MOUSE_MOVE: true,
            LEFT_DOUBLE_CLICK: true
        }
        if (!stepLength) { // 绘制点
            inputAction = {
                LEFT_CLICK: true,
                MOUSE_MOVE: false,
                LEFT_DOUBLE_CLICK: false
            }
        }
        this.drawingTools('line', inputAction, (event) => {
            switch (event.type) {
                case 'LEFT_CLICK': // 鼠标左键单击事件
                    this.drawShape(event.parameter.position[event.parameter.position.length - 1], 'point');
                    callback([Cesium.Cartesian3.fromDegreesArrayHeights(event.parameter.meatruePointArr[event.parameter.meatruePointArr.length - 1])[0]])
                    if (!stepLength && event.parameter.position.length === 1) { // 绘制点
                        OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
                    }
                    break;
                case 'MOUSE_MOVE': // 鼠标移动时实时获取坐标

                    break;
                case 'LEFT_DOUBLE_CLICK': // 左键双击结束
                    meatruePointArr = event.parameter.meatruePointArr
                    meatruePointArr.pop()
                    var routeCoord = getRouteCoord(stepLength, { units: 'kilometers' })
                    var points=[]
                    for (var i = 0; i <= routeCoord.length-1; i++) {
                        var point = Cesium.Cartesian3.fromDegreesArrayHeights(routeCoord[i])[0]
                        points.push(point)
                    }
                    callback(points)
                    break;
                default:
                    break;
            }
        })

        function getRouteCoord(stepLength,units) {
            var newRouteCoords = [];
            for (let i = 0; i < meatruePointArr.length - 1; i++) {
                var from = turf.point(meatruePointArr[i]);
                var to = turf.point(meatruePointArr[i + 1]);
                if (i === 0) {
                    newRouteCoords.push(meatruePointArr[i])
                }else{
                    if(surplus === 0){
                        newRouteCoords.push(meatruePointArr[i])
                    }else{
                        var route = turf.lineString([from.geometry.coordinates, to.geometry.coordinates])
                        var point=turf.along(route, (stepLength - surplus), { units: 'kilometers' });
                        point.geometry.coordinates.push(meatruePointArr[i][2])
                        from=turf.point(point.geometry.coordinates)
                        newRouteCoords.push(point.geometry.coordinates)
                    }
                }
                let Distance = turf.distance(from, to, units);
                if (Distance > stepLength) {
                    let rings = lineMore(from, to, Distance, stepLength)
                    //debugger
                    newRouteCoords = newRouteCoords.concat(rings)
                    if(i==meatruePointArr.length - 2){
                        newRouteCoords.push(meatruePointArr[i + 1])
                    }
                } else {
                    newRouteCoords.push(meatruePointArr[i + 1])
                }
            }
            return newRouteCoords
        }

        function lineMore(from, to, distance, stepLength) {
            var step = parseInt(distance / stepLength)
            surplus = distance - step * stepLength
            var rings = []
            var route = turf.lineString([from.geometry.coordinates, to.geometry.coordinates])
            for (let i = 1; i <= step; i++) {
                let nlength = i * stepLength
                let pnt = turf.along(route, nlength, { units: 'kilometers' });
                pnt.geometry.coordinates.push(meatruePointArr[0][2])
                rings.push(pnt.geometry.coordinates)
            }
            if (surplus > 0) {
                // rings.push(to.geometry.coordinates)
            }
            return rings
        }
    },

    //测量距离工具
    measureDistanceTool_old(drawingMode) {
        this.clear_()
        let activeShapePoints = [];
        let activeShape;
        let meatruePointArr = [];
        let floatingPoint;
        let tiediData = []
        // let distanceNum=0;
        let textDisance = "";
        var that = this
        OvitCesium.handler = new Cesium.ScreenSpaceEventHandler(OvitCesium.viewer.canvas);
        //左键点击获取坐标，且获取第一个坐标值
        OvitCesium.handler.setInputAction(function (event) { //鼠标左键单击事件
            //debugger
            let position = OvitCesium.viewer.scene.camera.pickEllipsoid(event.position, OvitCesium.viewer.scene.globe.ellipsoid);
            let earthPosition = OvitCesium.viewer.scene.pickPosition(event.position);
            tiediData.push(earthPosition)
            if (Cesium.defined(earthPosition)) {
                if (meatruePointArr.length === 0) {
                    floatingPoint = createPoint(earthPosition); //悬浮点位
                    activeShapePoints.push(earthPosition);
                    let dynamicPositions = new Cesium.CallbackProperty(function () {
                        if (drawingMode === 'polygon') {
                            return new Cesium.PolygonHierarchy(activeShapePoints);
                        }
                        return activeShapePoints;
                    }, false);
                    activeShape = that.drawShape(dynamicPositions,drawingMode);
                }
                //活动点
                activeShapePoints.push(earthPosition);
                createPoint(earthPosition);
                var cartographic = Cesium.Cartographic.fromCartesian(earthPosition); //世界坐标转地理坐标（弧度）
                var earthPosition_lonlat = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, cartographic.height]; //地理坐标（弧度）转经纬度坐标
                //测量点
                meatruePointArr.push(earthPosition_lonlat);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        OvitCesium.handler.setInputAction(function (event) { //鼠标移动时实时获取坐标
            OvitCesium.viewer.camera.zoomIn(0.001); //重新渲染
            if (Cesium.defined(floatingPoint)) {
                let newPosition = OvitCesium.viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        OvitCesium.handler.setInputAction(function () { //左键双击结束
            OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            OvitCesium.viewer.trackedEntity = undefined;
            let line;
            let length_s;
            let polygon;
            let area;
            if (meatruePointArr.length > 2) {
                meatruePointArr.pop()
            }
            if (drawingMode == 'line') {
                //debugger
                line = turf.lineString(meatruePointArr);
                length_s = turf.length(line, {
                    units: 'kilometers'
                });
                if (parseInt(length_s) > 0) {
                    textDisance = length_s.toFixed(2) + "km";
                } else {
                    textDisance = (length_s * 1000).toFixed(2) + "m";
                }
            } else if (drawingMode == 'polygon') {
                meatruePointArr.unshift(meatruePointArr[meatruePointArr.length - 1])
                polygon = turf.polygon([meatruePointArr]);
                area = turf.area(polygon);
                textDisance = area.toFixed(2) + "m²"
            }else if(drawingMode == 'triangle'){
                let max,min,max_lonlat,min_lonlat,vertical
                if(meatruePointArr[0][2]>=meatruePointArr[1][2]){
                    max_lonlat=meatruePointArr[0]
                    min_lonlat=meatruePointArr[1]
                }else{
                    max_lonlat=meatruePointArr[1]
                    min_lonlat=meatruePointArr[0]
                }
                max=Cesium.Cartesian3.fromDegreesArrayHeights(max_lonlat)[0]
                min=Cesium.Cartesian3.fromDegreesArrayHeights(min_lonlat)[0]
                //垂直点
                vertical=Cesium.Cartesian3.fromDegreesArrayHeights([min_lonlat[0],min_lonlat[1],max_lonlat[2]])[0]
                //绘制线
                that.drawShape([max,vertical],drawingMode)
                that.drawShape([min,vertical],drawingMode)
                //
                let midHeight=Cesium.Cartesian3.fromDegreesArrayHeights([min_lonlat[0],min_lonlat[1],(max_lonlat[2]+min_lonlat[2])/2])[0]
                let midPoint=Cesium.Cartesian3.fromDegreesArrayHeights([(max_lonlat[0]+min_lonlat[0])/2,(max_lonlat[1]+min_lonlat[1])/2,(max_lonlat[2]+min_lonlat[2])/2])[0]
                let height='高度:'+(max_lonlat[2]-min_lonlat[2]).toFixed(2) + 'm'
                let distance=Cesium.Cartesian3.distance(max,min)
                createDistanceLab(midHeight,height)
                createDistanceLab(midPoint,'空间距离:'+distance.toFixed(2) + "m")
                let geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(Cesium.Cartographic.fromCartesian(max), Cesium.Cartographic.fromCartesian(min));
                textDisance='平面距离:'+geodesic.surfaceDistance.toFixed(2) + "m"
                createDistanceLab(vertical,textDisance)
            }
            if(drawingMode != 'triangle'){
                createDistanceLab(activeShapePoints[activeShapePoints.length - 1],textDisance)
            }
            terminateShape()
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


        function terminateShape() {
            that.drawShape(activeShapePoints,drawingMode);
            activeShapePoints.pop()
            OvitCesium.visibility_activeShapePoints = activeShapePoints;
            //callback(activeShapePoints)
            OvitCesium.viewer.entities.remove(floatingPoint);
            OvitCesium.viewer.entities.remove(activeShape);
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        }
        //画点
        function createPoint(worldPosition) {
            var point = OvitCesium.viewer.entities.add({
                position: worldPosition,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                }
            });
            return point;
        }
        //增加结束时候的实体lab
        function createDistanceLab(Coordinatepoint,text) {
            OvitCesium.viewer.entities.add({
                name: '空间测量',
                // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
                position: Coordinatepoint,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: text,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        }
    },

    //绘制路线
    drawRoute_old(stepLength, callback){
        // debugger
        if(!stepLength){
            stepLength=10
        }
        stepLength=stepLength/1000
        // if (OvitCesium.viewer.entities) {
        //     OvitCesium.viewer.entities.removeAll();
        // }
        let activeShapePoints = [];
        let activeShape;
        let floatingPoint;
        let meatruePointArr=[]
        let surplus=0
        let handler = new Cesium.ScreenSpaceEventHandler(OvitCesium.viewer.canvas);
        //左键点击获取坐标，且获取第一个坐标值
        handler.setInputAction(function (event) { //鼠标左键单击事件
            let earthPosition = OvitCesium.viewer.scene.pickPosition(event.position);
            if (Cesium.defined(earthPosition)) {
                floatingPoint = createPoint(earthPosition); //悬浮点位
                activeShapePoints.push(earthPosition);
                let dynamicPositions = new Cesium.CallbackProperty(function () {
                    return activeShapePoints;
                }, false);
                activeShape = drawLine(dynamicPositions,Cesium.Color.GREEN);

                //活动点
                activeShapePoints.push(earthPosition);
                createPoint(earthPosition);
                var cartographic = Cesium.Cartographic.fromCartesian(earthPosition); //世界坐标转地理坐标（弧度）
                var earthPosition_lonlat = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height]; //地理坐标（弧度）转经纬度坐标
                meatruePointArr.push(earthPosition_lonlat);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function (event) { //鼠标移动时实时获取坐标
            OvitCesium.viewer.camera.zoomIn(0.001); //重新渲染
            if (Cesium.defined(floatingPoint)) {
                let newPosition = OvitCesium.viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        handler.setInputAction(function () { //左键双击结束
            OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); //解锁视角锁定
            OvitCesium.viewer.trackedEntity = undefined;
            meatruePointArr.pop()
            if(meatruePointArr.length==1){
                var point=Cesium.Cartesian3.fromDegreesArrayHeights(meatruePointArr[0])[0]
                callback([point])
                terminateShape()
                return
            }
            var routeCoord=getRouteCoord(stepLength, { units: 'kilometers' })
            //debugger
            var points=[]
            for (var i = 0; i <= routeCoord.length-1; i++) {
                var point = Cesium.Cartesian3.fromDegreesArrayHeights(routeCoord[i])[0]
                points.push(point)
            }
            callback(points)
            terminateShape()
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        function getRouteCoord(stepLength,units) {
            var newRouteCoords = [];
            for (let i = 0; i < meatruePointArr.length - 1; i++) {
                var from = turf.point(meatruePointArr[i]);
                var to = turf.point(meatruePointArr[i + 1]);
                if (i == 0) {
                    newRouteCoords.push(meatruePointArr[i])
                }else{
                    if(surplus==0){
                        newRouteCoords.push(meatruePointArr[i])
                    }else{
                        var route = turf.lineString([from.geometry.coordinates, to.geometry.coordinates])
                        var point=turf.along(route, (stepLength-surplus), { units: 'kilometers' });
                        point.geometry.coordinates.push(meatruePointArr[i][2])
                        from=turf.point(point.geometry.coordinates)
                        newRouteCoords.push(point.geometry.coordinates)
                    }
                }
                let Distance = turf.distance(from, to, units);
                if (Distance > stepLength) {
                    let rings = lineMore(from, to, Distance, stepLength)
                    //debugger
                    newRouteCoords = newRouteCoords.concat(rings)
                    if(i==meatruePointArr.length-2){
                        newRouteCoords.push(meatruePointArr[i + 1])
                    }
                } else {
                    newRouteCoords.push(meatruePointArr[i + 1])
                }
            }
            return newRouteCoords
        }

        function lineMore(from, to, distance, stepLength) {
            var step = parseInt(distance / stepLength)
            surplus = distance - step * stepLength
            var rings = []
            var route = turf.lineString([from.geometry.coordinates, to.geometry.coordinates])
            for (let i = 1; i <= step; i++) {
                let nlength = i * stepLength
                let pnt = turf.along(route, nlength, { units: 'kilometers' });
                pnt.geometry.coordinates.push(meatruePointArr[0][2])
                rings.push(pnt.geometry.coordinates)
            }
            if (surplus > 0) {
                // rings.push(to.geometry.coordinates)
            }
            return rings
        }

        function terminateShape() {
            drawLine(activeShapePoints,Cesium.Color.GREEN)
            activeShapePoints.pop()
            OvitCesium.visibility_activeShapePoints = activeShapePoints;
            OvitCesium.viewer.entities.remove(floatingPoint);
            OvitCesium.viewer.entities.remove(activeShape);
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        }

        // 绘制线
        function drawLine(points, color) {
            OvitCesium.viewer.entities.add({
                polyline: {
                    positions: points,
                    arcType: Cesium.ArcType.NONE,
                    width: 1,
                    material: color,
                    depthFailMaterial: color
                }
            })
        }

        //画点
        function createPoint(worldPosition) {
            var point = OvitCesium.viewer.entities.add({
                position: worldPosition,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.GREEN,
                }
            });
            return point;
        }
    },

    //通视分析，通过点击交互获取观察点和目标点
    intervisibilityByInteractive(){
        // this.clear_()
        let activeShapePoints = [];
        let activeShape;
        let floatingPoint;
        //
        let targetPoints=[]
        let viewPoint
        let ray
        let i = 0
        let objectsToExclude = []
        //左键点击获取坐标，且获取第一个坐标值
        OvitCesium.handler.setInputAction(function (event) { //鼠标左键单击事件
            if(!viewPoint){
                viewPoint=OvitCesium.viewer.scene.pickPosition(event.position)
                // 排除辅助对象
                objectsToExclude.push(createEntity(viewPoint,Cesium.Color.GREEN,'观察点')); //, modelMatrixPrimitive
                if (Cesium.defined(viewPoint)) {
                    floatingPoint = createEntity(viewPoint,Cesium.Color.RED); //悬浮点位
                    objectsToExclude.push(floatingPoint);
                    activeShapePoints.push(viewPoint);
                    let dynamicPositions = new Cesium.CallbackProperty(function () {
                        return activeShapePoints;
                    }, false);
                    activeShape = drawLine(dynamicPositions,Cesium.Color.GREEN);
                    activeShapePoints.push(viewPoint);
                }
            }else {
                var point_=OvitCesium.viewer.scene.pickPosition(event.position)
                targetPoints.push(point_)
                //添加排除的辅助对象
                objectsToExclude.push(createEntity(point_,Cesium.Color.RED,'目标点'));
                pickFromRay_()
                i++
                OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        OvitCesium.handler.setInputAction(function (event) { //鼠标移动时实时获取坐标
            OvitCesium.viewer.camera.zoomIn(0.001); //重新渲染
            if (Cesium.defined(floatingPoint)) {
                let newPosition = OvitCesium.viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        // var inputAction = {
        //     LEFT_CLICK: true,
        //     MOUSE_MOVE: true,
        //     LEFT_DOUBLE_CLICK: false
        // }
        // this.drawingTools('line', inputAction, (event) => {
        //     switch (event.type) {
        //         case 'LEFT_CLICK': // 鼠标左键单击事件
        //             if (event.position.length === 1) {
        //                 viewPoint = event.position
        //                 objectsToExclude.push(this.drawShape(event.position[0], 'point', Cesium.Color.GREEN, '观察点'));
        //             } else {
        //                 targetPoints.push(event.position)
        //                 objectsToExclude.push(this.drawShape(event.position[event.position.length - 1], 'point', Cesium.Color.RED, '目标点'));
        //                 pickFromRay_()
        //                 i++
        //             }

        //             break;
        //         case 'MOUSE_MOVE': // 鼠标移动时实时获取坐标

        //             break;
        //         default:
        //             break;
        //     }
        // })

        // OvitCesium.handler.setInputAction(() => { // 左键双击结束
        //     OvitCesium.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        //     OvitCesium.viewer.trackedEntity = undefined;
        //     OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //     OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //     OvitCesium.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        // }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        function pickFromRay_() {
            // 计算射线的方向，目标点left 视域点right
            let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPoints[i], viewPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            // 建立射线
            ray = new Cesium.Ray(viewPoint, direction);
            showIntersection(OvitCesium.viewer.scene.drillPickFromRay(ray,null,objectsToExclude), targetPoints[i], viewPoint);
        }

        // 处理交互点
        function showIntersection(result, targetPoint, viewPoint) {
            var finalResult//最终的交互点
            var distance//交互点与观察点的距离（以此为依据剔除异常及多余的点）
            var newResult=[].concat(result)//Object.assign({}, result)
            var tvDistance=Cesium.Cartesian3.distance(targetPoint,viewPoint)
            if (newResult) {
                for(var j=0;j<newResult.length;++j){
                    if(newResult[j].position){
                        //找出离观察点最近的交互点
                        if(!distance){
                            distance=Cesium.Cartesian3.distance(newResult[j].position,viewPoint)
                            finalResult=newResult[j]
                        }else if(Cesium.Cartesian3.distance(newResult[j].position,viewPoint)<distance){
                            distance=Cesium.Cartesian3.distance(newResult[j].position,viewPoint)
                            finalResult=newResult[j]
                        }
                    }
                }
                if(tvDistance<distance){
                    finalResult.position=targetPoint
                }
                if(finalResult){
                    if (finalResult.position) {
                        //根据处理得到的交互点区分可视区域和不可视区域
                        drawLine([finalResult.position, viewPoint], Cesium.Color.GREEN); // 可视区域
                        drawLine([finalResult.position, targetPoint], Cesium.Color.RED); // 不可视区域
                        return
                    } else {
                        drawLine([viewPoint, targetPoint], Cesium.Color.RED);
                        return
                    }
                }
            } else {
                //console.log("result未定义", result)
                drawLine([viewPoint, targetPoint], Cesium.Color.GREEN);
            }
        }

        // 绘制线
        function drawLine(points, color) {
            objectsToExclude.push(OvitCesium.viewer.entities.add({
                polyline: {
                    positions: points,
                    arcType: Cesium.ArcType.NONE,
                    width: 1,
                    material: color,
                    depthFailMaterial: color
                }
            }))
        }
        //添加目标点和观察点的实体
        function createEntity(position,color,text) {
            var point
            if(text){
                point={
                    position: position,
                    point: {
                        pixelSize: 5,
                        color: color,
                    },
                    label: {
                        text: text,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                    }
                }
            }else{
                point={
                    position: position,
                    point: {
                        pixelSize: 5,
                        color: color,
                    }
                }
            }
            var Entity_=OvitCesium.viewer.entities.add(point);
            return Entity_
        }
    },

    //通视分析（不包含点击交互的分析）,一般应用于沿路通视，targetPoints:目标点，viewPoints:观察点，height:视线高度
    intervisibility(targetPoints, viewPoints, height, callback){
        if (OvitCesium.viewer.entities) {
            OvitCesium.viewer.entities.removeAll();
        }
        if(!height){
            height=0
        }
        if(!targetPoints || !viewPoints || targetPoints.length == 0 || viewPoints.length == 0){
            callback({message:'观察点、目标点不可为空'})
            return
        }
        if(targetPoints.length > 1 && viewPoints.lengths > 1){
            callback({message:'通视分析不支持多个观察点对多个目标点'})
            return
        }
        let ray
        let i=0
        let newViewPoints=[]
        let objectsToExclude=[]
        if(height!=0){
            viewPoints.forEach((item)=>{
                var cartographic = Cesium.Cartographic.fromCartesian(item); //世界坐标转地理坐标（弧度）
                var earthPosition_lonlat = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, cartographic.height+height]; //地理坐标（弧度）转经纬度坐标
                var point=Cesium.Cartesian3.fromDegrees(earthPosition_lonlat[0],earthPosition_lonlat[1],earthPosition_lonlat[2])
                //console.log([Cesium.Cartographic.fromCartesian(point).longitude / Math.PI * 180, Cesium.Cartographic.fromCartesian(point).latitude / Math.PI * 180, Cesium.Cartographic.fromCartesian(point).height])
                //debugger
                newViewPoints.push(point)
            })
        }else{
            newViewPoints=viewPoints
        }
        if(targetPoints.length==1){
            // 排除碰撞监测的对象
            objectsToExclude.push(createEntity(targetPoints[0],Cesium.Color.RED,'目标点'));
            for(i=0;i<newViewPoints.length;i++){
                objectsToExclude.push(createEntity(newViewPoints[i],Cesium.Color.GREEN,'观察点'+Number(i+1)));
                pickFromRay_(targetPoints[0],newViewPoints[i])
            }
        }

        if(newViewPoints.length==1){
            // 排除碰撞监测的对象
            objectsToExclude.push(createEntity(newViewPoints[0],Cesium.Color.GREEN,'观察点'));
            for(i=0;i<targetPoints.length;i++){
                objectsToExclude.push(createEntity(targetPoints[i],Cesium.Color.RED,'目标点'+Number(i+1)));
                pickFromRay_(targetPoints[i],newViewPoints[0])
            }
        }
        //添加目标点和观察点的实体
        function createEntity(position,color,text) {
            var Entity_=OvitCesium.viewer.entities.add({
                position: position,
                point: {
                    pixelSize: 5,
                    color: color,
                },
                label: {
                    text: text,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
            return Entity_
        }

        function pickFromRay_(targetPoint,viewPoint) {
            // 计算射线的方向，目标点left 视域点right
            let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPoint, viewPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            // 建立射线
            ray = new Cesium.Ray(viewPoint, direction);
            showIntersection(OvitCesium.viewer.scene.drillPickFromRay(ray,null,objectsToExclude), targetPoint, viewPoint);
        }

        // 处理交互点
        function showIntersection(result, targetPoint, viewPoint) {
            var finalResult//最终的交互点
            var distance//交互点与观察点的距离（以此为依据剔除异常及多余的点）
            var tvDistance=Cesium.Cartesian3.distance(targetPoint,viewPoint)
            var newResult=[].concat(result)//Object.assign({}, result)
            if (newResult) {
                for(var j=0;j<newResult.length;++j){
                    if(newResult[j].position){
                        //找出离观察点最近的交互点
                        if(!distance){
                            distance=Cesium.Cartesian3.distance(newResult[j].position,viewPoint)
                            finalResult=newResult[j]
                        }else if(Cesium.Cartesian3.distance(newResult[j].position,viewPoint)<distance){
                            distance=Cesium.Cartesian3.distance(newResult[j].position,viewPoint)
                            finalResult=newResult[j]
                        }
                    }
                }
                if(tvDistance<distance){
                    finalResult.position=targetPoint
                }
                if(finalResult){
                    if (finalResult.position) {
                        //根据处理得到的交互点区分可视区域和不可视区域
                        drawLine([finalResult.position, viewPoint], Cesium.Color.GREEN); // 可视区域
                        drawLine([finalResult.position, targetPoint], Cesium.Color.RED); // 不可视区域
                        return
                    } else {
                        drawLine([viewPoint, targetPoint], Cesium.Color.RED);
                        return
                    }
                }
            } else {
                //console.log("result未定义", result)
                drawLine([viewPoint, targetPoint], Cesium.Color.GREEN);
            }
        }

        // 绘制线
        function drawLine(points, color) {
            objectsToExclude.push(OvitCesium.viewer.entities.add({
                polyline: {
                    positions: points,
                    arcType: Cesium.ArcType.NONE,
                    width: 1,
                    material: color,
                    depthFailMaterial: color
                }
            }))
        }
    },

    // 定点环绕
    fixedPointSurround () {
        if (this.exection_fixedPointSurround) {
            this.clearFixedPointSurround()
        }
        if (this.exection_flyAroundThePoint) {
            this.clearFlyAroundThePoint()
        }
        // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
        var pitch = Cesium.Math.toRadians(-10);
        // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
        var angle = 360 / 30;
        // 给定相机距离点多少距离飞行，这里取值为5000m
        var startTime = Cesium.JulianDate.fromDate(new Date());
        var stopTime = Cesium.JulianDate.addSeconds(startTime, 10, new Cesium.JulianDate());

        OvitCesium.viewer.clock.startTime = startTime.clone();  // 开始时间
        OvitCesium.viewer.clock.stopTime = stopTime.clone();     // 结速时间
        OvitCesium.viewer.clock.currentTime = startTime.clone(); // 当前时间
        OvitCesium.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        OvitCesium.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
        // 相机的当前heading
        var initialHeading = OvitCesium.viewer.camera.heading;
        OvitCesium.exection_fixedPointSurround = function TimeExecution() {
            // 当前已经过去的时间，单位s
            var delTime = Cesium.JulianDate.secondsDifference(OvitCesium.viewer.clock.currentTime, OvitCesium.viewer.clock.startTime)
            var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading
            OvitCesium.viewer.camera.setView({
                orientation: {
                    heading : heading,
                    pitch : pitch,
                }
            })
        }
        OvitCesium.viewer.clock.onTick.addEventListener(OvitCesium.exection_fixedPointSurround)
    },
    // 清除定点环绕
    clearFixedPointSurround () {
        if (OvitCesium.exection_fixedPointSurround) {
            OvitCesium.viewer.clock.onTick.removeEventListener(OvitCesium.exection_fixedPointSurround)
            OvitCesium.exection_fixedPointSurround = null
        }
    },
    // 绕点飞行
    flyAroundThePoint () {
        if (this.exection_fixedPointSurround) {
            this.clearFixedPointSurround()
        }
        if (this.exection_flyAroundThePoint) {
            this.clearFlyAroundThePoint()
        }
        // debugger
        // var ellipsoid = OvitCesium.viewer.scene.globe.ellipsoid;
        // var cartesian3 = new Cesium.Cartesian3(-2158525.9164076596, 5016365.337752529, 3284033.278133833);
        // var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        // Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.latitude), Cesium.Math.toDegrees(cartographic.longitude), cartographic.height)
        // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
        var pitch = Cesium.Math.toRadians(-30);
        // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
        var angle = 360 / 30;
        // 给定相机距离点多少距离飞行，这里取值为5000m
        var distance = 1000;
        var startTime = Cesium.JulianDate.fromDate(new Date());
        var stopTime = Cesium.JulianDate.addSeconds(startTime, 10, new Cesium.JulianDate());
        OvitCesium.viewer.clock.startTime = startTime.clone();  // 开始时间
        OvitCesium.viewer.clock.stopTime = stopTime.clone();     // 结速时间
        OvitCesium.viewer.clock.currentTime = startTime.clone(); // 当前时间
        OvitCesium.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        OvitCesium.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
        // 相机的当前heading
        var initialHeading = OvitCesium.viewer.camera.heading;
        OvitCesium.exection_flyAroundThePoint = function TimeExecution() {
                // 当前已经过去的时间，单位s
                var delTime = Cesium.JulianDate.secondsDifference(OvitCesium.viewer.clock.currentTime, OvitCesium.viewer.clock.startTime);
                var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
                OvitCesium.viewer.scene.camera.setView({
                    destination: new Cesium.Cartesian3(-2158525.9164076596, 5016365.337752529, 3284033.278133833), // 点的坐标
                    orientation: {
                        heading: heading,
                        pitch: pitch,
                    }
                });
                OvitCesium.viewer.scene.camera.moveBackward(distance)
        }
        OvitCesium.viewer.clock.onTick.addEventListener(OvitCesium.exection_flyAroundThePoint)
    },
    // 清除绕点飞行
    clearFlyAroundThePoint () {
        OvitCesium.viewer.clock.onTick.removeEventListener(OvitCesium.exection_flyAroundThePoint)
        OvitCesium.exection_flyAroundThePoint = null
    },
    // 指北
    compass () {
        // var direction = OvitCesium.viewer.camera._direction;
        // var x = Cesium.Math.toDegrees(direction.x);
        // var y = Cesium.Math.toDegrees(direction.y);
        // var z = Cesium.Math.toDegrees(direction.z);

        // this.flyToExtend(this.getCurrentExtent())
        OvitCesium.viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(this.getCurrentExtent()[0], this.getCurrentExtent()[1], this.getCurrentExtent()[2], this.getCurrentExtent()[3]),
            // destination: OvitCesium.viewer.camera.position,
            orientation:{
                // 指向
                heading: Cesium.Math.toRadians(0),
                // 视角
                pitch: Cesium.Math.toRadians(-90),
                roll : Cesium.Math.toRadians(0)
            }
        });
        // OvitCesium.viewer.camera.flyTo({
        //     // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
        //     // fromDegrees()方法，将经纬度和高程转换为世界坐标
        //     destination: OvitCesium.viewer.camera.position,
        //     // orientation:{
        //     //     // 指向
        //     //     heading: Cesium.Math.toRadians(0),
        //     //     // 视角
        //     //     pitch: Cesium.Math.toRadians(-45),
        //     //     roll : 0.0
        //     // }
        // })
    },
    getCurrentExtent () {
        //获取当前三维地图范围
        var Rectangle = OvitCesium.viewer.camera.computeViewRectangle();
        //地理坐标（弧度）转经纬度坐标
        var extent = [Rectangle.west / Math.PI * 180, Rectangle.south / Math.PI * 180, Rectangle.east / Math.PI * 180, Rectangle.north / Math.PI * 180];
        return extent;
    },
    /**三维定位
     * @description:
     * @param {type}
     * @return:
     */
    flyTo3DTiles (tileset) {
        // OvitCesium.viewer.camera.flyTo({
        //   destination: Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax), //给地图显示页定位
        //   orientation: { //方向
        //     hending: Cesium.Math.toRadians(0), //前后偏移
        //     pitch: Cesium.Math.toRadians(-90), //上下偏移
        //     roll: Cesium.Math.toRadians(0)
        //   },
        // });
        var initialPosition = {
            offset: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                range: Cesium.Math.toRadians(0)
            }
        };
        OvitCesium.viewer.flyTo(tileset, initialPosition);
    },
    /**三维定位 113.2820546655841 31.191030661491002 6.496194387656706
     * @description: flyToPoint
     * @param {type} longitude 经度; latitude 纬度; height 高度;
     * @return:
     */
    flyToPoint (extent) {
        OvitCesium.viewer.camera.flyTo({ //初始化跳转某个地方
            destination: Cesium.Cartesian3.fromDegrees(extent.longitude, extent.latitude,
                extent.height),
            // orientation:{
            //     // 指向
            //     heading: Cesium.Math.toRadians(0),
            //     // 视角
            //     pitch: Cesium.Math.toRadians(-45),
            //     roll : Cesium.Math.toRadians(0)
            // }
        });
    },
    /**三维定位
     * @description: flyToExtend
     * @param {type} extent bbox
     * @return:
     */
    flyToExtend (extent) {
        OvitCesium.viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(extent[0], extent[1], extent[2], extent[3]),
            // orientation:{
            //     // 指向
            //     heading: Cesium.Math.toRadians(0),
            //     // 视角
            //     pitch: Cesium.Math.toRadians(-45),
            //     roll : Cesium.Math.toRadians(0)
            // }
        });
    },
    // 日照分析
    sunshineAnalysis (params) {
        // OvitCesium.viewer.clockViewModel.shouldAnimate = params.show;
        // OvitCesium.viewer.scene.globe.enableLighting = params.show;
		OvitCesium.viewer.shadows = params.show;
        if (!params.show) {
            return
        }
        OvitCesium.viewer.clockViewModel.startTime = Cesium.JulianDate.fromIso8601(new Date(params.startTime).toISOString());
        OvitCesium.viewer.clockViewModel.currentTime = Cesium.JulianDate.fromIso8601(new Date(params.startTime).toISOString());
        OvitCesium.viewer.clockViewModel.stopTime = Cesium.JulianDate.fromIso8601(new Date(params.stopTime).toISOString());
        OvitCesium.viewer.clockViewModel.clockRange = Cesium.ClockRange.LOOP_STOP;
        OvitCesium.viewer.clockViewModel.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
        OvitCesium.viewer.clockViewModel.multiplier = 400;
    },
    //淹没分析
    startFloodAnalysis(ref) {
        //淹没分析
        let floodtemparr = [
          113.28066918039761,
           31.19074921220092,
           -5.165757011237207,
           113.28094746827202,
           31.189347233593047,
           -9.83705470435638,
           113.28324835105374,
           31.18874509150509,
           -2.925326909978875,
           113.28306425606942,
           31.19096378579757,
           -1.8002443003270234,
           113.2806777074462,
           31.19073817958427,
           -5.009356970702657,
           113.28067770813848,
           31.19073817798945,
           -5.008596710566353,
           113.28067770885491,
           31.19073817647053,
           -5.008830070723365
        ]
           OvitCesium.viewer.entities.add({
            type:'flood',
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(floodtemparr),
              extrudedHeight: new Cesium.CallbackProperty(function () { //此处用属性回调函数，直接设置extrudedHeight会导致闪烁。
                if (ref.speedFloo < 1) {
                  ref.waterHeight += 0.02 * ref.speedFloo;
                } else {
                  ref.waterHeight += 0.05 * ref.speedFloo;
                }

                if (ref.waterHeight > ref.targetHeight) {
                  ref.waterHeight = ref.targetHeight; //给个最大值
                }
                return ref.waterHeight

              }, false),
              perPositionHeight: true,
              closeTop: false,
              material: new Cesium.Color.fromCssColorString(ref.color),
            }
          })
          OvitCesium.viewer.camera.zoomIn(0.001);
      },
      ClearEntityByType(val){
        this.getEntityByType(val)
      },
      getEntityByType(val){
          let a = OvitCesium.viewer.entities.values;
          a.forEach(res=>{
              if(res._type&&res._type === val){
                OvitCesium.viewer.entities.remove(res)
              }
          })
      },
      bufferAnalysis(ref){  //缓冲分析
        OvitCesium.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(ref.coordinate[0],ref.coordinate[1],ref.coordinate[2]),
            type: ref.type,
            ellipse: {
            semiMinorAxis: ref.radius,//短半轴
            semiMajorAxis: ref.radius,//长半轴
            height: ref.height,//椭圆高度
            material: new Cesium.Color.fromCssColorString(ref.color),
            outline: true, // height must be set for outline to display
            }
        });
    }

}
