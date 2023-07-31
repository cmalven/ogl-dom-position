attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;

varying vec2 vUv;
varying vec4 vRandom;
varying vec3 vNormal;

void main() {
    vec3 adjustedPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(adjustedPosition, 1.0);
}
