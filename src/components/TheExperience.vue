<script setup lang="js">
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import {reactive, ref, shallowRef, onMounted} from 'vue'
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { OGC3DTile } from '@jdultra/threedtiles';

const state = reactive({
  clearColor: '#82DBC5',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
})

const { onLoop } = useRenderLoop()

const boxRef = shallowRef(null)
const renderer = ref(null)

onLoop(({ elapsed}) => {
  if(boxRef) {
    boxRef.value.rotation.y = elapsed
    boxRef.value.rotation.z = elapsed
  }
})

onMounted(() => {
  const ogc3DTile = new OGC3DTile({
    url: "https://storage.googleapis.com/ogc-3d-tiles/ladybug/tileset.json",
    renderer: renderer
  });
  console.log(renderer)
})
</script>

<template>
  <TresCanvas ref="renderer" v-bind="state">
    <TresPerspectiveCamera :position="[5,5,5]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.5" :color="'red'" />
    <TresMesh ref="boxRef" :position="[0,2,0]">
      <TresBoxGeometry :args="[1,1,1]" />
      <TresMeshNormalMaterial />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" cast-shadow />
    <TresAxesHelper />
    <TresGridHelper :args="[10, 10, 0x444444, 'teal']" />
  </TresCanvas>
</template>
