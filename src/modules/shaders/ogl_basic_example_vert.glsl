attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;

uniform vec2 resolution;
uniform vec2 scrollOffset;
uniform vec2 domWH;
uniform vec2 domXY;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;

varying vec2 vUv;
varying vec4 vRandom;
varying vec3 vNormal;
varying float vDist;

void main() {
    vec2 pixelXY = domXY - scrollOffset + domWH * 0.5;
    pixelXY.y = resolution.y - pixelXY.y;
    pixelXY += position.xy * domWH;
    vec2 xy = pixelXY / resolution * 2.0 - 1.0;
    vUv = uv;
    gl_Position = vec4(xy, 0., 1.0);
}
